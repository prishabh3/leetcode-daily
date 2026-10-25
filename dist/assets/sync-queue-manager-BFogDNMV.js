var ne=Object.defineProperty;var re=(t,o,s)=>o in t?ne(t,o,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[o]=s;var z=(t,o,s)=>re(t,typeof o!="symbol"?o+"":o,s);import{s as b,m as F}from"./chrome-storage-CpCzf1rQ.js";import{s as V,j as B,e as Y,f as L,k as q,l as W,m as le,n as ce,S as Q,a as ue,d as de,g as me,R as G,P as fe,G as ge}from"./profile-validator-DGBXVnCs.js";import{n as pe,a as M,b as ye}from"./languages-BuMkRZv7.js";import{c as he}from"./scheduler-DCZwEqJq.js";const X={intuition:"",keyObservation:"",approach:"",whyItWorks:"",complexityAnalysis:"",edgeCases:"",mistakes:"",simplifiedExplanation:""};function J(t,o){const s={...X,...o};return`# ${t.title||"Problem Notes"}

- **Problem ID**: ${t.id||"N/A"}
- **Difficulty**: ${t.difficulty||"Unknown"}
- **LeetCode URL**: [${t.title||"Problem"}](${t.url||"#"})
- **Tags**: ${(t.tags||[]).join(", ")||"None"}
- **Patterns**: ${(t.patterns||[]).join(", ")||"None"}

---

## 1. Problem Intuition
${s.intuition.trim()||"_No notes recorded yet._"}

## 2. Key Observation
${s.keyObservation.trim()||"_No notes recorded yet._"}

## 3. Algorithm or Approach
${s.approach.trim()||"_No notes recorded yet._"}

## 4. Why the Approach Works
${s.whyItWorks.trim()||"_No notes recorded yet._"}

## 5. Complexity Analysis
${s.complexityAnalysis.trim()||`- **Time Complexity**: ${t.estimatedTimeComplexity||"O(?) (unverified)"}
- **Space Complexity**: ${t.estimatedSpaceComplexity||"O(?) (unverified)"}`}

## 6. Edge Cases
${s.edgeCases.trim()||"_No notes recorded yet._"}

## 7. Mistakes Made During Initial Attempt
${s.mistakes.trim()||"_No mistakes recorded._"}

## 8. Simpler Explanation for Future Revision
${s.simplifiedExplanation.trim()||"_No revision summary recorded._"}
`}function be(t){const o={...X};if(!t)return o;const s=[{key:"intuition",title:"1. Problem Intuition"},{key:"keyObservation",title:"2. Key Observation"},{key:"approach",title:"3. Algorithm or Approach"},{key:"whyItWorks",title:"4. Why the Approach Works"},{key:"complexityAnalysis",title:"5. Complexity Analysis"},{key:"edgeCases",title:"6. Edge Cases"},{key:"mistakes",title:"7. Mistakes Made During Initial Attempt"},{key:"simplifiedExplanation",title:"8. Simpler Explanation for Future Revision"}];for(let e=0;e<s.length;e++){const l=s[e],i=new RegExp(`##\\s+${K(l.title)}`,"i"),a=t.match(i);if(a&&a.index!==void 0){const c=a.index+a[0].length;let r=t.length;if(e+1<s.length){const g=new RegExp(`##\\s+${K(s[e+1].title)}`,"i"),p=t.slice(c).match(g);p&&p.index!==void 0&&(r=c+p.index)}const u=t.slice(c,r).trim();u&&!u.startsWith("_No notes")&&!u.startsWith("_No mistakes")&&(o[l.key]=u)}}return o}function K(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Se(t){return t?t.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`).map(o=>o.trimEnd()).join(`
`).trim():""}async function $e(t){var e;const o=Se(t),s=typeof globalThis<"u"&&((e=globalThis.crypto)!=null&&e.subtle)?globalThis.crypto.subtle:typeof crypto<"u"&&crypto.subtle?crypto.subtle:null;if(s&&typeof s.digest=="function"){const i=new TextEncoder().encode(o),a=await s.digest("SHA-256",i);return Array.from(new Uint8Array(a)).map(r=>r.toString(16).padStart(2,"0")).join("")}return xe(o)}function xe(t){let o=-559038737,s=1103515245;for(let i=0;i<t.length;i++){const a=t.charCodeAt(i);o=Math.imul(o^a,2654435761),s=Math.imul(s^a,1597334677)}o=Math.imul(o^o>>>16,2246822507)^Math.imul(s^s>>>13,3266489909),s=Math.imul(s^s>>>16,2246822507)^Math.imul(o^o>>>13,3266489909);const e=(o>>>0).toString(16).padStart(8,"0"),l=(s>>>0).toString(16).padStart(8,"0");return(e+l).repeat(4).slice(0,64)}async function Z(t,o,s){const e=await $e(t.code),l=V(o);if(!s||!s.submissions)return{isDuplicate:!1,contentHash:e,isUpdateToExistingProblem:!1};if(t.submissionId){const a=s.submissions[t.submissionId];if(a)return{isDuplicate:!0,reason:"SUBMISSION_ID_EXISTS",existingFilePath:a.filePath,matchedKey:t.submissionId}}for(const[a,c]of Object.entries(s.submissions))if(c.slug===t.problemSlug&&c.language===t.language&&c.approachName===l&&c.contentHash===e)return{isDuplicate:!0,reason:"CONTENT_HASH_EXISTS",existingFilePath:c.filePath,matchedKey:a};const i=!!(t.problemId&&s.problems[t.problemId]||s.problems[t.problemSlug]);return{isDuplicate:!1,contentHash:e,isUpdateToExistingProblem:i,existingProblemId:i?t.problemId:void 0}}async function we(t,o){var a;const{owner:s,repo:e,branch:l="main"}=t.rawSettings,i=o.maxRetries??5;for(let c=1;c<=i;c++)try{let r=null;try{r=(await t.rawRequest(`/repos/${s}/${e}/git/ref/heads/${encodeURIComponent(l)}`)).object.sha}catch(y){if(y.status===404){const P=(await t.rawRequest(`/repos/${s}/${e}`)).default_branch;if(P&&P!==l)try{r=(await t.rawRequest(`/repos/${s}/${e}/git/ref/heads/${encodeURIComponent(P)}`)).object.sha,await t.rawRequest(`/repos/${s}/${e}/git/refs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ref:`refs/heads/${l}`,sha:r})})}catch{r=null}}else throw y}if(!r)if(o.files.length>0){const y=o.files[0],C=await t.putSingleFile(y.path,y.content,"chore(init): initial commit for LC-Sync");if(o.files.length===1)return C;r=(await t.rawRequest(`/repos/${s}/${e}/git/ref/heads/${encodeURIComponent(l)}`)).object.sha}else throw new B("No files provided for commit.",400);const g=(await t.rawRequest(`/repos/${s}/${e}/git/commits/${r}`)).tree.sha,p=[];for(const y of o.files){const C=await t.rawRequest(`/repos/${s}/${e}/git/blobs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:y.content,encoding:"utf-8"})});p.push({path:y.path,mode:"100644",type:"blob",sha:C.sha})}const x=await t.rawRequest(`/repos/${s}/${e}/git/trees`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base_tree:g,tree:p})}),w={message:o.message,tree:x.sha,parents:[r]};o.author&&(w.author={name:o.author.name,email:o.author.email,date:o.author.date||new Date().toISOString()}),o.committer?w.committer={name:o.committer.name,email:o.committer.email,date:o.committer.date||new Date().toISOString()}:(a=o.author)!=null&&a.date&&(w.committer={name:o.author.name,email:o.author.email,date:o.author.date});const f=await t.rawRequest(`/repos/${s}/${e}/git/commits`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(w)});return await t.rawRequest(`/repos/${s}/${e}/git/refs/heads/${encodeURIComponent(l)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sha:f.sha,force:!1})}),f.sha}catch(r){const u=(r==null?void 0:r.status)===422||(r==null?void 0:r.message)&&r.message.toLowerCase().includes("not a fast forward");if(((r==null?void 0:r.status)===409||u)&&c<i){const p=Math.pow(2,c-1)*1e3;if(await new Promise(x=>setTimeout(x,p)),u)continue;continue}throw r}throw new B(`Failed to complete atomic commit after ${i} attempts due to conflicts.`,409)}const I="<!-- lc-sync:start -->",D="<!-- lc-sync:end -->";function Ce(t,o={}){const s=o.basePrefix||"solutions",e=Y(o.leetcodeUsername),l=o.cacheBuster||Math.floor(Date.now()/1e3),i=Object.values(t.problems||{}).sort((n,m)=>{const h=parseInt(n.id,10),S=parseInt(m.id,10);return!isNaN(h)&&!isNaN(S)?h-S:n.id.localeCompare(m.id)});let a=0,c=0,r=0;const u={},g={};for(const n of i){n.difficulty==="Easy"?a++:n.difficulty==="Medium"?c++:n.difficulty==="Hard"&&r++;for(const m of n.languages||[]){const h=pe(m),S=h!=="unknown"?h:m;u[S]=(u[S]||0)+1}for(const m of n.tags||[])g[m]=(g[m]||0)+1}const p=Object.entries(u).sort((n,m)=>m[1]-n[1]).map(([n,m])=>`| ${M(n).name} | \`${m}\` |`).join(`
`),x=Object.entries(g).sort((n,m)=>m[1]-n[1]).slice(0,15).map(([n,m])=>`\`${n} (${m})\``).join(" • "),w=i.map(n=>{const m=L(n.id),h=q(n.id,n.slug),S=`[${n.title}](./${s}/${h})`,A=`[Notes](./${s}/${h}/notes.md)`,k=(n.languages||[]).map(N=>`[\`${M(N).name}\`](./${s}/${h}/${N})`).join(", "),R=(n.tags||[]).slice(0,3).join(", ")||"-",v=n.nextReviewDate?`\`${n.nextReviewDate}\``:"-",T=n.lastSyncedAt?n.lastSyncedAt.split("T")[0]:"-";return`| ${m} | ${S} | ${n.difficulty} | ${k} | ${R} | ${A} | ${T} | ${v} |`}),y=[...i].sort((n,m)=>new Date(m.lastSyncedAt||0).getTime()-new Date(n.lastSyncedAt||0).getTime()).slice(0,8).map(n=>{var T;const m=L(n.id),h=q(n.id,n.slug),S=((T=n.languages)==null?void 0:T[0])||"cpp",A=ye(S),k=`[${m}. ${n.title}](./${s}/${h})`,R=(n.languages||[]).map(N=>M(N).name).join(", ")||"C++",v=`[solution.${A}](./${s}/${h}/${S}/solution.${A})`;return`| ${k} | ${n.difficulty} | ${R} | ${v} |`}),C=[`[![Problems Tracked](https://img.shields.io/badge/Problems%20Tracked-${i.length}-blue)]()`];e&&C.push(`[![LeetCode](https://img.shields.io/badge/LeetCode-Profile-orange?logo=leetcode)](${W(e)})`),o.githubUsername&&C.push(`[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?logo=github)](https://github.com/${o.githubUsername})`);let P="";if(e){const n=W(e),m=le(e,l),h=ce(e,l);P=`
## 🔗 LeetCode Profile

[${e}](${n})

## LeetCode Stats

[![LeetCode Stats](${m})](${n})

## Submission Activity

[![LeetCode Heatmap](${h})](${n})
`.trim()}else P=`
## 🔗 LeetCode Profile

[LeetCode](https://leetcode.com)
`.trim();const $=o.githubUsername&&o.repoName?` • [GitHub Solutions Repo](https://github.com/${o.githubUsername}/${o.repoName})`:"";return`
${P}

## 📊 Repository Progress

<p align="center">
  <img src="./assets/progress.svg" alt="LC-Sync Progress" width="450" />
</p>

${C.join(" ")}

- **Distinct Problems Tracked**: **${i.length}**
- **Total Accepted Submissions**: **${t.totalSubmissions}**
- **Repository Solutions & Historical Versions**: **${t.totalSubmissions}**${$}

### 🎯 Difficulty Breakdown
| Difficulty | Solved |
| :--- | :--- |
| 🟢 Easy | **${a}** |
| 🟡 Medium | **${c}** |
| 🔴 Hard | **${r}** |

### 💻 Language Distribution
| Language | Solved Problems |
| :--- | :--- |
${p||"| None | 0 |"}

### 🏷️ Topic Tags
${x||"_No topic tags recorded yet._"}

---

## 📚 Solution Directory

👉 **[Browse All Solutions → ${s}/](./${s}/)**

### Recently Synchronized Problems

| Problem | Difficulty | Language | Solution |
| :--- | :-: | :--- | :--- |
${y.length>0?y.join(`
`):"| No solutions synchronized yet | - | - | - |"}

<details>
<summary><strong>View All Tracked Problems (${i.length})</strong></summary>

| # | Title | Difficulty | Languages | Topics | Notes | Date Solved | Next Revision |
| :-: | :--- | :-: | :--- | :--- | :-: | :-: | :-: |
${w.length>0?w.join(`
`):"| - | No problems tracked yet | - | - | - | - | - | - |"}

</details>

---

_Last synchronized via LC-Sync: \`${t.lastUpdated||new Date().toISOString()}\`_
`}function Pe(t,o,s={}){const e=s.basePrefix||"solutions",l=Ce(o,s),i=`# ⚡ LeetCode Daily

> My LeetCode problem-solving journey — automatically synchronized to GitHub using LC-Sync.
`,a=`
### 📂 Repository Layout

\`\`\`text
├── README.md                # Progress summary & solution index
├── ${e}/               # All problem solutions by question number & title
│   └── 0013-roman-to-integer/
│       ├── cpp/
│       │   └── solution.cpp # Source code by language
│       ├── metadata.json    # Problem metadata and revision schedule
│       └── notes.md         # Learning journal & approach notes
├── data/
│   └── sync-index.json      # Durable sync index and deduplication records
└── assets/
    └── progress.svg         # Locally generated SVG progress summary
\`\`\`

_Automatically synchronized using [LC-Sync](https://github.com/prishabh3/leetcode-daily)._
`;if(!t||!t.includes(I))return`${i}
${I}
${l.trim()}
${D}
${a}`.trim()+`
`;const c=t.indexOf(I),r=t.indexOf(D);if(c===-1||r===-1||r<c)return`${t}

${I}
${l.trim()}
${D}
`;let u=t.slice(0,c);const g=t.slice(r+D.length);return u=u.replace(/##\s*📈?\s*LeetCode Stats[\s\S]*?(?=(?:##\s|<!--\s*lc-sync|$))/gi,""),u=u.replace(/##\s*📅?\s*Submission Activity[\s\S]*?(?=(?:##\s|<!--\s*lc-sync|$))/gi,""),u=u.replace(/\[!\[LeetCode.*?\]\(https:\/\/leetcard\.jacoblin\.cool\/.*?\)\]\(.*?\)\s*/gi,""),u=u.trimEnd()+`

`,`${u}${I}
${l.trim()}
${D}${g}`}function ve(t){const{totalTracked:o,easyCount:s,mediumCount:e,hardCount:l}=t,i=Math.max(1,o),a=Math.round(s/i*100),c=Math.round(e/i*100),r=Math.round(l/i*100),u=380,g=Math.round(s/i*u),p=Math.round(e/i*u),x=Math.round(l/i*u);return`<svg width="450" height="200" viewBox="0 0 450 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="450" height="200" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  
  <!-- Header -->
  <text x="24" y="36" fill="#f0f6fc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="16" font-weight="600">LC-Sync Progress Tracker</text>
  <text x="426" y="36" text-anchor="end" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="12">Tracked: ${o}</text>
  
  <!-- Stacked Progress Bar -->
  <g transform="translate(24, 55)">
    <rect width="${u}" height="10" rx="5" fill="#21262d" />
    <rect x="0" y="0" width="${g}" height="10" rx="5" fill="#238636" />
    <rect x="${g}" y="0" width="${p}" height="10" fill="#d29922" />
    <rect x="${g+p}" y="0" width="${x}" height="10" rx="5" fill="#da3633" />
  </g>
  
  <!-- Statistics Table -->
  <g transform="translate(24, 90)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">
    <!-- Easy -->
    <circle cx="6" cy="6" r="5" fill="#238636" />
    <text x="20" y="10" fill="#c9d1d9" font-size="13">Easy</text>
    <text x="100" y="10" fill="#f0f6fc" font-size="13" font-weight="600">${s}</text>
    <text x="130" y="10" fill="#8b949e" font-size="12">(${a}%)</text>
    
    <!-- Medium -->
    <circle cx="6" cy="36" r="5" fill="#d29922" />
    <text x="20" y="40" fill="#c9d1d9" font-size="13">Medium</text>
    <text x="100" y="40" fill="#f0f6fc" font-size="13" font-weight="600">${e}</text>
    <text x="130" y="40" fill="#8b949e" font-size="12">(${c}%)</text>
    
    <!-- Hard -->
    <circle cx="6" cy="66" r="5" fill="#da3633" />
    <text x="20" y="70" fill="#c9d1d9" font-size="13">Hard</text>
    <text x="100" y="70" fill="#f0f6fc" font-size="13" font-weight="600">${l}</text>
    <text x="130" y="70" fill="#8b949e" font-size="12">(${r}%)</text>
    
    <!-- Summary Divider & Stats -->
    <line x1="220" y1="0" x2="220" y2="76" stroke="#30363d" stroke-width="1" />
    
    <text x="240" y="20" fill="#8b949e" font-size="12">Total Solutions</text>
    <text x="240" y="40" fill="#58a6ff" font-size="18" font-weight="600">${t.totalSubmissions}</text>
    
    <text x="340" y="20" fill="#8b949e" font-size="12">Reviews Completed</text>
    <text x="340" y="40" fill="#3fb950" font-size="18" font-weight="600">${t.reviewsCompleted}</text>
  </g>
  
  <!-- Footer Note -->
  <text x="24" y="185" fill="#6e7681" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="10">Autogenerated by LC-Sync • Personal DSA Archive</text>
</svg>`}async function Ae(t,o){var H;const s=o.rawSettings,e=t.submission,l=V(t.approachName||"solution");let i=await b.getSyncIndex();try{const d=await o.getFileContent(Q);d!=null&&d.content&&(i=JSON.parse(d.content))}catch{}const a=await Z(e,l,i);if(a.isDuplicate)return{success:!0,isDuplicate:!0,filesUpdated:[],error:`Skipped commit: Identical submission already synced at ${a.existingFilePath}`};const c=a.contentHash,r=new Date().toISOString(),u=s.defaultPathPrefix||"solutions",g=L(e.problemId),p=ue(e.problemId,e.problemSlug,e.language,l,u),x=de(e.problemId,e.problemSlug,u),w=me(e.problemId,e.problemSlug,u);let f=null;try{const d=await o.getFileContent(x);d!=null&&d.content&&(f=F(JSON.parse(d.content),g,e.problemSlug))}catch{}f||(f=await b.getProblemMetadata(g)||F(null,g,e.problemSlug));const y=he(t.confidence||f.confidenceRating||3,f.reviewsCount||0,((H=f.reviewHistory[f.reviewHistory.length-1])==null?void 0:H.intervalDays)||0),C={language:e.language,approachName:l,filePath:p,submissionId:e.submissionId,contentHash:c,syncedAt:r,runtime:e.runtime,memory:e.memory,complexity:{time:t.timeComplexity||f.estimatedTimeComplexity||"O(?)",space:t.spaceComplexity||f.estimatedSpaceComplexity||"O(?)"}},P=`${e.language}/${l}`,$={...f,id:g,title:e.problemTitle||f.title,slug:e.problemSlug,url:e.url||f.url,difficulty:e.difficulty!=="Unknown"?e.difficulty:f.difficulty,tags:Array.from(new Set([...f.tags,...t.tags||[]])),patterns:Array.from(new Set([...f.patterns,...t.patterns||[]])),lastSyncedAt:r,solutions:{...f.solutions,[P]:C},confidenceRating:t.confidence,nextReviewDate:y.nextReviewDate,reviewsCount:f.reviewsCount+1,failedRecallCount:f.failedRecallCount+(y.recalled?0:1),reviewHistory:[...f.reviewHistory,y.newReviewRecord],estimatedTimeComplexity:t.timeComplexity||f.estimatedTimeComplexity,estimatedSpaceComplexity:t.spaceComplexity||f.estimatedSpaceComplexity,verifiedComplexity:!1};let n="";try{const d=await o.getFileContent(w);if(d!=null&&d.content){const ae={...be(d.content),...t.notes||{}};n=J($,ae)}}catch{}n||(n=J($,t.notes||{}));const m=e.submissionId||`${e.problemSlug}-${c.slice(0,12)}`,h={problemId:g,slug:e.problemSlug,title:e.problemTitle,difficulty:$.difficulty,language:e.language,approachName:l,submissionId:e.submissionId,contentHash:c,syncedAt:r,filePath:p},S=i.problems[g]||i.problems[e.problemSlug],A=Array.from(new Set([...(S==null?void 0:S.languages)||[],e.language])),k={id:g,title:e.problemTitle,slug:e.problemSlug,difficulty:$.difficulty,languages:A,approachesCount:Object.keys($.solutions).length,lastSyncedAt:r,confidenceRating:t.confidence,nextReviewDate:y.nextReviewDate,tags:$.tags,patterns:$.patterns};i.submissions[m]=h,i.problems[g]=k,i.totalProblems=Object.keys(i.problems).length,i.totalSubmissions=Object.keys(i.submissions).length,i.lastUpdated=r;let R=null;try{const d=await o.getFileContent(G);R=(d==null?void 0:d.content)||null}catch{}for(const d of Object.values(i.submissions))d.filePath&&d.filePath.startsWith("problems/")&&(d.filePath=d.filePath.replace(/^problems\//,`${u}/`));const v=await b.getSettings(),T=Y(v==null?void 0:v.leetcodeProfileUsername),N=Math.floor(new Date(r).getTime()/1e3),ee=Pe(R,i,{repoName:s.repo,githubUsername:s.owner,leetcodeUsername:T||void 0,basePrefix:u,cacheBuster:N});let E=0,O=0,_=0;for(const d of Object.values(i.problems)){d.difficulty==="Easy"?E++:d.difficulty==="Medium"?O++:d.difficulty==="Hard"&&_++;for(const j of d.languages);}const te={totalTracked:i.totalProblems,totalSubmissions:i.totalSubmissions,easyCount:E,mediumCount:O,hardCount:_,reviewsCompleted:$.reviewsCount},se=ve(te),U=[{path:p,content:e.code},{path:x,content:JSON.stringify($,null,2)},{path:w,content:n},{path:Q,content:JSON.stringify(i,null,2)},{path:G,content:ee},{path:fe,content:se}],oe=`feat(leetcode): sync ${e.problemTitle||e.problemSlug} (${e.language.toUpperCase()})`,ie=await we(o,{message:oe,files:U,author:s.authorName&&s.authorEmail?{name:s.authorName,email:s.authorEmail}:void 0});return await b.saveSyncIndex(i),await b.saveProblemMetadata($),{success:!0,isDuplicate:!1,commitSha:ie,filesUpdated:U.map(d=>d.path)}}class Re{constructor(){z(this,"isProcessing",!1)}async enqueue(o,s={}){const e=await b.getSyncQueue(),l=await b.getSyncIndex(),i=s.approachName||"solution",a=await Z(o,i,l);let c="Pending",r;a.isDuplicate&&(c="Synced",r=`Duplicate detected: already synced at ${a.existingFilePath}`);const u={id:`queue-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,submission:o,approachName:i,notes:s.notes,confidence:s.confidence??3,tags:s.tags||[],patterns:s.patterns||[],timeComplexity:s.timeComplexity,spaceComplexity:s.spaceComplexity,status:c,attemptCount:0,maxAttempts:3,error:r,createdAt:new Date().toISOString()};return e.unshift(u),e.length>50&&(e.length=50),await b.saveSyncQueue(e),u}async processQueue(o){if(!this.isProcessing){this.isProcessing=!0;try{const s=o||new ge((await b.getSettings()).github),e=s.rawSettings;if(!e.token||!e.owner||!e.repo)return;const l=await b.getSyncQueue();for(let i=0;i<l.length;i++){const a=l[i];if(!(a.status!=="Pending"&&a.status!=="Failed")){a.status="Syncing",a.lastAttempt=new Date().toISOString(),a.attemptCount+=1,await b.saveSyncQueue(l);try{const c=await Ae(a,s);c.success?(a.status="Synced",a.commitSha=c.commitSha,a.error=c.isDuplicate?c.error:void 0):(a.status=a.attemptCount>=a.maxAttempts?"Needs Attention":"Failed",a.error=c.error||"Unknown sync error")}catch(c){a.error=c.message||"Execution error",a.status=a.attemptCount>=a.maxAttempts?"Needs Attention":"Failed"}await b.saveSyncQueue(l)}}}finally{this.isProcessing=!1}}}async retryItem(o,s){const e=await b.getSyncQueue(),l=e.find(i=>i.id===o);l&&(l.status="Pending",l.error=void 0,await b.saveSyncQueue(e),await this.processQueue(s))}async removeItem(o){const e=(await b.getSyncQueue()).filter(l=>l.id!==o);await b.saveSyncQueue(e)}}const Me=new Re;export{X as E,ve as a,$e as b,Z as c,we as d,J as f,Pe as g,be as p,Me as s};
