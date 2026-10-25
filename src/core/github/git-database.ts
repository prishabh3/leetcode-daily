import { GitHubClient, FileChange } from './client';
import { GitHubError } from './rate-limiter';

export interface AtomicCommitOptions {
  message: string;
  files: FileChange[];
  author?: {
    name: string;
    email: string;
    date?: string; // ISO 8601 string
  };
  committer?: {
    name: string;
    email: string;
    date?: string; // ISO 8601 string
  };
  maxRetries?: number;
}

/**
 * In-memory serialization lock for destination branch writes.
 * Serializes all commits on the same repository branch so live sync and historical import
 * cannot race against each other.
 */
class BranchWriteLock {
  private queue = new Map<string, Promise<any>>();

  async acquire<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = this.queue.get(key) || Promise.resolve();
    const chain = previous.then(() => task(), () => task());
    this.queue.set(key, chain);

    try {
      return await chain;
    } finally {
      if (this.queue.get(key) === chain) {
        this.queue.delete(key);
      }
    }
  }
}

export const branchLock = new BranchWriteLock();

/**
 * Fetches the current branch HEAD commit SHA bypassing browser and intermediary HTTP caches.
 */
export async function fetchBranchHead(
  client: GitHubClient,
  owner: string,
  repo: string,
  branch: string
): Promise<string | null> {
  const cacheBuster = Date.now();
  const noCacheHeaders = {
    'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
    Pragma: 'no-cache',
  };

  try {
    const refData = await client.rawRequest(
      `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}?_ts=${cacheBuster}`,
      { headers: noCacheHeaders }
    );
    if (refData?.object?.sha) {
      return refData.object.sha;
    }
    if (Array.isArray(refData) && refData[0]?.object?.sha) {
      return refData[0].object.sha;
    }
  } catch (err: any) {
    if (err.status !== 404) {
      // Try fallback to /git/refs/heads/${branch}
      try {
        const altRef = await client.rawRequest(
          `/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}?_ts=${cacheBuster}`,
          { headers: noCacheHeaders }
        );
        if (Array.isArray(altRef) && altRef[0]?.object?.sha) {
          return altRef[0].object.sha;
        }
        if (altRef?.object?.sha) {
          return altRef.object.sha;
        }
      } catch {
        // continue to 404 check
      }
    }
    if (err.status === 404) {
      return null;
    }
    throw err;
  }
  return null;
}

/**
 * Executes an atomic multi-file commit via Git Database API with concurrency conflict retries
 */
export async function createAtomicCommit(
  client: GitHubClient,
  options: AtomicCommitOptions
): Promise<string> {
  const { owner, repo, branch = 'main' } = client.rawSettings;
  const lockKey = `${owner}/${repo}/${branch}`;

  return branchLock.acquire(lockKey, async () => {
    return executeAtomicCommitInternal(client, options, owner, repo, branch);
  });
}

async function executeAtomicCommitInternal(
  client: GitHubClient,
  options: AtomicCommitOptions,
  owner: string,
  repo: string,
  branch: string
): Promise<string> {
  const maxRetries = options.maxRetries ?? 5;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 1. Get branch reference to find latest commit (bypass cache)
      let baseCommitSha: string | null = await fetchBranchHead(client, owner, repo, branch);

      if (!baseCommitSha) {
        // Branch doesn't exist yet: check if default branch exists or repo is empty
        try {
          const repoData = await client.rawRequest(`/repos/${owner}/${repo}`);
          const defaultBranch = repoData.default_branch;

          if (defaultBranch && defaultBranch !== branch) {
            const defaultSha = await fetchBranchHead(client, owner, repo, defaultBranch);
            if (defaultSha) {
              baseCommitSha = defaultSha;
              await client.rawRequest(`/repos/${owner}/${repo}/git/refs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ref: `refs/heads/${branch}`,
                  sha: baseCommitSha,
                }),
              });
            }
          }
        } catch (initErr: any) {
          if (initErr.status !== 404) throw initErr;
        }
      }

      // If repository has no commits yet (brand new empty repository)
      if (!baseCommitSha) {
        if (options.files.length > 0) {
          const first = options.files[0];
          const initialSha = await client.putSingleFile(
            first.path,
            first.content,
            `chore(init): initial commit for LC-Sync`
          );
          if (options.files.length === 1) {
            return initialSha;
          }
          baseCommitSha = await fetchBranchHead(client, owner, repo, branch);
          if (!baseCommitSha) {
            throw new GitHubError('Failed to initialize branch head for empty repository.', 500);
          }
        } else {
          throw new GitHubError('No files provided for commit.', 400);
        }
      }

      // 2. Get base tree SHA from fresh base commit
      const baseCommit = await client.rawRequest(
        `/repos/${owner}/${repo}/git/commits/${baseCommitSha}`
      );
      const baseTreeSha = baseCommit.tree.sha;

      // 3. Create blobs for each file
      const treeItems: Array<{
        path: string;
        mode: string;
        type: 'blob';
        sha: string;
      }> = [];

      for (const file of options.files) {
        const blobRes = await client.rawRequest(`/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: file.content,
            encoding: 'utf-8',
          }),
        });
        treeItems.push({
          path: file.path,
          mode: '100644', // standard file mode
          type: 'blob',
          sha: blobRes.sha,
        });
      }

      // 4. Create new Git tree based on fresh base tree
      const newTree = await client.rawRequest(`/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: treeItems,
        }),
      });

      // 5. Create new Git commit with fresh baseCommitSha as parent
      const commitBody: Record<string, any> = {
        message: options.message,
        tree: newTree.sha,
        parents: [baseCommitSha],
      };

      if (options.author) {
        commitBody.author = {
          name: options.author.name,
          email: options.author.email,
          date: options.author.date || new Date().toISOString(),
        };
      }

      if (options.committer) {
        commitBody.committer = {
          name: options.committer.name,
          email: options.committer.email,
          date: options.committer.date || new Date().toISOString(),
        };
      } else if (options.author?.date) {
        commitBody.committer = {
          name: options.author.name,
          email: options.author.email,
          date: options.author.date,
        };
      }

      const newCommit = await client.rawRequest(`/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commitBody),
      });

      // 6. Update branch reference to point to new commit
      try {
        await client.rawRequest(
          `/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sha: newCommit.sha,
              force: false,
            }),
          }
        );
      } catch (patchErr: any) {
        // Before concluding failure, verify if the branch was actually updated
        const confirmedHead = await fetchBranchHead(client, owner, repo, branch);
        if (confirmedHead === newCommit.sha) {
          return newCommit.sha;
        }
        throw patchErr;
      }

      return newCommit.sha;
    } catch (err: any) {
      const isNonFastForward =
        err?.status === 422 ||
        (err?.message && err.message.toLowerCase().includes('not a fast forward'));

      const isConflict = err?.status === 409 || isNonFastForward;

      if (isConflict && attempt < maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.warn(
          `[createAtomicCommit] Attempt ${attempt} failed with non-fast-forward conflict. Retrying in ${backoffMs}ms with refreshed branch HEAD...`
        );
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }
      throw err;
    }
  }

  throw new GitHubError(
    `Failed to complete atomic commit on '${branch}' after ${maxRetries} attempts due to non-fast-forward conflicts.`,
    409
  );
}
