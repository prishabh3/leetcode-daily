var Z=Object.defineProperty;var ee=(e,o,t)=>o in e?Z(e,o,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[o]=t;var M=(e,o,t)=>ee(e,typeof o!="symbol"?o+"":o,t);import{s as g,m as E}from"./chrome-storage-CD-J4Ae7.js";import{s as F,b as O,f as z,c as te,S as _,a as se,d as oe,g as ie,R as H,P as ae,G as ne}from"./path-sanitizer-BdXHBE1v.js";import{g as j}from"./languages-B95ryBkQ.js";import{c as re}from"./scheduler-DCZwEqJq.js";const q={intuition:"",keyObservation:"",approach:"",whyItWorks:"",complexityAnalysis:"",edgeCases:"",mistakes:"",simplifiedExplanation:""};function L(e,o){const t={...q,...o};return`# ${e.title||"Problem Notes"}

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
`}function le(e){const o={...q};if(!e)return o;const t=[{key:"intuition",title:"1. Problem Intuition"},{key:"keyObservation",title:"2. Key Observation"},{key:"approach",title:"3. Algorithm or Approach"},{key:"whyItWorks",title:"4. Why the Approach Works"},{key:"complexityAnalysis",title:"5. Complexity Analysis"},{key:"edgeCases",title:"6. Edge Cases"},{key:"mistakes",title:"7. Mistakes Made During Initial Attempt"},{key:"simplifiedExplanation",title:"8. Simpler Explanation for Future Revision"}];for(let s=0;s<t.length;s++){const r=t[s],a=new RegExp(`##\\s+${U(r.title)}`,"i"),n=e.match(a);if(n&&n.index!==void 0){const i=n.index+n[0].length;let m=e.length;if(s+1<t.length){const p=new RegExp(`##\\s+${U(t[s+1].title)}`,"i"),y=e.slice(i).match(p);y&&y.index!==void 0&&(m=i+y.index)}const u=e.slice(i,m).trim();u&&!u.startsWith("_No notes")&&!u.startsWith("_No mistakes")&&(o[r.key]=u)}}return o}function U(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function ce(e){return e?e.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`).map(o=>o.trimEnd()).join(`
`).trim():""}async function ue(e){var s;const o=ce(e),t=typeof globalThis<"u"&&((s=globalThis.crypto)!=null&&s.subtle)?globalThis.crypto.subtle:typeof crypto<"u"&&crypto.subtle?crypto.subtle:null;if(t&&typeof t.digest=="function"){const a=new TextEncoder().encode(o),n=await t.digest("SHA-256",a);return Array.from(new Uint8Array(n)).map(m=>m.toString(16).padStart(2,"0")).join("")}return de(o)}function de(e){let o=-559038737,t=1103515245;for(let a=0;a<e.length;a++){const n=e.charCodeAt(a);o=Math.imul(o^n,2654435761),t=Math.imul(t^n,1597334677)}o=Math.imul(o^o>>>16,2246822507)^Math.imul(t^t>>>13,3266489909),t=Math.imul(t^t>>>16,2246822507)^Math.imul(o^o>>>13,3266489909);const s=(o>>>0).toString(16).padStart(8,"0"),r=(t>>>0).toString(16).padStart(8,"0");return(s+r).repeat(4).slice(0,64)}async function B(e,o,t){const s=await ue(e.code),r=F(o);if(!t||!t.submissions)return{isDuplicate:!1,contentHash:s,isUpdateToExistingProblem:!1};if(e.submissionId){const n=t.submissions[e.submissionId];if(n)return{isDuplicate:!0,reason:"SUBMISSION_ID_EXISTS",existingFilePath:n.filePath,matchedKey:e.submissionId}}for(const[n,i]of Object.entries(t.submissions))if(i.slug===e.problemSlug&&i.language===e.language&&i.approachName===r&&i.contentHash===s)return{isDuplicate:!0,reason:"CONTENT_HASH_EXISTS",existingFilePath:i.filePath,matchedKey:n};const a=!!(e.problemId&&t.problems[e.problemId]||t.problems[e.problemSlug]);return{isDuplicate:!1,contentHash:s,isUpdateToExistingProblem:a,existingProblemId:a?e.problemId:void 0}}async function me(e,o){const{owner:t,repo:s,branch:r="main"}=e.rawSettings,a=o.maxRetries??3;for(let n=1;n<=a;n++)try{let i=null;try{i=(await e.rawRequest(`/repos/${t}/${s}/git/ref/heads/${encodeURIComponent(r)}`)).object.sha}catch(f){if(f.status===404){const S=(await e.rawRequest(`/repos/${t}/${s}`)).default_branch;if(S&&S!==r)try{i=(await e.rawRequest(`/repos/${t}/${s}/git/ref/heads/${encodeURIComponent(S)}`)).object.sha,await e.rawRequest(`/repos/${t}/${s}/git/refs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ref:`refs/heads/${r}`,sha:i})})}catch{i=null}}else throw f}if(!i)if(o.files.length>0){const f=o.files[0],x=await e.putSingleFile(f.path,f.content,"chore(init): initial commit for LC-Sync");if(o.files.length===1)return x;i=(await e.rawRequest(`/repos/${t}/${s}/git/ref/heads/${encodeURIComponent(r)}`)).object.sha}else throw new O("No files provided for commit.",400);const u=(await e.rawRequest(`/repos/${t}/${s}/git/commits/${i}`)).tree.sha,p=[];for(const f of o.files){const x=await e.rawRequest(`/repos/${t}/${s}/git/blobs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:f.content,encoding:"utf-8"})});p.push({path:f.path,mode:"100644",type:"blob",sha:x.sha})}const y=await e.rawRequest(`/repos/${t}/${s}/git/trees`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base_tree:u,tree:p})}),c={message:o.message,tree:y.sha,parents:[i]};o.author&&(c.author={name:o.author.name,email:o.author.email,date:new Date().toISOString()});const l=await e.rawRequest(`/repos/${t}/${s}/git/commits`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)});return await e.rawRequest(`/repos/${t}/${s}/git/refs/heads/${encodeURIComponent(r)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sha:l.sha,force:!1})}),l.sha}catch(i){if(((i==null?void 0:i.status)===409||(i==null?void 0:i.status)===422||(i==null?void 0:i.message)&&i.message.toLowerCase().includes("not a fast forward"))&&n<a){const u=Math.pow(2,n)*300;await new Promise(p=>setTimeout(p,u));continue}throw i}throw new O(`Failed to complete atomic commit after ${a} attempts due to conflicts.`,409)}const w="<!-- lc-sync:start -->",$="<!-- lc-sync:end -->";function fe(e,o={}){const t=Object.values(e.problems||{}).sort((c,l)=>{const f=parseInt(c.id,10),x=parseInt(l.id,10);return!isNaN(f)&&!isNaN(x)?f-x:c.id.localeCompare(l.id)});let s=0,r=0,a=0;const n={},i={};for(const c of t){c.difficulty==="Easy"?s++:c.difficulty==="Medium"?r++:c.difficulty==="Hard"&&a++;for(const l of c.languages||[])n[l]=(n[l]||0)+1;for(const l of c.tags||[])i[l]=(i[l]||0)+1}const m=Object.entries(n).sort((c,l)=>l[1]-c[1]).map(([c,l])=>`| ${j(c).name} | \`${l}\` |`).join(`
`),u=Object.entries(i).sort((c,l)=>l[1]-c[1]).slice(0,15).map(([c,l])=>`\`${c} (${l})\``).join(" • "),p=t.map(c=>{const l=z(c.id),f=te(c.id,c.slug),x=`[${c.title}](./problems/${f})`,S=`[Notes](./problems/${f}/notes.md)`,h=(c.languages||[]).map(C=>`[\`${j(C).name}\`](./problems/${f}/${C})`).join(", "),b=(c.tags||[]).slice(0,3).join(", ")||"-",P=c.nextReviewDate?`\`${c.nextReviewDate}\``:"-";return`| ${l} | ${x} | ${c.difficulty} | ${h} | ${b} | ${S} | ${P} |`}),y=o.leetcodeUsername?`[LeetCode Profile](https://leetcode.com/u/${o.leetcodeUsername}/)`:"[LeetCode](https://leetcode.com)";return`
## 📊 Tracked Progress

<p align="center">
  <img src="./assets/progress.svg" alt="LC-Sync Progress" width="450" />
</p>

- **Total Problems Tracked**: **${t.length}**
- **Total Solutions/Approaches**: **${e.totalSubmissions}**
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
${m||"| None | 0 |"}

### 🏷️ Topic Tags
${u||"_No topic tags recorded yet._"}

---

## 📚 Problem Directory (${t.length} Tracked)

| # | Title | Difficulty | Languages | Topics | Notes | Next Revision |
| :-: | :--- | :-: | :--- | :--- | :-: | :-: |
${p.length>0?p.join(`
`):"| - | No problems tracked yet | - | - | - | - | - |"}

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
`;if(!e||!e.includes(w))return`${a}
${w}
${r.trim()}
${$}
${n}`.trim()+`
`;const i=e.indexOf(w),m=e.indexOf($);if(i===-1||m===-1||m<i)return`${e}

${w}
${r.trim()}
${$}
`;const u=e.slice(0,i),p=e.slice(m+$.length);return`${u}${w}
${r.trim()}
${$}${p}`}function ge(e){const{totalTracked:o,easyCount:t,mediumCount:s,hardCount:r}=e,a=Math.max(1,o),n=Math.round(t/a*100),i=Math.round(s/a*100),m=Math.round(r/a*100),u=380,p=Math.round(t/a*u),y=Math.round(s/a*u),c=Math.round(r/a*u);return`<svg width="450" height="200" viewBox="0 0 450 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="450" height="200" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  
  <!-- Header -->
  <text x="24" y="36" fill="#f0f6fc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="16" font-weight="600">LC-Sync Progress Tracker</text>
  <text x="426" y="36" text-anchor="end" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="12">Tracked: ${o}</text>
  
  <!-- Stacked Progress Bar -->
  <g transform="translate(24, 55)">
    <rect width="${u}" height="10" rx="5" fill="#21262d" />
    <rect x="0" y="0" width="${p}" height="10" rx="5" fill="#238636" />
    <rect x="${p}" y="0" width="${y}" height="10" fill="#d29922" />
    <rect x="${p+y}" y="0" width="${c}" height="10" rx="5" fill="#da3633" />
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
    <text x="130" y="70" fill="#8b949e" font-size="12">(${m}%)</text>
    
    <!-- Summary Divider & Stats -->
    <line x1="220" y1="0" x2="220" y2="76" stroke="#30363d" stroke-width="1" />
    
    <text x="240" y="20" fill="#8b949e" font-size="12">Total Solutions</text>
    <text x="240" y="40" fill="#58a6ff" font-size="18" font-weight="600">${e.totalSubmissions}</text>
    
    <text x="340" y="20" fill="#8b949e" font-size="12">Reviews Completed</text>
    <text x="340" y="40" fill="#3fb950" font-size="18" font-weight="600">${e.reviewsCompleted}</text>
  </g>
  
  <!-- Footer Note -->
  <text x="24" y="185" fill="#6e7681" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="10">Autogenerated by LC-Sync • Personal DSA Archive</text>
</svg>`}async function ye(e,o){var I;const t=o.rawSettings,s=e.submission,r=F(e.approachName||"solution");let a=await g.getSyncIndex();try{const d=await o.getFileContent(_);d!=null&&d.content&&(a=JSON.parse(d.content))}catch{}const n=await B(s,r,a);if(n.isDuplicate)return{success:!0,isDuplicate:!0,filesUpdated:[],error:`Skipped commit: Identical submission already synced at ${n.existingFilePath}`};const i=n.contentHash,m=new Date().toISOString(),u=z(s.problemId),p=se(s.problemId,s.problemSlug,s.language,r,t.defaultPathPrefix),y=oe(s.problemId,s.problemSlug,t.defaultPathPrefix),c=ie(s.problemId,s.problemSlug,t.defaultPathPrefix);let l=null;try{const d=await o.getFileContent(y);d!=null&&d.content&&(l=E(JSON.parse(d.content),u,s.problemSlug))}catch{}l||(l=await g.getProblemMetadata(u)||E(null,u,s.problemSlug));const f=re(e.confidence||l.confidenceRating||3,l.reviewsCount||0,((I=l.reviewHistory[l.reviewHistory.length-1])==null?void 0:I.intervalDays)||0),x={language:s.language,approachName:r,filePath:p,submissionId:s.submissionId,contentHash:i,syncedAt:m,runtime:s.runtime,memory:s.memory,complexity:{time:e.timeComplexity||l.estimatedTimeComplexity||"O(?)",space:e.spaceComplexity||l.estimatedSpaceComplexity||"O(?)"}},S=`${s.language}/${r}`,h={...l,id:u,title:s.problemTitle||l.title,slug:s.problemSlug,url:s.url||l.url,difficulty:s.difficulty!=="Unknown"?s.difficulty:l.difficulty,tags:Array.from(new Set([...l.tags,...e.tags||[]])),patterns:Array.from(new Set([...l.patterns,...e.patterns||[]])),lastSyncedAt:m,solutions:{...l.solutions,[S]:x},confidenceRating:e.confidence,nextReviewDate:f.nextReviewDate,reviewsCount:l.reviewsCount+1,failedRecallCount:l.failedRecallCount+(f.recalled?0:1),reviewHistory:[...l.reviewHistory,f.newReviewRecord],estimatedTimeComplexity:e.timeComplexity||l.estimatedTimeComplexity,estimatedSpaceComplexity:e.spaceComplexity||l.estimatedSpaceComplexity,verifiedComplexity:!1};let b="";try{const d=await o.getFileContent(c);if(d!=null&&d.content){const V={...le(d.content),...e.notes||{}};b=L(h,V)}}catch{}b||(b=L(h,e.notes||{}));const P=s.submissionId||`${s.problemSlug}-${i.slice(0,12)}`,C={problemId:u,slug:s.problemSlug,title:s.problemTitle,difficulty:h.difficulty,language:s.language,approachName:r,submissionId:s.submissionId,contentHash:i,syncedAt:m,filePath:p},v=a.problems[u]||a.problems[s.problemSlug],Q=Array.from(new Set([...(v==null?void 0:v.languages)||[],s.language])),W={id:u,title:s.problemTitle,slug:s.problemSlug,difficulty:h.difficulty,languages:Q,approachesCount:Object.keys(h.solutions).length,lastSyncedAt:m,confidenceRating:e.confidence,nextReviewDate:f.nextReviewDate,tags:h.tags,patterns:h.patterns};a.submissions[P]=C,a.problems[u]=W,a.totalProblems=Object.keys(a.problems).length,a.totalSubmissions=Object.keys(a.submissions).length,a.lastUpdated=m;let R=null;try{const d=await o.getFileContent(H);R=(d==null?void 0:d.content)||null}catch{}const J=pe(R,a,{repoName:t.repo});let N=0,T=0,k=0;for(const d of Object.values(a.problems)){d.difficulty==="Easy"?N++:d.difficulty==="Medium"?T++:d.difficulty==="Hard"&&k++;for(const D of d.languages);}const K={totalTracked:a.totalProblems,totalSubmissions:a.totalSubmissions,easyCount:N,mediumCount:T,hardCount:k,reviewsCompleted:h.reviewsCount},G=ge(K),A=[{path:p,content:s.code},{path:y,content:JSON.stringify(h,null,2)},{path:c,content:b},{path:_,content:JSON.stringify(a,null,2)},{path:H,content:J},{path:ae,content:G}],Y=`feat(leetcode): sync ${s.problemTitle||s.problemSlug} (${s.language.toUpperCase()})`,X=await me(o,{message:Y,files:A,author:t.authorName&&t.authorEmail?{name:t.authorName,email:t.authorEmail}:void 0});return await g.saveSyncIndex(a),await g.saveProblemMetadata(h),{success:!0,isDuplicate:!1,commitSha:X,filesUpdated:A.map(d=>d.path)}}class he{constructor(){M(this,"isProcessing",!1)}async enqueue(o,t={}){const s=await g.getSyncQueue(),r=await g.getSyncIndex(),a=t.approachName||"solution",n=await B(o,a,r);let i="Pending",m;n.isDuplicate&&(i="Synced",m=`Duplicate detected: already synced at ${n.existingFilePath}`);const u={id:`queue-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,submission:o,approachName:a,notes:t.notes,confidence:t.confidence??3,tags:t.tags||[],patterns:t.patterns||[],timeComplexity:t.timeComplexity,spaceComplexity:t.spaceComplexity,status:i,attemptCount:0,maxAttempts:3,error:m,createdAt:new Date().toISOString()};return s.unshift(u),s.length>50&&(s.length=50),await g.saveSyncQueue(s),u}async processQueue(o){if(!this.isProcessing){this.isProcessing=!0;try{const t=o||new ne((await g.getSettings()).github),s=t.rawSettings;if(!s.token||!s.owner||!s.repo)return;const r=await g.getSyncQueue();for(let a=0;a<r.length;a++){const n=r[a];if(!(n.status!=="Pending"&&n.status!=="Failed")){n.status="Syncing",n.lastAttempt=new Date().toISOString(),n.attemptCount+=1,await g.saveSyncQueue(r);try{const i=await ye(n,t);i.success?(n.status="Synced",n.commitSha=i.commitSha,n.error=i.isDuplicate?i.error:void 0):(n.status=n.attemptCount>=n.maxAttempts?"Needs Attention":"Failed",n.error=i.error||"Unknown sync error")}catch(i){n.error=i.message||"Execution error",n.status=n.attemptCount>=n.maxAttempts?"Needs Attention":"Failed"}await g.saveSyncQueue(r)}}}finally{this.isProcessing=!1}}}async retryItem(o,t){const s=await g.getSyncQueue(),r=s.find(a=>a.id===o);r&&(r.status="Pending",r.error=void 0,await g.saveSyncQueue(s),await this.processQueue(t))}async removeItem(o){const s=(await g.getSyncQueue()).filter(r=>r.id!==o);await g.saveSyncQueue(s)}}const Ce=new he;export{q as E,ge as a,B as c,L as f,pe as g,le as p,Ce as s};
