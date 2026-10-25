var te=Object.defineProperty;var se=(t,i,s)=>i in t?te(t,i,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[i]=s;var j=(t,i,s)=>se(t,typeof i!="symbol"?i+"":i,s);import{s as h,m as U}from"./chrome-storage-CpCzf1rQ.js";import{s as G,i as z,f as M,j as F,S as q,a as ie,d as oe,g as ae,R as B,P as ne,G as re}from"./path-sanitizer-BgpAHR4o.js";import{g as D,a as le}from"./languages-B95ryBkQ.js";import{c as ce}from"./scheduler-DCZwEqJq.js";const J={intuition:"",keyObservation:"",approach:"",whyItWorks:"",complexityAnalysis:"",edgeCases:"",mistakes:"",simplifiedExplanation:""};function W(t,i){const s={...J,...i};return`# ${t.title||"Problem Notes"}

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
`}function ue(t){const i={...J};if(!t)return i;const s=[{key:"intuition",title:"1. Problem Intuition"},{key:"keyObservation",title:"2. Key Observation"},{key:"approach",title:"3. Algorithm or Approach"},{key:"whyItWorks",title:"4. Why the Approach Works"},{key:"complexityAnalysis",title:"5. Complexity Analysis"},{key:"edgeCases",title:"6. Edge Cases"},{key:"mistakes",title:"7. Mistakes Made During Initial Attempt"},{key:"simplifiedExplanation",title:"8. Simpler Explanation for Future Revision"}];for(let e=0;e<s.length;e++){const l=s[e],o=new RegExp(`##\\s+${Q(l.title)}`,"i"),n=t.match(o);if(n&&n.index!==void 0){const c=n.index+n[0].length;let r=t.length;if(e+1<s.length){const g=new RegExp(`##\\s+${Q(s[e+1].title)}`,"i"),p=t.slice(c).match(g);p&&p.index!==void 0&&(r=c+p.index)}const f=t.slice(c,r).trim();f&&!f.startsWith("_No notes")&&!f.startsWith("_No mistakes")&&(i[l.key]=f)}}return i}function Q(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function de(t){return t?t.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`).map(i=>i.trimEnd()).join(`
`).trim():""}async function me(t){var e;const i=de(t),s=typeof globalThis<"u"&&((e=globalThis.crypto)!=null&&e.subtle)?globalThis.crypto.subtle:typeof crypto<"u"&&crypto.subtle?crypto.subtle:null;if(s&&typeof s.digest=="function"){const o=new TextEncoder().encode(i),n=await s.digest("SHA-256",o);return Array.from(new Uint8Array(n)).map(r=>r.toString(16).padStart(2,"0")).join("")}return fe(i)}function fe(t){let i=-559038737,s=1103515245;for(let o=0;o<t.length;o++){const n=t.charCodeAt(o);i=Math.imul(i^n,2654435761),s=Math.imul(s^n,1597334677)}i=Math.imul(i^i>>>16,2246822507)^Math.imul(s^s>>>13,3266489909),s=Math.imul(s^s>>>16,2246822507)^Math.imul(i^i>>>13,3266489909);const e=(i>>>0).toString(16).padStart(8,"0"),l=(s>>>0).toString(16).padStart(8,"0");return(e+l).repeat(4).slice(0,64)}async function K(t,i,s){const e=await me(t.code),l=G(i);if(!s||!s.submissions)return{isDuplicate:!1,contentHash:e,isUpdateToExistingProblem:!1};if(t.submissionId){const n=s.submissions[t.submissionId];if(n)return{isDuplicate:!0,reason:"SUBMISSION_ID_EXISTS",existingFilePath:n.filePath,matchedKey:t.submissionId}}for(const[n,c]of Object.entries(s.submissions))if(c.slug===t.problemSlug&&c.language===t.language&&c.approachName===l&&c.contentHash===e)return{isDuplicate:!0,reason:"CONTENT_HASH_EXISTS",existingFilePath:c.filePath,matchedKey:n};const o=!!(t.problemId&&s.problems[t.problemId]||s.problems[t.problemSlug]);return{isDuplicate:!1,contentHash:e,isUpdateToExistingProblem:o,existingProblemId:o?t.problemId:void 0}}async function ge(t,i){var n;const{owner:s,repo:e,branch:l="main"}=t.rawSettings,o=i.maxRetries??3;for(let c=1;c<=o;c++)try{let r=null;try{r=(await t.rawRequest(`/repos/${s}/${e}/git/ref/heads/${encodeURIComponent(l)}`)).object.sha}catch(y){if(y.status===404){const w=(await t.rawRequest(`/repos/${s}/${e}`)).default_branch;if(w&&w!==l)try{r=(await t.rawRequest(`/repos/${s}/${e}/git/ref/heads/${encodeURIComponent(w)}`)).object.sha,await t.rawRequest(`/repos/${s}/${e}/git/refs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ref:`refs/heads/${l}`,sha:r})})}catch{r=null}}else throw y}if(!r)if(i.files.length>0){const y=i.files[0],x=await t.putSingleFile(y.path,y.content,"chore(init): initial commit for LC-Sync");if(i.files.length===1)return x;r=(await t.rawRequest(`/repos/${s}/${e}/git/ref/heads/${encodeURIComponent(l)}`)).object.sha}else throw new z("No files provided for commit.",400);const g=(await t.rawRequest(`/repos/${s}/${e}/git/commits/${r}`)).tree.sha,p=[];for(const y of i.files){const x=await t.rawRequest(`/repos/${s}/${e}/git/blobs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:y.content,encoding:"utf-8"})});p.push({path:y.path,mode:"100644",type:"blob",sha:x.sha})}const P=await t.rawRequest(`/repos/${s}/${e}/git/trees`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base_tree:g,tree:p})}),S={message:i.message,tree:P.sha,parents:[r]};i.author&&(S.author={name:i.author.name,email:i.author.email,date:i.author.date||new Date().toISOString()}),i.committer?S.committer={name:i.committer.name,email:i.committer.email,date:i.committer.date||new Date().toISOString()}:(n=i.author)!=null&&n.date&&(S.committer={name:i.author.name,email:i.author.email,date:i.author.date});const d=await t.rawRequest(`/repos/${s}/${e}/git/commits`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(S)});return await t.rawRequest(`/repos/${s}/${e}/git/refs/heads/${encodeURIComponent(l)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sha:d.sha,force:!1})}),d.sha}catch(r){if(((r==null?void 0:r.status)===409||(r==null?void 0:r.status)===422||(r==null?void 0:r.message)&&r.message.toLowerCase().includes("not a fast forward"))&&c<o){const g=Math.pow(2,c)*300;await new Promise(p=>setTimeout(p,g));continue}throw r}throw new z(`Failed to complete atomic commit after ${o} attempts due to conflicts.`,409)}const N="<!-- lc-sync:start -->",I="<!-- lc-sync:end -->";function pe(t,i={}){const s=i.basePrefix||"solutions",e=Object.values(t.problems||{}).sort((a,m)=>{const b=parseInt(a.id,10),$=parseInt(m.id,10);return!isNaN(b)&&!isNaN($)?b-$:a.id.localeCompare(m.id)});let l=0,o=0,n=0;const c={},r={};for(const a of e){a.difficulty==="Easy"?l++:a.difficulty==="Medium"?o++:a.difficulty==="Hard"&&n++;for(const m of a.languages||[])c[m]=(c[m]||0)+1;for(const m of a.tags||[])r[m]=(r[m]||0)+1}const f=Object.entries(c).sort((a,m)=>m[1]-a[1]).map(([a,m])=>`| ${D(a).name} | \`${m}\` |`).join(`
`),g=Object.entries(r).sort((a,m)=>m[1]-a[1]).slice(0,15).map(([a,m])=>`\`${a} (${m})\``).join(" • "),p=e.map(a=>{const m=M(a.id),b=F(a.id,a.slug),$=`[${a.title}](./${s}/${b})`,C=`[Notes](./${s}/${b}/notes.md)`,T=(a.languages||[]).map(v=>`[\`${D(v).name}\`](./${s}/${b}/${v})`).join(", "),k=(a.tags||[]).slice(0,3).join(", ")||"-",A=a.nextReviewDate?`\`${a.nextReviewDate}\``:"-",R=a.lastSyncedAt?a.lastSyncedAt.split("T")[0]:"-";return`| ${m} | ${$} | ${a.difficulty} | ${T} | ${k} | ${C} | ${R} | ${A} |`}),S=[...e].sort((a,m)=>new Date(m.lastSyncedAt||0).getTime()-new Date(a.lastSyncedAt||0).getTime()).slice(0,8).map(a=>{var R;const m=M(a.id),b=F(a.id,a.slug),$=((R=a.languages)==null?void 0:R[0])||"cpp",C=le($),T=`[${m}. ${a.title}](./${s}/${b})`,k=(a.languages||[]).map(v=>D(v).name).join(", ")||"C++",A=`[solution.${C}](./${s}/${b}/${$}/solution.${C})`;return`| ${T} | ${a.difficulty} | ${k} | ${A} |`}),d=[`[![Problems Tracked](https://img.shields.io/badge/Problems%20Tracked-${e.length}-blue)]()`];i.leetcodeUsername&&d.push(`[![LeetCode](https://img.shields.io/badge/LeetCode-Profile-orange?logo=leetcode)](https://leetcode.com/u/${i.leetcodeUsername}/)`),i.githubUsername&&d.push(`[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?logo=github)](https://github.com/${i.githubUsername})`);const y=i.leetcodeUsername?`[LeetCode Profile](https://leetcode.com/u/${i.leetcodeUsername}/)`:"[LeetCode](https://leetcode.com)",x=i.githubUsername&&i.repoName?`[GitHub Solutions Repo](https://github.com/${i.githubUsername}/${i.repoName})`:null,w=x?`${y} • ${x}`:y;return`
## 📊 Progress Summary

<p align="center">
  <img src="./assets/progress.svg" alt="LC-Sync Progress" width="450" />
</p>

${d.join(" ")}

- **Total Problems Tracked**: **${e.length}**
- **Distinct Problems Tracked**: **${e.length}**
- **Total Solutions & Historical Versions**: **${t.totalSubmissions}**
- **Profiles**: ${w}

### 🎯 Difficulty Breakdown
| Difficulty | Solved |
| :--- | :--- |
| 🟢 Easy | **${l}** |
| 🟡 Medium | **${o}** |
| 🔴 Hard | **${n}** |

### 💻 Language Distribution
| Language | Solved Problems |
| :--- | :--- |
${f||"| None | 0 |"}

### 🏷️ Topic Tags
${g||"_No topic tags recorded yet._"}

---

## 📚 Solution Directory

👉 **[Browse All Solutions → ${s}/](./${s}/)**

### Recently Synchronized Problems

| Problem | Difficulty | Language | Solution |
| :--- | :-: | :--- | :--- |
${S.length>0?S.join(`
`):"| No solutions synchronized yet | - | - | - |"}

<details>
<summary><strong>View All Tracked Problems (${e.length})</strong></summary>

| # | Title | Difficulty | Languages | Topics | Notes | Date Solved | Next Revision |
| :-: | :--- | :-: | :--- | :--- | :-: | :-: | :-: |
${p.length>0?p.join(`
`):"| - | No problems tracked yet | - | - | - | - | - | - |"}

</details>

---

_Last synchronized via LC-Sync: \`${t.lastUpdated||new Date().toISOString()}\`_
`}function ye(t,i,s={}){const e=s.basePrefix||"solutions",l=pe(i,s),o=`# ⚡ LeetCode Daily

> My LeetCode problem-solving journey — automatically synchronized to GitHub using LC-Sync.

`,n=`
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
`;if(!t||!t.includes(N))return`${o}
${N}
${l.trim()}
${I}
${n}`.trim()+`
`;const c=t.indexOf(N),r=t.indexOf(I);if(c===-1||r===-1||r<c)return`${t}

${N}
${l.trim()}
${I}
`;const f=t.slice(0,c),g=t.slice(r+I.length);return`${f}${N}
${l.trim()}
${I}${g}`}function he(t){const{totalTracked:i,easyCount:s,mediumCount:e,hardCount:l}=t,o=Math.max(1,i),n=Math.round(s/o*100),c=Math.round(e/o*100),r=Math.round(l/o*100),f=380,g=Math.round(s/o*f),p=Math.round(e/o*f),P=Math.round(l/o*f);return`<svg width="450" height="200" viewBox="0 0 450 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="450" height="200" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  
  <!-- Header -->
  <text x="24" y="36" fill="#f0f6fc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="16" font-weight="600">LC-Sync Progress Tracker</text>
  <text x="426" y="36" text-anchor="end" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="12">Tracked: ${i}</text>
  
  <!-- Stacked Progress Bar -->
  <g transform="translate(24, 55)">
    <rect width="${f}" height="10" rx="5" fill="#21262d" />
    <rect x="0" y="0" width="${g}" height="10" rx="5" fill="#238636" />
    <rect x="${g}" y="0" width="${p}" height="10" fill="#d29922" />
    <rect x="${g+p}" y="0" width="${P}" height="10" rx="5" fill="#da3633" />
  </g>
  
  <!-- Statistics Table -->
  <g transform="translate(24, 90)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">
    <!-- Easy -->
    <circle cx="6" cy="6" r="5" fill="#238636" />
    <text x="20" y="10" fill="#c9d1d9" font-size="13">Easy</text>
    <text x="100" y="10" fill="#f0f6fc" font-size="13" font-weight="600">${s}</text>
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
    <text x="240" y="40" fill="#58a6ff" font-size="18" font-weight="600">${t.totalSubmissions}</text>
    
    <text x="340" y="20" fill="#8b949e" font-size="12">Reviews Completed</text>
    <text x="340" y="40" fill="#3fb950" font-size="18" font-weight="600">${t.reviewsCompleted}</text>
  </g>
  
  <!-- Footer Note -->
  <text x="24" y="185" fill="#6e7681" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="10">Autogenerated by LC-Sync • Personal DSA Archive</text>
</svg>`}async function be(t,i){var L;const s=i.rawSettings,e=t.submission,l=G(t.approachName||"solution");let o=await h.getSyncIndex();try{const u=await i.getFileContent(q);u!=null&&u.content&&(o=JSON.parse(u.content))}catch{}const n=await K(e,l,o);if(n.isDuplicate)return{success:!0,isDuplicate:!0,filesUpdated:[],error:`Skipped commit: Identical submission already synced at ${n.existingFilePath}`};const c=n.contentHash,r=new Date().toISOString(),f=s.defaultPathPrefix||"solutions",g=M(e.problemId),p=ie(e.problemId,e.problemSlug,e.language,l,f),P=oe(e.problemId,e.problemSlug,f),S=ae(e.problemId,e.problemSlug,f);let d=null;try{const u=await i.getFileContent(P);u!=null&&u.content&&(d=U(JSON.parse(u.content),g,e.problemSlug))}catch{}d||(d=await h.getProblemMetadata(g)||U(null,g,e.problemSlug));const y=ce(t.confidence||d.confidenceRating||3,d.reviewsCount||0,((L=d.reviewHistory[d.reviewHistory.length-1])==null?void 0:L.intervalDays)||0),x={language:e.language,approachName:l,filePath:p,submissionId:e.submissionId,contentHash:c,syncedAt:r,runtime:e.runtime,memory:e.memory,complexity:{time:t.timeComplexity||d.estimatedTimeComplexity||"O(?)",space:t.spaceComplexity||d.estimatedSpaceComplexity||"O(?)"}},w=`${e.language}/${l}`,a={...d,id:g,title:e.problemTitle||d.title,slug:e.problemSlug,url:e.url||d.url,difficulty:e.difficulty!=="Unknown"?e.difficulty:d.difficulty,tags:Array.from(new Set([...d.tags,...t.tags||[]])),patterns:Array.from(new Set([...d.patterns,...t.patterns||[]])),lastSyncedAt:r,solutions:{...d.solutions,[w]:x},confidenceRating:t.confidence,nextReviewDate:y.nextReviewDate,reviewsCount:d.reviewsCount+1,failedRecallCount:d.failedRecallCount+(y.recalled?0:1),reviewHistory:[...d.reviewHistory,y.newReviewRecord],estimatedTimeComplexity:t.timeComplexity||d.estimatedTimeComplexity,estimatedSpaceComplexity:t.spaceComplexity||d.estimatedSpaceComplexity,verifiedComplexity:!1};let m="";try{const u=await i.getFileContent(S);if(u!=null&&u.content){const ee={...ue(u.content),...t.notes||{}};m=W(a,ee)}}catch{}m||(m=W(a,t.notes||{}));const b=e.submissionId||`${e.problemSlug}-${c.slice(0,12)}`,$={problemId:g,slug:e.problemSlug,title:e.problemTitle,difficulty:a.difficulty,language:e.language,approachName:l,submissionId:e.submissionId,contentHash:c,syncedAt:r,filePath:p},C=o.problems[g]||o.problems[e.problemSlug],T=Array.from(new Set([...(C==null?void 0:C.languages)||[],e.language])),k={id:g,title:e.problemTitle,slug:e.problemSlug,difficulty:a.difficulty,languages:T,approachesCount:Object.keys(a.solutions).length,lastSyncedAt:r,confidenceRating:t.confidence,nextReviewDate:y.nextReviewDate,tags:a.tags,patterns:a.patterns};o.submissions[b]=$,o.problems[g]=k,o.totalProblems=Object.keys(o.problems).length,o.totalSubmissions=Object.keys(o.submissions).length,o.lastUpdated=r;let A=null;try{const u=await i.getFileContent(B);A=(u==null?void 0:u.content)||null}catch{}for(const u of Object.values(o.submissions))u.filePath&&u.filePath.startsWith("problems/")&&(u.filePath=u.filePath.replace(/^problems\//,`${f}/`));const R=ye(A,o,{repoName:s.repo,basePrefix:f});let v=0,O=0,E=0;for(const u of Object.values(o.problems)){u.difficulty==="Easy"?v++:u.difficulty==="Medium"?O++:u.difficulty==="Hard"&&E++;for(const H of u.languages);}const V={totalTracked:o.totalProblems,totalSubmissions:o.totalSubmissions,easyCount:v,mediumCount:O,hardCount:E,reviewsCompleted:a.reviewsCount},Y=he(V),_=[{path:p,content:e.code},{path:P,content:JSON.stringify(a,null,2)},{path:S,content:m},{path:q,content:JSON.stringify(o,null,2)},{path:B,content:R},{path:ne,content:Y}],X=`feat(leetcode): sync ${e.problemTitle||e.problemSlug} (${e.language.toUpperCase()})`,Z=await ge(i,{message:X,files:_,author:s.authorName&&s.authorEmail?{name:s.authorName,email:s.authorEmail}:void 0});return await h.saveSyncIndex(o),await h.saveProblemMetadata(a),{success:!0,isDuplicate:!1,commitSha:Z,filesUpdated:_.map(u=>u.path)}}class Se{constructor(){j(this,"isProcessing",!1)}async enqueue(i,s={}){const e=await h.getSyncQueue(),l=await h.getSyncIndex(),o=s.approachName||"solution",n=await K(i,o,l);let c="Pending",r;n.isDuplicate&&(c="Synced",r=`Duplicate detected: already synced at ${n.existingFilePath}`);const f={id:`queue-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,submission:i,approachName:o,notes:s.notes,confidence:s.confidence??3,tags:s.tags||[],patterns:s.patterns||[],timeComplexity:s.timeComplexity,spaceComplexity:s.spaceComplexity,status:c,attemptCount:0,maxAttempts:3,error:r,createdAt:new Date().toISOString()};return e.unshift(f),e.length>50&&(e.length=50),await h.saveSyncQueue(e),f}async processQueue(i){if(!this.isProcessing){this.isProcessing=!0;try{const s=i||new re((await h.getSettings()).github),e=s.rawSettings;if(!e.token||!e.owner||!e.repo)return;const l=await h.getSyncQueue();for(let o=0;o<l.length;o++){const n=l[o];if(!(n.status!=="Pending"&&n.status!=="Failed")){n.status="Syncing",n.lastAttempt=new Date().toISOString(),n.attemptCount+=1,await h.saveSyncQueue(l);try{const c=await be(n,s);c.success?(n.status="Synced",n.commitSha=c.commitSha,n.error=c.isDuplicate?c.error:void 0):(n.status=n.attemptCount>=n.maxAttempts?"Needs Attention":"Failed",n.error=c.error||"Unknown sync error")}catch(c){n.error=c.message||"Execution error",n.status=n.attemptCount>=n.maxAttempts?"Needs Attention":"Failed"}await h.saveSyncQueue(l)}}}finally{this.isProcessing=!1}}}async retryItem(i,s){const e=await h.getSyncQueue(),l=e.find(o=>o.id===i);l&&(l.status="Pending",l.error=void 0,await h.saveSyncQueue(e),await this.processQueue(s))}async removeItem(i){const e=(await h.getSyncQueue()).filter(l=>l.id!==i);await h.saveSyncQueue(e)}}const ve=new Se;export{J as E,he as a,me as b,K as c,ge as d,W as f,ye as g,ue as p,ve as s};
