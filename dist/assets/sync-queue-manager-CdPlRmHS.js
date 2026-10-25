var ee=Object.defineProperty;var te=(e,o,t)=>o in e?ee(e,o,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[o]=t;var O=(e,o,t)=>te(e,typeof o!="symbol"?o+"":o,t);import{s as h,m as _}from"./chrome-storage-DazjgBwF.js";import{s as B,i as H,f as Q,j,S as L,a as se,d as oe,g as ie,R as U,P as ae,G as ne}from"./path-sanitizer-BVHarhaw.js";import{g as F}from"./languages-B95ryBkQ.js";import{c as re}from"./scheduler-DCZwEqJq.js";const W={intuition:"",keyObservation:"",approach:"",whyItWorks:"",complexityAnalysis:"",edgeCases:"",mistakes:"",simplifiedExplanation:""};function z(e,o){const t={...W,...o};return`# ${e.title||"Problem Notes"}

- **Problem ID**: ${e.id||"N/A"}
- **Difficulty**: ${e.difficulty||"Unknown"}
- **LeetCode URL**: [${e.title||"Problem"}](${e.url||"#"})
- **Tags**: ${(e.tags||[]).join(", ")||"None"}
- **Patterns**: ${(e.patterns||[]).join(", ")||"None"}

---

## 1. Problem Intuition
${t.intuition.trim()||"_No notes recorded yet._"}

## 2. Key Observation
${t.keyObservation.trim()||"_No notes recorded yet._"}

## 3. Algorithm or Approach
${t.approach.trim()||"_No notes recorded yet._"}

## 4. Why the Approach Works
${t.whyItWorks.trim()||"_No notes recorded yet._"}

## 5. Complexity Analysis
${t.complexityAnalysis.trim()||`- **Time Complexity**: ${e.estimatedTimeComplexity||"O(?) (unverified)"}
- **Space Complexity**: ${e.estimatedSpaceComplexity||"O(?) (unverified)"}`}

## 6. Edge Cases
${t.edgeCases.trim()||"_No notes recorded yet._"}

## 7. Mistakes Made During Initial Attempt
${t.mistakes.trim()||"_No mistakes recorded._"}

## 8. Simpler Explanation for Future Revision
${t.simplifiedExplanation.trim()||"_No revision summary recorded._"}
`}function le(e){const o={...W};if(!e)return o;const t=[{key:"intuition",title:"1. Problem Intuition"},{key:"keyObservation",title:"2. Key Observation"},{key:"approach",title:"3. Algorithm or Approach"},{key:"whyItWorks",title:"4. Why the Approach Works"},{key:"complexityAnalysis",title:"5. Complexity Analysis"},{key:"edgeCases",title:"6. Edge Cases"},{key:"mistakes",title:"7. Mistakes Made During Initial Attempt"},{key:"simplifiedExplanation",title:"8. Simpler Explanation for Future Revision"}];for(let s=0;s<t.length;s++){const r=t[s],a=new RegExp(`##\\s+${q(r.title)}`,"i"),n=e.match(a);if(n&&n.index!==void 0){const i=n.index+n[0].length;let f=e.length;if(s+1<t.length){const g=new RegExp(`##\\s+${q(t[s+1].title)}`,"i"),S=e.slice(i).match(g);S&&S.index!==void 0&&(f=i+S.index)}const c=e.slice(i,f).trim();c&&!c.startsWith("_No notes")&&!c.startsWith("_No mistakes")&&(o[r.key]=c)}}return o}function q(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function ce(e){return e?e.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`).map(o=>o.trimEnd()).join(`
`).trim():""}async function ue(e){var s;const o=ce(e),t=typeof globalThis<"u"&&((s=globalThis.crypto)!=null&&s.subtle)?globalThis.crypto.subtle:typeof crypto<"u"&&crypto.subtle?crypto.subtle:null;if(t&&typeof t.digest=="function"){const a=new TextEncoder().encode(o),n=await t.digest("SHA-256",a);return Array.from(new Uint8Array(n)).map(f=>f.toString(16).padStart(2,"0")).join("")}return de(o)}function de(e){let o=-559038737,t=1103515245;for(let a=0;a<e.length;a++){const n=e.charCodeAt(a);o=Math.imul(o^n,2654435761),t=Math.imul(t^n,1597334677)}o=Math.imul(o^o>>>16,2246822507)^Math.imul(t^t>>>13,3266489909),t=Math.imul(t^t>>>16,2246822507)^Math.imul(o^o>>>13,3266489909);const s=(o>>>0).toString(16).padStart(8,"0"),r=(t>>>0).toString(16).padStart(8,"0");return(s+r).repeat(4).slice(0,64)}async function J(e,o,t){const s=await ue(e.code),r=B(o);if(!t||!t.submissions)return{isDuplicate:!1,contentHash:s,isUpdateToExistingProblem:!1};if(e.submissionId){const n=t.submissions[e.submissionId];if(n)return{isDuplicate:!0,reason:"SUBMISSION_ID_EXISTS",existingFilePath:n.filePath,matchedKey:e.submissionId}}for(const[n,i]of Object.entries(t.submissions))if(i.slug===e.problemSlug&&i.language===e.language&&i.approachName===r&&i.contentHash===s)return{isDuplicate:!0,reason:"CONTENT_HASH_EXISTS",existingFilePath:i.filePath,matchedKey:n};const a=!!(e.problemId&&t.problems[e.problemId]||t.problems[e.problemSlug]);return{isDuplicate:!1,contentHash:s,isUpdateToExistingProblem:a,existingProblemId:a?e.problemId:void 0}}async function me(e,o){const{owner:t,repo:s,branch:r="main"}=e.rawSettings,a=o.maxRetries??3;for(let n=1;n<=a;n++)try{let i=null;try{i=(await e.rawRequest(`/repos/${t}/${s}/git/ref/heads/${encodeURIComponent(r)}`)).object.sha}catch(y){if(y.status===404){const u=(await e.rawRequest(`/repos/${t}/${s}`)).default_branch;if(u&&u!==r)try{i=(await e.rawRequest(`/repos/${t}/${s}/git/ref/heads/${encodeURIComponent(u)}`)).object.sha,await e.rawRequest(`/repos/${t}/${s}/git/refs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ref:`refs/heads/${r}`,sha:i})})}catch{i=null}}else throw y}if(!i)if(o.files.length>0){const y=o.files[0],l=await e.putSingleFile(y.path,y.content,"chore(init): initial commit for LC-Sync");if(o.files.length===1)return l;i=(await e.rawRequest(`/repos/${t}/${s}/git/ref/heads/${encodeURIComponent(r)}`)).object.sha}else throw new H("No files provided for commit.",400);const c=(await e.rawRequest(`/repos/${t}/${s}/git/commits/${i}`)).tree.sha,g=[];for(const y of o.files){const l=await e.rawRequest(`/repos/${t}/${s}/git/blobs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:y.content,encoding:"utf-8"})});g.push({path:y.path,mode:"100644",type:"blob",sha:l.sha})}const S=await e.rawRequest(`/repos/${t}/${s}/git/trees`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base_tree:c,tree:g})}),b={message:o.message,tree:S.sha,parents:[i]};o.author&&(b.author={name:o.author.name,email:o.author.email,date:new Date().toISOString()});const d=await e.rawRequest(`/repos/${t}/${s}/git/commits`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});return await e.rawRequest(`/repos/${t}/${s}/git/refs/heads/${encodeURIComponent(r)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sha:d.sha,force:!1})}),d.sha}catch(i){if(((i==null?void 0:i.status)===409||(i==null?void 0:i.status)===422||(i==null?void 0:i.message)&&i.message.toLowerCase().includes("not a fast forward"))&&n<a){const c=Math.pow(2,n)*300;await new Promise(g=>setTimeout(g,c));continue}throw i}throw new H(`Failed to complete atomic commit after ${a} attempts due to conflicts.`,409)}const C="<!-- lc-sync:start -->",P="<!-- lc-sync:end -->";function fe(e,o={}){const t=Object.values(e.problems||{}).sort((l,u)=>{const p=parseInt(l.id,10),x=parseInt(u.id,10);return!isNaN(p)&&!isNaN(x)?p-x:l.id.localeCompare(u.id)});let s=0,r=0,a=0;const n={},i={};for(const l of t){l.difficulty==="Easy"?s++:l.difficulty==="Medium"?r++:l.difficulty==="Hard"&&a++;for(const u of l.languages||[])n[u]=(n[u]||0)+1;for(const u of l.tags||[])i[u]=(i[u]||0)+1}const f=Object.entries(n).sort((l,u)=>u[1]-l[1]).map(([l,u])=>`| ${F(l).name} | \`${u}\` |`).join(`
`),c=Object.entries(i).sort((l,u)=>u[1]-l[1]).slice(0,15).map(([l,u])=>`\`${l} (${u})\``).join(" • "),g=t.map(l=>{const u=Q(l.id),p=j(l.id,l.slug),x=`[${l.title}](./problems/${p})`,v=`[Notes](./problems/${p}/notes.md)`,R=(l.languages||[]).map($=>`[\`${F($).name}\`](./problems/${p}/${$})`).join(", "),w=(l.tags||[]).slice(0,3).join(", ")||"-",T=l.nextReviewDate?`\`${l.nextReviewDate}\``:"-",A=l.lastSyncedAt?l.lastSyncedAt.split("T")[0]:"-";return`| ${u} | ${x} | ${l.difficulty} | ${R} | ${w} | ${v} | ${A} | ${T} |`}),S=[...t].sort((l,u)=>new Date(u.lastSyncedAt||0).getTime()-new Date(l.lastSyncedAt||0).getTime()).slice(0,5).map(l=>{var p;const u=j(l.id,l.slug);return`- **[${l.title}](./problems/${u})** (${l.difficulty}) — \`${((p=l.lastSyncedAt)==null?void 0:p.split("T")[0])||"Recently"}\``}).join(`
`),b=o.leetcodeUsername?`[LeetCode Profile](https://leetcode.com/u/${o.leetcodeUsername}/)`:"[LeetCode](https://leetcode.com)",d=o.githubUsername&&o.repoName?`[GitHub Solutions Repo](https://github.com/${o.githubUsername}/${o.repoName})`:null,y=d?`${b} • ${d}`:b;return`
## 📊 Tracked Progress

<p align="center">
  <img src="./assets/progress.svg" alt="LC-Sync Progress" width="450" />
</p>

- **Total Problems Tracked**: **${t.length}**
- **Distinct Problems Tracked**: **${t.length}**
- **Total Solutions & Historical Versions**: **${e.totalSubmissions}**
- **Profiles**: ${y}

### 🎯 Difficulty Breakdown
| Difficulty | Problems Tracked |
| :--- | :--- |
| 🟢 Easy | **${s}** |
| 🟡 Medium | **${r}** |
| 🔴 Hard | **${a}** |

### 💻 Language Distribution
| Language | Solved Problems |
| :--- | :--- |
${f||"| None | 0 |"}

### 🏷️ Topic Tags
${c||"_No topic tags recorded yet._"}

${S?`### ⏱️ Recently Solved Problems
${S}
`:""}
---

## 📚 Problem Directory (${t.length} Tracked)

| # | Title | Difficulty | Languages | Topics | Notes | Date Solved | Next Revision |
| :-: | :--- | :-: | :--- | :--- | :-: | :-: | :-: |
${g.length>0?g.join(`
`):"| - | No problems tracked yet | - | - | - | - | - | - |"}

---

_Last synchronized via LC-Sync: \`${e.lastUpdated||new Date().toISOString()}\`_
`}function pe(e,o,t={}){const s=t.repoName||"leetcode-daily",r=fe(o,t),a=`# ${s}

> Automated LeetCode solutions, revision journal, and spaced repetition tracking powered by **LC-Sync**.

`,n=`
## 📂 Repository Layout

\`\`\`text
├── README.md                # Progress dashboard & solution index
├── problems/
│   └── 0001-two-sum/
│       ├── metadata.json    # Problem metadata, review dates & stats
│       ├── notes.md         # Structured approach notes & observations
│       └── cpp/
│           └── solution.cpp # Source code by language & approach
├── data/
│   └── sync-index.json      # Durable sync index and deduplication records
└── assets/
    └── progress.svg         # Deterministic SVG progress summary
\`\`\`
`;if(!e||!e.includes(C))return`${a}
${C}
${r.trim()}
${P}
${n}`.trim()+`
`;const i=e.indexOf(C),f=e.indexOf(P);if(i===-1||f===-1||f<i)return`${e}

${C}
${r.trim()}
${P}
`;const c=e.slice(0,i),g=e.slice(f+P.length);return`${c}${C}
${r.trim()}
${P}${g}`}function ge(e){const{totalTracked:o,easyCount:t,mediumCount:s,hardCount:r}=e,a=Math.max(1,o),n=Math.round(t/a*100),i=Math.round(s/a*100),f=Math.round(r/a*100),c=380,g=Math.round(t/a*c),S=Math.round(s/a*c),b=Math.round(r/a*c);return`<svg width="450" height="200" viewBox="0 0 450 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="450" height="200" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  
  <!-- Header -->
  <text x="24" y="36" fill="#f0f6fc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="16" font-weight="600">LC-Sync Progress Tracker</text>
  <text x="426" y="36" text-anchor="end" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="12">Tracked: ${o}</text>
  
  <!-- Stacked Progress Bar -->
  <g transform="translate(24, 55)">
    <rect width="${c}" height="10" rx="5" fill="#21262d" />
    <rect x="0" y="0" width="${g}" height="10" rx="5" fill="#238636" />
    <rect x="${g}" y="0" width="${S}" height="10" fill="#d29922" />
    <rect x="${g+S}" y="0" width="${b}" height="10" rx="5" fill="#da3633" />
  </g>
  
  <!-- Statistics Table -->
  <g transform="translate(24, 90)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">
    <!-- Easy -->
    <circle cx="6" cy="6" r="5" fill="#238636" />
    <text x="20" y="10" fill="#c9d1d9" font-size="13">Easy</text>
    <text x="100" y="10" fill="#f0f6fc" font-size="13" font-weight="600">${t}</text>
    <text x="130" y="10" fill="#8b949e" font-size="12">(${n}%)</text>
    
    <!-- Medium -->
    <circle cx="6" cy="36" r="5" fill="#d29922" />
    <text x="20" y="40" fill="#c9d1d9" font-size="13">Medium</text>
    <text x="100" y="40" fill="#f0f6fc" font-size="13" font-weight="600">${s}</text>
    <text x="130" y="40" fill="#8b949e" font-size="12">(${i}%)</text>
    
    <!-- Hard -->
    <circle cx="6" cy="66" r="5" fill="#da3633" />
    <text x="20" y="70" fill="#c9d1d9" font-size="13">Hard</text>
    <text x="100" y="70" fill="#f0f6fc" font-size="13" font-weight="600">${r}</text>
    <text x="130" y="70" fill="#8b949e" font-size="12">(${f}%)</text>
    
    <!-- Summary Divider & Stats -->
    <line x1="220" y1="0" x2="220" y2="76" stroke="#30363d" stroke-width="1" />
    
    <text x="240" y="20" fill="#8b949e" font-size="12">Total Solutions</text>
    <text x="240" y="40" fill="#58a6ff" font-size="18" font-weight="600">${e.totalSubmissions}</text>
    
    <text x="340" y="20" fill="#8b949e" font-size="12">Reviews Completed</text>
    <text x="340" y="40" fill="#3fb950" font-size="18" font-weight="600">${e.reviewsCompleted}</text>
  </g>
  
  <!-- Footer Note -->
  <text x="24" y="185" fill="#6e7681" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="10">Autogenerated by LC-Sync • Personal DSA Archive</text>
</svg>`}async function ye(e,o){var M;const t=o.rawSettings,s=e.submission,r=B(e.approachName||"solution");let a=await h.getSyncIndex();try{const m=await o.getFileContent(L);m!=null&&m.content&&(a=JSON.parse(m.content))}catch{}const n=await J(s,r,a);if(n.isDuplicate)return{success:!0,isDuplicate:!0,filesUpdated:[],error:`Skipped commit: Identical submission already synced at ${n.existingFilePath}`};const i=n.contentHash,f=new Date().toISOString(),c=Q(s.problemId),g=se(s.problemId,s.problemSlug,s.language,r,t.defaultPathPrefix),S=oe(s.problemId,s.problemSlug,t.defaultPathPrefix),b=ie(s.problemId,s.problemSlug,t.defaultPathPrefix);let d=null;try{const m=await o.getFileContent(S);m!=null&&m.content&&(d=_(JSON.parse(m.content),c,s.problemSlug))}catch{}d||(d=await h.getProblemMetadata(c)||_(null,c,s.problemSlug));const y=re(e.confidence||d.confidenceRating||3,d.reviewsCount||0,((M=d.reviewHistory[d.reviewHistory.length-1])==null?void 0:M.intervalDays)||0),l={language:s.language,approachName:r,filePath:g,submissionId:s.submissionId,contentHash:i,syncedAt:f,runtime:s.runtime,memory:s.memory,complexity:{time:e.timeComplexity||d.estimatedTimeComplexity||"O(?)",space:e.spaceComplexity||d.estimatedSpaceComplexity||"O(?)"}},u=`${s.language}/${r}`,p={...d,id:c,title:s.problemTitle||d.title,slug:s.problemSlug,url:s.url||d.url,difficulty:s.difficulty!=="Unknown"?s.difficulty:d.difficulty,tags:Array.from(new Set([...d.tags,...e.tags||[]])),patterns:Array.from(new Set([...d.patterns,...e.patterns||[]])),lastSyncedAt:f,solutions:{...d.solutions,[u]:l},confidenceRating:e.confidence,nextReviewDate:y.nextReviewDate,reviewsCount:d.reviewsCount+1,failedRecallCount:d.failedRecallCount+(y.recalled?0:1),reviewHistory:[...d.reviewHistory,y.newReviewRecord],estimatedTimeComplexity:e.timeComplexity||d.estimatedTimeComplexity,estimatedSpaceComplexity:e.spaceComplexity||d.estimatedSpaceComplexity,verifiedComplexity:!1};let x="";try{const m=await o.getFileContent(b);if(m!=null&&m.content){const Z={...le(m.content),...e.notes||{}};x=z(p,Z)}}catch{}x||(x=z(p,e.notes||{}));const v=s.submissionId||`${s.problemSlug}-${i.slice(0,12)}`,R={problemId:c,slug:s.problemSlug,title:s.problemTitle,difficulty:p.difficulty,language:s.language,approachName:r,submissionId:s.submissionId,contentHash:i,syncedAt:f,filePath:g},w=a.problems[c]||a.problems[s.problemSlug],T=Array.from(new Set([...(w==null?void 0:w.languages)||[],s.language])),A={id:c,title:s.problemTitle,slug:s.problemSlug,difficulty:p.difficulty,languages:T,approachesCount:Object.keys(p.solutions).length,lastSyncedAt:f,confidenceRating:e.confidence,nextReviewDate:y.nextReviewDate,tags:p.tags,patterns:p.patterns};a.submissions[v]=R,a.problems[c]=A,a.totalProblems=Object.keys(a.problems).length,a.totalSubmissions=Object.keys(a.submissions).length,a.lastUpdated=f;let $=null;try{const m=await o.getFileContent(U);$=(m==null?void 0:m.content)||null}catch{}const K=pe($,a,{repoName:t.repo});let N=0,k=0,I=0;for(const m of Object.values(a.problems)){m.difficulty==="Easy"?N++:m.difficulty==="Medium"?k++:m.difficulty==="Hard"&&I++;for(const E of m.languages);}const G={totalTracked:a.totalProblems,totalSubmissions:a.totalSubmissions,easyCount:N,mediumCount:k,hardCount:I,reviewsCompleted:p.reviewsCount},Y=ge(G),D=[{path:g,content:s.code},{path:S,content:JSON.stringify(p,null,2)},{path:b,content:x},{path:L,content:JSON.stringify(a,null,2)},{path:U,content:K},{path:ae,content:Y}],V=`feat(leetcode): sync ${s.problemTitle||s.problemSlug} (${s.language.toUpperCase()})`,X=await me(o,{message:V,files:D,author:t.authorName&&t.authorEmail?{name:t.authorName,email:t.authorEmail}:void 0});return await h.saveSyncIndex(a),await h.saveProblemMetadata(p),{success:!0,isDuplicate:!1,commitSha:X,filesUpdated:D.map(m=>m.path)}}class he{constructor(){O(this,"isProcessing",!1)}async enqueue(o,t={}){const s=await h.getSyncQueue(),r=await h.getSyncIndex(),a=t.approachName||"solution",n=await J(o,a,r);let i="Pending",f;n.isDuplicate&&(i="Synced",f=`Duplicate detected: already synced at ${n.existingFilePath}`);const c={id:`queue-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,submission:o,approachName:a,notes:t.notes,confidence:t.confidence??3,tags:t.tags||[],patterns:t.patterns||[],timeComplexity:t.timeComplexity,spaceComplexity:t.spaceComplexity,status:i,attemptCount:0,maxAttempts:3,error:f,createdAt:new Date().toISOString()};return s.unshift(c),s.length>50&&(s.length=50),await h.saveSyncQueue(s),c}async processQueue(o){if(!this.isProcessing){this.isProcessing=!0;try{const t=o||new ne((await h.getSettings()).github),s=t.rawSettings;if(!s.token||!s.owner||!s.repo)return;const r=await h.getSyncQueue();for(let a=0;a<r.length;a++){const n=r[a];if(!(n.status!=="Pending"&&n.status!=="Failed")){n.status="Syncing",n.lastAttempt=new Date().toISOString(),n.attemptCount+=1,await h.saveSyncQueue(r);try{const i=await ye(n,t);i.success?(n.status="Synced",n.commitSha=i.commitSha,n.error=i.isDuplicate?i.error:void 0):(n.status=n.attemptCount>=n.maxAttempts?"Needs Attention":"Failed",n.error=i.error||"Unknown sync error")}catch(i){n.error=i.message||"Execution error",n.status=n.attemptCount>=n.maxAttempts?"Needs Attention":"Failed"}await h.saveSyncQueue(r)}}}finally{this.isProcessing=!1}}}async retryItem(o,t){const s=await h.getSyncQueue(),r=s.find(a=>a.id===o);r&&(r.status="Pending",r.error=void 0,await h.saveSyncQueue(s),await this.processQueue(t))}async removeItem(o){const s=(await h.getSyncQueue()).filter(r=>r.id!==o);await h.saveSyncQueue(s)}}const Ce=new he;export{W as E,ge as a,ue as b,J as c,me as d,z as f,pe as g,le as p,Ce as s};
