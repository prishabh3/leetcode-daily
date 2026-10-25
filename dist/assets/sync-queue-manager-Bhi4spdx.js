var te=Object.defineProperty;var se=(s,o,t)=>o in s?te(s,o,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[o]=t;var j=(s,o,t)=>se(s,typeof o!="symbol"?o+"":o,t);import{s as b,m as U}from"./chrome-storage-CpCzf1rQ.js";import{s as G,i as z,f as M,j as F,S as q,a as oe,d as ae,g as ie,R as B,P as ne,G as re}from"./path-sanitizer-CTgDfxCy.js";import{n as le,a as D,b as ce}from"./languages-BuMkRZv7.js";import{c as ue}from"./scheduler-DCZwEqJq.js";const J={intuition:"",keyObservation:"",approach:"",whyItWorks:"",complexityAnalysis:"",edgeCases:"",mistakes:"",simplifiedExplanation:""};function W(s,o){const t={...J,...o};return`# ${s.title||"Problem Notes"}

- **Problem ID**: ${s.id||"N/A"}
- **Difficulty**: ${s.difficulty||"Unknown"}
- **LeetCode URL**: [${s.title||"Problem"}](${s.url||"#"})
- **Tags**: ${(s.tags||[]).join(", ")||"None"}
- **Patterns**: ${(s.patterns||[]).join(", ")||"None"}

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
${t.complexityAnalysis.trim()||`- **Time Complexity**: ${s.estimatedTimeComplexity||"O(?) (unverified)"}
- **Space Complexity**: ${s.estimatedSpaceComplexity||"O(?) (unverified)"}`}

## 6. Edge Cases
${t.edgeCases.trim()||"_No notes recorded yet._"}

## 7. Mistakes Made During Initial Attempt
${t.mistakes.trim()||"_No mistakes recorded._"}

## 8. Simpler Explanation for Future Revision
${t.simplifiedExplanation.trim()||"_No revision summary recorded._"}
`}function de(s){const o={...J};if(!s)return o;const t=[{key:"intuition",title:"1. Problem Intuition"},{key:"keyObservation",title:"2. Key Observation"},{key:"approach",title:"3. Algorithm or Approach"},{key:"whyItWorks",title:"4. Why the Approach Works"},{key:"complexityAnalysis",title:"5. Complexity Analysis"},{key:"edgeCases",title:"6. Edge Cases"},{key:"mistakes",title:"7. Mistakes Made During Initial Attempt"},{key:"simplifiedExplanation",title:"8. Simpler Explanation for Future Revision"}];for(let e=0;e<t.length;e++){const l=t[e],a=new RegExp(`##\\s+${Q(l.title)}`,"i"),n=s.match(a);if(n&&n.index!==void 0){const c=n.index+n[0].length;let r=s.length;if(e+1<t.length){const g=new RegExp(`##\\s+${Q(t[e+1].title)}`,"i"),p=s.slice(c).match(g);p&&p.index!==void 0&&(r=c+p.index)}const d=s.slice(c,r).trim();d&&!d.startsWith("_No notes")&&!d.startsWith("_No mistakes")&&(o[l.key]=d)}}return o}function Q(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function me(s){return s?s.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`).map(o=>o.trimEnd()).join(`
`).trim():""}async function fe(s){var e;const o=me(s),t=typeof globalThis<"u"&&((e=globalThis.crypto)!=null&&e.subtle)?globalThis.crypto.subtle:typeof crypto<"u"&&crypto.subtle?crypto.subtle:null;if(t&&typeof t.digest=="function"){const a=new TextEncoder().encode(o),n=await t.digest("SHA-256",a);return Array.from(new Uint8Array(n)).map(r=>r.toString(16).padStart(2,"0")).join("")}return ge(o)}function ge(s){let o=-559038737,t=1103515245;for(let a=0;a<s.length;a++){const n=s.charCodeAt(a);o=Math.imul(o^n,2654435761),t=Math.imul(t^n,1597334677)}o=Math.imul(o^o>>>16,2246822507)^Math.imul(t^t>>>13,3266489909),t=Math.imul(t^t>>>16,2246822507)^Math.imul(o^o>>>13,3266489909);const e=(o>>>0).toString(16).padStart(8,"0"),l=(t>>>0).toString(16).padStart(8,"0");return(e+l).repeat(4).slice(0,64)}async function K(s,o,t){const e=await fe(s.code),l=G(o);if(!t||!t.submissions)return{isDuplicate:!1,contentHash:e,isUpdateToExistingProblem:!1};if(s.submissionId){const n=t.submissions[s.submissionId];if(n)return{isDuplicate:!0,reason:"SUBMISSION_ID_EXISTS",existingFilePath:n.filePath,matchedKey:s.submissionId}}for(const[n,c]of Object.entries(t.submissions))if(c.slug===s.problemSlug&&c.language===s.language&&c.approachName===l&&c.contentHash===e)return{isDuplicate:!0,reason:"CONTENT_HASH_EXISTS",existingFilePath:c.filePath,matchedKey:n};const a=!!(s.problemId&&t.problems[s.problemId]||t.problems[s.problemSlug]);return{isDuplicate:!1,contentHash:e,isUpdateToExistingProblem:a,existingProblemId:a?s.problemId:void 0}}async function pe(s,o){var n;const{owner:t,repo:e,branch:l="main"}=s.rawSettings,a=o.maxRetries??5;for(let c=1;c<=a;c++)try{let r=null;try{r=(await s.rawRequest(`/repos/${t}/${e}/git/ref/heads/${encodeURIComponent(l)}`)).object.sha}catch(y){if(y.status===404){const C=(await s.rawRequest(`/repos/${t}/${e}`)).default_branch;if(C&&C!==l)try{r=(await s.rawRequest(`/repos/${t}/${e}/git/ref/heads/${encodeURIComponent(C)}`)).object.sha,await s.rawRequest(`/repos/${t}/${e}/git/refs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ref:`refs/heads/${l}`,sha:r})})}catch{r=null}}else throw y}if(!r)if(o.files.length>0){const y=o.files[0],w=await s.putSingleFile(y.path,y.content,"chore(init): initial commit for LC-Sync");if(o.files.length===1)return w;r=(await s.rawRequest(`/repos/${t}/${e}/git/ref/heads/${encodeURIComponent(l)}`)).object.sha}else throw new z("No files provided for commit.",400);const g=(await s.rawRequest(`/repos/${t}/${e}/git/commits/${r}`)).tree.sha,p=[];for(const y of o.files){const w=await s.rawRequest(`/repos/${t}/${e}/git/blobs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:y.content,encoding:"utf-8"})});p.push({path:y.path,mode:"100644",type:"blob",sha:w.sha})}const x=await s.rawRequest(`/repos/${t}/${e}/git/trees`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base_tree:g,tree:p})}),$={message:o.message,tree:x.sha,parents:[r]};o.author&&($.author={name:o.author.name,email:o.author.email,date:o.author.date||new Date().toISOString()}),o.committer?$.committer={name:o.committer.name,email:o.committer.email,date:o.committer.date||new Date().toISOString()}:(n=o.author)!=null&&n.date&&($.committer={name:o.author.name,email:o.author.email,date:o.author.date});const m=await s.rawRequest(`/repos/${t}/${e}/git/commits`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify($)});return await s.rawRequest(`/repos/${t}/${e}/git/refs/heads/${encodeURIComponent(l)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sha:m.sha,force:!1})}),m.sha}catch(r){const d=(r==null?void 0:r.status)===422||(r==null?void 0:r.message)&&r.message.toLowerCase().includes("not a fast forward");if(((r==null?void 0:r.status)===409||d)&&c<a){const p=Math.pow(2,c-1)*1e3;if(await new Promise(x=>setTimeout(x,p)),d)continue;continue}throw r}throw new z(`Failed to complete atomic commit after ${a} attempts due to conflicts.`,409)}const N="<!-- lc-sync:start -->",I="<!-- lc-sync:end -->";function ye(s,o={}){const t=o.basePrefix||"solutions",e=Object.values(s.problems||{}).sort((i,f)=>{const h=parseInt(i.id,10),S=parseInt(f.id,10);return!isNaN(h)&&!isNaN(S)?h-S:i.id.localeCompare(f.id)});let l=0,a=0,n=0;const c={},r={};for(const i of e){i.difficulty==="Easy"?l++:i.difficulty==="Medium"?a++:i.difficulty==="Hard"&&n++;for(const f of i.languages||[]){const h=le(f),S=h!=="unknown"?h:f;c[S]=(c[S]||0)+1}for(const f of i.tags||[])r[f]=(r[f]||0)+1}const d=Object.entries(c).sort((i,f)=>f[1]-i[1]).map(([i,f])=>`| ${D(i).name} | \`${f}\` |`).join(`
`),g=Object.entries(r).sort((i,f)=>f[1]-i[1]).slice(0,15).map(([i,f])=>`\`${i} (${f})\``).join(" • "),p=e.map(i=>{const f=M(i.id),h=F(i.id,i.slug),S=`[${i.title}](./${t}/${h})`,P=`[Notes](./${t}/${h}/notes.md)`,T=(i.languages||[]).map(v=>`[\`${D(v).name}\`](./${t}/${h}/${v})`).join(", "),k=(i.tags||[]).slice(0,3).join(", ")||"-",R=i.nextReviewDate?`\`${i.nextReviewDate}\``:"-",A=i.lastSyncedAt?i.lastSyncedAt.split("T")[0]:"-";return`| ${f} | ${S} | ${i.difficulty} | ${T} | ${k} | ${P} | ${A} | ${R} |`}),$=[...e].sort((i,f)=>new Date(f.lastSyncedAt||0).getTime()-new Date(i.lastSyncedAt||0).getTime()).slice(0,8).map(i=>{var A;const f=M(i.id),h=F(i.id,i.slug),S=((A=i.languages)==null?void 0:A[0])||"cpp",P=ce(S),T=`[${f}. ${i.title}](./${t}/${h})`,k=(i.languages||[]).map(v=>D(v).name).join(", ")||"C++",R=`[solution.${P}](./${t}/${h}/${S}/solution.${P})`;return`| ${T} | ${i.difficulty} | ${k} | ${R} |`}),m=[`[![Problems Tracked](https://img.shields.io/badge/Problems%20Tracked-${e.length}-blue)]()`];o.leetcodeUsername&&m.push(`[![LeetCode](https://img.shields.io/badge/LeetCode-Profile-orange?logo=leetcode)](https://leetcode.com/u/${o.leetcodeUsername}/)`),o.githubUsername&&m.push(`[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?logo=github)](https://github.com/${o.githubUsername})`);const y=o.leetcodeUsername?`[LeetCode Profile](https://leetcode.com/u/${o.leetcodeUsername}/)`:"[LeetCode](https://leetcode.com)",w=o.githubUsername&&o.repoName?`[GitHub Solutions Repo](https://github.com/${o.githubUsername}/${o.repoName})`:null,C=w?`${y} • ${w}`:y;return`
## 📊 Progress Summary

<p align="center">
  <img src="./assets/progress.svg" alt="LC-Sync Progress" width="450" />
</p>

${m.join(" ")}

- **Total Problems Tracked**: **${e.length}**
- **Distinct Problems Tracked**: **${e.length}**
- **Total Solutions & Historical Versions**: **${s.totalSubmissions}**
- **Profiles**: ${C}

### 🎯 Difficulty Breakdown
| Difficulty | Solved |
| :--- | :--- |
| 🟢 Easy | **${l}** |
| 🟡 Medium | **${a}** |
| 🔴 Hard | **${n}** |

### 💻 Language Distribution
| Language | Solved Problems |
| :--- | :--- |
${d||"| None | 0 |"}

### 🏷️ Topic Tags
${g||"_No topic tags recorded yet._"}

---

## 📚 Solution Directory

👉 **[Browse All Solutions → ${t}/](./${t}/)**

### Recently Synchronized Problems

| Problem | Difficulty | Language | Solution |
| :--- | :-: | :--- | :--- |
${$.length>0?$.join(`
`):"| No solutions synchronized yet | - | - | - |"}

<details>
<summary><strong>View All Tracked Problems (${e.length})</strong></summary>

| # | Title | Difficulty | Languages | Topics | Notes | Date Solved | Next Revision |
| :-: | :--- | :-: | :--- | :--- | :-: | :-: | :-: |
${p.length>0?p.join(`
`):"| - | No problems tracked yet | - | - | - | - | - | - |"}

</details>

---

_Last synchronized via LC-Sync: \`${s.lastUpdated||new Date().toISOString()}\`_
`}function he(s,o,t={}){const e=t.basePrefix||"solutions",l=ye(o,t),n=`# ⚡ LeetCode Daily

> My LeetCode problem-solving journey — automatically synchronized to GitHub using LC-Sync.

${t.leetcodeUsername?`## 📈 LeetCode Stats

[![LeetCode Stats](https://leetcard.jacoblin.cool/${t.leetcodeUsername}?theme=dark&font=Roboto)](https://leetcode.com/u/${t.leetcodeUsername}/)

`:""}`,c=`
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
`;if(!s||!s.includes(N))return`${n}
${N}
${l.trim()}
${I}
${c}`.trim()+`
`;const r=s.indexOf(N),d=s.indexOf(I);if(r===-1||d===-1||d<r)return`${s}

${N}
${l.trim()}
${I}
`;const g=s.slice(0,r),p=s.slice(d+I.length);return`${g}${N}
${l.trim()}
${I}${p}`}function be(s){const{totalTracked:o,easyCount:t,mediumCount:e,hardCount:l}=s,a=Math.max(1,o),n=Math.round(t/a*100),c=Math.round(e/a*100),r=Math.round(l/a*100),d=380,g=Math.round(t/a*d),p=Math.round(e/a*d),x=Math.round(l/a*d);return`<svg width="450" height="200" viewBox="0 0 450 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="450" height="200" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  
  <!-- Header -->
  <text x="24" y="36" fill="#f0f6fc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="16" font-weight="600">LC-Sync Progress Tracker</text>
  <text x="426" y="36" text-anchor="end" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="12">Tracked: ${o}</text>
  
  <!-- Stacked Progress Bar -->
  <g transform="translate(24, 55)">
    <rect width="${d}" height="10" rx="5" fill="#21262d" />
    <rect x="0" y="0" width="${g}" height="10" rx="5" fill="#238636" />
    <rect x="${g}" y="0" width="${p}" height="10" fill="#d29922" />
    <rect x="${g+p}" y="0" width="${x}" height="10" rx="5" fill="#da3633" />
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
    <text x="240" y="40" fill="#58a6ff" font-size="18" font-weight="600">${s.totalSubmissions}</text>
    
    <text x="340" y="20" fill="#8b949e" font-size="12">Reviews Completed</text>
    <text x="340" y="40" fill="#3fb950" font-size="18" font-weight="600">${s.reviewsCompleted}</text>
  </g>
  
  <!-- Footer Note -->
  <text x="24" y="185" fill="#6e7681" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="10">Autogenerated by LC-Sync • Personal DSA Archive</text>
</svg>`}async function Se(s,o){var L;const t=o.rawSettings,e=s.submission,l=G(s.approachName||"solution");let a=await b.getSyncIndex();try{const u=await o.getFileContent(q);u!=null&&u.content&&(a=JSON.parse(u.content))}catch{}const n=await K(e,l,a);if(n.isDuplicate)return{success:!0,isDuplicate:!0,filesUpdated:[],error:`Skipped commit: Identical submission already synced at ${n.existingFilePath}`};const c=n.contentHash,r=new Date().toISOString(),d=t.defaultPathPrefix||"solutions",g=M(e.problemId),p=oe(e.problemId,e.problemSlug,e.language,l,d),x=ae(e.problemId,e.problemSlug,d),$=ie(e.problemId,e.problemSlug,d);let m=null;try{const u=await o.getFileContent(x);u!=null&&u.content&&(m=U(JSON.parse(u.content),g,e.problemSlug))}catch{}m||(m=await b.getProblemMetadata(g)||U(null,g,e.problemSlug));const y=ue(s.confidence||m.confidenceRating||3,m.reviewsCount||0,((L=m.reviewHistory[m.reviewHistory.length-1])==null?void 0:L.intervalDays)||0),w={language:e.language,approachName:l,filePath:p,submissionId:e.submissionId,contentHash:c,syncedAt:r,runtime:e.runtime,memory:e.memory,complexity:{time:s.timeComplexity||m.estimatedTimeComplexity||"O(?)",space:s.spaceComplexity||m.estimatedSpaceComplexity||"O(?)"}},C=`${e.language}/${l}`,i={...m,id:g,title:e.problemTitle||m.title,slug:e.problemSlug,url:e.url||m.url,difficulty:e.difficulty!=="Unknown"?e.difficulty:m.difficulty,tags:Array.from(new Set([...m.tags,...s.tags||[]])),patterns:Array.from(new Set([...m.patterns,...s.patterns||[]])),lastSyncedAt:r,solutions:{...m.solutions,[C]:w},confidenceRating:s.confidence,nextReviewDate:y.nextReviewDate,reviewsCount:m.reviewsCount+1,failedRecallCount:m.failedRecallCount+(y.recalled?0:1),reviewHistory:[...m.reviewHistory,y.newReviewRecord],estimatedTimeComplexity:s.timeComplexity||m.estimatedTimeComplexity,estimatedSpaceComplexity:s.spaceComplexity||m.estimatedSpaceComplexity,verifiedComplexity:!1};let f="";try{const u=await o.getFileContent($);if(u!=null&&u.content){const ee={...de(u.content),...s.notes||{}};f=W(i,ee)}}catch{}f||(f=W(i,s.notes||{}));const h=e.submissionId||`${e.problemSlug}-${c.slice(0,12)}`,S={problemId:g,slug:e.problemSlug,title:e.problemTitle,difficulty:i.difficulty,language:e.language,approachName:l,submissionId:e.submissionId,contentHash:c,syncedAt:r,filePath:p},P=a.problems[g]||a.problems[e.problemSlug],T=Array.from(new Set([...(P==null?void 0:P.languages)||[],e.language])),k={id:g,title:e.problemTitle,slug:e.problemSlug,difficulty:i.difficulty,languages:T,approachesCount:Object.keys(i.solutions).length,lastSyncedAt:r,confidenceRating:s.confidence,nextReviewDate:y.nextReviewDate,tags:i.tags,patterns:i.patterns};a.submissions[h]=S,a.problems[g]=k,a.totalProblems=Object.keys(a.problems).length,a.totalSubmissions=Object.keys(a.submissions).length,a.lastUpdated=r;let R=null;try{const u=await o.getFileContent(B);R=(u==null?void 0:u.content)||null}catch{}for(const u of Object.values(a.submissions))u.filePath&&u.filePath.startsWith("problems/")&&(u.filePath=u.filePath.replace(/^problems\//,`${d}/`));const A=he(R,a,{repoName:t.repo,basePrefix:d});let v=0,O=0,E=0;for(const u of Object.values(a.problems)){u.difficulty==="Easy"?v++:u.difficulty==="Medium"?O++:u.difficulty==="Hard"&&E++;for(const H of u.languages);}const V={totalTracked:a.totalProblems,totalSubmissions:a.totalSubmissions,easyCount:v,mediumCount:O,hardCount:E,reviewsCompleted:i.reviewsCount},Y=be(V),_=[{path:p,content:e.code},{path:x,content:JSON.stringify(i,null,2)},{path:$,content:f},{path:q,content:JSON.stringify(a,null,2)},{path:B,content:A},{path:ne,content:Y}],X=`feat(leetcode): sync ${e.problemTitle||e.problemSlug} (${e.language.toUpperCase()})`,Z=await pe(o,{message:X,files:_,author:t.authorName&&t.authorEmail?{name:t.authorName,email:t.authorEmail}:void 0});return await b.saveSyncIndex(a),await b.saveProblemMetadata(i),{success:!0,isDuplicate:!1,commitSha:Z,filesUpdated:_.map(u=>u.path)}}class $e{constructor(){j(this,"isProcessing",!1)}async enqueue(o,t={}){const e=await b.getSyncQueue(),l=await b.getSyncIndex(),a=t.approachName||"solution",n=await K(o,a,l);let c="Pending",r;n.isDuplicate&&(c="Synced",r=`Duplicate detected: already synced at ${n.existingFilePath}`);const d={id:`queue-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,submission:o,approachName:a,notes:t.notes,confidence:t.confidence??3,tags:t.tags||[],patterns:t.patterns||[],timeComplexity:t.timeComplexity,spaceComplexity:t.spaceComplexity,status:c,attemptCount:0,maxAttempts:3,error:r,createdAt:new Date().toISOString()};return e.unshift(d),e.length>50&&(e.length=50),await b.saveSyncQueue(e),d}async processQueue(o){if(!this.isProcessing){this.isProcessing=!0;try{const t=o||new re((await b.getSettings()).github),e=t.rawSettings;if(!e.token||!e.owner||!e.repo)return;const l=await b.getSyncQueue();for(let a=0;a<l.length;a++){const n=l[a];if(!(n.status!=="Pending"&&n.status!=="Failed")){n.status="Syncing",n.lastAttempt=new Date().toISOString(),n.attemptCount+=1,await b.saveSyncQueue(l);try{const c=await Se(n,t);c.success?(n.status="Synced",n.commitSha=c.commitSha,n.error=c.isDuplicate?c.error:void 0):(n.status=n.attemptCount>=n.maxAttempts?"Needs Attention":"Failed",n.error=c.error||"Unknown sync error")}catch(c){n.error=c.message||"Execution error",n.status=n.attemptCount>=n.maxAttempts?"Needs Attention":"Failed"}await b.saveSyncQueue(l)}}}finally{this.isProcessing=!1}}}async retryItem(o,t){const e=await b.getSyncQueue(),l=e.find(a=>a.id===o);l&&(l.status="Pending",l.error=void 0,await b.saveSyncQueue(e),await this.processQueue(t))}async removeItem(o){const e=(await b.getSyncQueue()).filter(l=>l.id!==o);await b.saveSyncQueue(e)}}const Re=new $e;export{J as E,be as a,fe as b,K as c,pe as d,W as f,he as g,de as p,Re as s};
