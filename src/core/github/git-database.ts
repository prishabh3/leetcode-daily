import { GitHubClient, FileChange } from './client';
import { GitHubError } from './rate-limiter';

export interface AtomicCommitOptions {
  message: string;
  files: FileChange[];
  author?: {
    name: string;
    email: string;
  };
  maxRetries?: number;
}

/**
 * Executes an atomic multi-file commit via Git Database API with concurrency conflict retries
 */
export async function createAtomicCommit(
  client: GitHubClient,
  options: AtomicCommitOptions
): Promise<string> {
  const { owner, repo, branch = 'main' } = client.rawSettings;
  const maxRetries = options.maxRetries ?? 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 1. Get branch reference to find latest commit
      let baseCommitSha: string | null = null;
      try {
        const refData = await client.rawRequest(
          `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`
        );
        baseCommitSha = refData.object.sha;
      } catch (refErr: any) {
        if (refErr.status === 404) {
          // Branch doesn't exist yet: check if default branch exists or repo is empty
          const repoData = await client.rawRequest(`/repos/${owner}/${repo}`);
          const defaultBranch = repoData.default_branch;

          if (defaultBranch && defaultBranch !== branch) {
            try {
              const defaultRef = await client.rawRequest(
                `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(defaultBranch)}`
              );
              baseCommitSha = defaultRef.object.sha;
              // Create the target branch pointing to default branch commit
              await client.rawRequest(`/repos/${owner}/${repo}/git/refs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ref: `refs/heads/${branch}`,
                  sha: baseCommitSha,
                }),
              });
            } catch {
              baseCommitSha = null;
            }
          }
        } else {
          throw refErr;
        }
      }

      // If repository has no commits yet (brand new empty repository)
      if (!baseCommitSha) {
        // Initialize with first file using contents API, which creates the initial commit and branch
        if (options.files.length > 0) {
          const first = options.files[0];
          const initialSha = await client.putSingleFile(
            first.path,
            first.content,
            `chore(init): initial commit for LC-Sync`
          );
          // If only 1 file was needed, we are done
          if (options.files.length === 1) {
            return initialSha;
          }
          // If multiple files, now baseCommitSha exists, continue to commit the rest
          const newRef = await client.rawRequest(
            `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`
          );
          baseCommitSha = newRef.object.sha;
        } else {
          throw new GitHubError('No files provided for commit.', 400);
        }
      }

      // 2. Get base tree SHA from base commit
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

      // 4. Create new Git tree based on base tree
      const newTree = await client.rawRequest(`/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: treeItems,
        }),
      });

      // 5. Create new Git commit
      const commitBody: Record<string, any> = {
        message: options.message,
        tree: newTree.sha,
        parents: [baseCommitSha],
      };

      if (options.author) {
        commitBody.author = {
          name: options.author.name,
          email: options.author.email,
          date: new Date().toISOString(),
        };
      }

      const newCommit = await client.rawRequest(`/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commitBody),
      });

      // 6. Update branch reference to point to new commit
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

      return newCommit.sha;
    } catch (err: any) {
      const isConflict =
        err?.status === 409 ||
        err?.status === 422 ||
        (err?.message && err.message.toLowerCase().includes('not a fast forward'));

      if (isConflict && attempt < maxRetries) {
        // Concurrency conflict: wait with exponential backoff and retry
        const backoffMs = Math.pow(2, attempt) * 300;
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }
      throw err;
    }
  }

  throw new GitHubError(`Failed to complete atomic commit after ${maxRetries} attempts due to conflicts.`, 409);
}
