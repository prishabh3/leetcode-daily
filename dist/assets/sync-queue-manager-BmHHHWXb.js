var re=Object.defineProperty;var ce=(s,i,t)=>i in s?re(s,i,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[i]=t;var _=(s,i,t)=>ce(s,typeof i!="symbol"?i+"":i,t);import{s as $,m as Q}from"./chrome-storage-DK5y16Sl.js";import{s as X,j as E,e as Z,f as O,k as W,l as G,m as le,n as ue,S as K,a as me,d as de,g as fe,R as J,P as ge,G as he}from"./profile-validator-CZhzMz7f.js";import{n as ye,g as H,b as pe}from"./languages-C13mc9CV.js";import{c as be}from"./scheduler-DCZwEqJq.js";const ee={intuition:"",keyObservation:"",approach:"",whyItWorks:"",complexityAnalysis:"",edgeCases:"",mistakes:"",simplifiedExplanation:""};function V(s,i){const t={...ee,...i};return`# ${s.title||"Problem Notes"}

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
`}function Se(s){const i={...ee};if(!s)return i;const t=[{key:"intuition",title:"1. Problem Intuition"},{key:"keyObservation",title:"2. Key Observation"},{key:"approach",title:"3. Algorithm or Approach"},{key:"whyItWorks",title:"4. Why the Approach Works"},{key:"complexityAnalysis",title:"5. Complexity Analysis"},{key:"edgeCases",title:"6. Edge Cases"},{key:"mistakes",title:"7. Mistakes Made During Initial Attempt"},{key:"simplifiedExplanation",title:"8. Simpler Explanation for Future Revision"}];for(let e=0;e<t.length;e++){const r=t[e],a=new RegExp(`##\\s+${Y(r.title)}`,"i"),l=s.match(a);if(l&&l.index!==void 0){const o=l.index+l[0].length;let n=s.length;if(e+1<t.length){const d=new RegExp(`##\\s+${Y(t[e+1].title)}`,"i"),f=s.slice(o).match(d);f&&f.index!==void 0&&(n=o+f.index)}const u=s.slice(o,n).trim();u&&!u.startsWith("_No notes")&&!u.startsWith("_No mistakes")&&(i[r.key]=u)}}return i}function Y(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function $e(s){return s?s.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`).map(i=>i.trimEnd()).join(`
`).trim():""}async function we(s){var e;const i=$e(s),t=typeof globalThis<"u"&&((e=globalThis.crypto)!=null&&e.subtle)?globalThis.crypto.subtle:typeof crypto<"u"&&crypto.subtle?crypto.subtle:null;if(t&&typeof t.digest=="function"){const a=new TextEncoder().encode(i),l=await t.digest("SHA-256",a);return Array.from(new Uint8Array(l)).map(n=>n.toString(16).padStart(2,"0")).join("")}return xe(i)}function xe(s){let i=-559038737,t=1103515245;for(let a=0;a<s.length;a++){const l=s.charCodeAt(a);i=Math.imul(i^l,2654435761),t=Math.imul(t^l,1597334677)}i=Math.imul(i^i>>>16,2246822507)^Math.imul(t^t>>>13,3266489909),t=Math.imul(t^t>>>16,2246822507)^Math.imul(i^i>>>13,3266489909);const e=(i>>>0).toString(16).padStart(8,"0"),r=(t>>>0).toString(16).padStart(8,"0");return(e+r).repeat(4).slice(0,64)}async function te(s,i,t){const e=await we(s.code),r=X(i);if(!t||!t.submissions)return{isDuplicate:!1,contentHash:e,isUpdateToExistingProblem:!1};if(s.submissionId){const l=t.submissions[s.submissionId];if(l)return{isDuplicate:!0,reason:"SUBMISSION_ID_EXISTS",existingFilePath:l.filePath,matchedKey:s.submissionId}}for(const[l,o]of Object.entries(t.submissions))if(o.slug===s.problemSlug&&o.language===s.language&&o.approachName===r&&o.contentHash===e)return{isDuplicate:!0,reason:"CONTENT_HASH_EXISTS",existingFilePath:o.filePath,matchedKey:l};const a=!!(s.problemId&&t.problems[s.problemId]||t.problems[s.problemSlug]);return{isDuplicate:!1,contentHash:e,isUpdateToExistingProblem:a,existingProblemId:a?s.problemId:void 0}}class Ce{constructor(){_(this,"queue",new Map)}async acquire(i,t,e=45e3){const r=this.queue.get(i)||Promise.resolve();let a;const l=async()=>Promise.race([t(),new Promise((n,u)=>{a=setTimeout(()=>{u(new E(`Lock timeout after ${e/1e3}s waiting for branch write lock (${i})`,408))},e)})]).finally(()=>{clearTimeout(a)}),o=r.then(()=>l(),()=>l());this.queue.set(i,o);try{return await o}finally{this.queue.get(i)===o&&this.queue.delete(i)}}}const Pe=new Ce;async function M(s,i,t,e){var l,o,n,u,d,f;const r=Date.now(),a={"Cache-Control":"no-cache, no-store, max-age=0, must-revalidate",Pragma:"no-cache"};try{const y=await s.rawRequest(`/repos/${i}/${t}/git/ref/heads/${encodeURIComponent(e)}?_ts=${r}`,{headers:a});if((l=y==null?void 0:y.object)!=null&&l.sha)return y.object.sha;if(Array.isArray(y)&&((n=(o=y[0])==null?void 0:o.object)!=null&&n.sha))return y[0].object.sha}catch(y){if(y.status!==404)try{const p=await s.rawRequest(`/repos/${i}/${t}/git/refs/heads/${encodeURIComponent(e)}?_ts=${r}`,{headers:a});if(Array.isArray(p)&&((d=(u=p[0])==null?void 0:u.object)!=null&&d.sha))return p[0].object.sha;if((f=p==null?void 0:p.object)!=null&&f.sha)return p.object.sha}catch{}if(y.status===404)return null;throw y}return null}async function ve(s,i){const{owner:t,repo:e,branch:r="main"}=s.rawSettings,a=`${t}/${e}/${r}`;return Pe.acquire(a,async()=>Ae(s,i,t,e,r))}async function Ae(s,i,t,e,r){var l;const a=i.maxRetries??5;for(let o=1;o<=a;o++)try{let n=await M(s,t,e,r);if(!n)try{const x=(await s.rawRequest(`/repos/${t}/${e}`)).default_branch;if(x&&x!==r){const v=await M(s,t,e,x);v&&(n=v,await s.rawRequest(`/repos/${t}/${e}/git/refs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ref:`refs/heads/${r}`,sha:n})}))}}catch(b){if(b.status!==404)throw b}if(!n)if(i.files.length>0){const b=i.files[0],x=await s.putSingleFile(b.path,b.content,"chore(init): initial commit for LC-Sync");if(i.files.length===1)return x;if(n=await M(s,t,e,r),!n)throw new E("Failed to initialize branch head for empty repository.",500)}else throw new E("No files provided for commit.",400);const d=(await s.rawRequest(`/repos/${t}/${e}/git/commits/${n}`)).tree.sha,f=[];for(const b of i.files){const x=await s.rawRequest(`/repos/${t}/${e}/git/blobs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:b.content,encoding:"utf-8"})});f.push({path:b.path,mode:"100644",type:"blob",sha:x.sha})}const y=await s.rawRequest(`/repos/${t}/${e}/git/trees`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base_tree:d,tree:f})}),p={message:i.message,tree:y.sha,parents:[n]};i.author&&(p.author={name:i.author.name,email:i.author.email,date:i.author.date||new Date().toISOString()}),i.committer?p.committer={name:i.committer.name,email:i.committer.email,date:i.committer.date||new Date().toISOString()}:(l=i.author)!=null&&l.date&&(p.committer={name:i.author.name,email:i.author.email,date:i.author.date});const g=await s.rawRequest(`/repos/${t}/${e}/git/commits`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});try{await s.rawRequest(`/repos/${t}/${e}/git/refs/heads/${encodeURIComponent(r)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sha:g.sha,force:!1})})}catch(b){if(await M(s,t,e,r)===g.sha)return g.sha;throw b}return g.sha}catch(n){const u=(n==null?void 0:n.status)===422||(n==null?void 0:n.message)&&n.message.toLowerCase().includes("not a fast forward");if(((n==null?void 0:n.status)===409||u)&&o<a){const f=Math.min(1e3*Math.pow(2,o-1),8e3);console.warn(`[createAtomicCommit] Attempt ${o} failed with non-fast-forward conflict. Retrying in ${f}ms with refreshed branch HEAD...`),await new Promise(y=>setTimeout(y,f));continue}throw n}throw new E(`Failed to complete atomic commit on '${r}' after ${a} attempts due to non-fast-forward conflicts.`,409)}const D="<!-- lc-sync:start -->",L="<!-- lc-sync:end -->";function Te(s,i={}){const t=i.basePrefix||"solutions",e=Z(i.leetcodeUsername),r=i.cacheBuster||Math.floor(Date.now()/1e3),a=Object.values(s.problems||{}).sort((c,h)=>{const S=parseInt(c.id,10),C=parseInt(h.id,10);return!isNaN(S)&&!isNaN(C)?S-C:c.id.localeCompare(h.id)});let l=0,o=0,n=0;const u={},d={};for(const c of a){c.difficulty==="Easy"?l++:c.difficulty==="Medium"?o++:c.difficulty==="Hard"&&n++;for(const h of c.languages||[]){const S=ye(h),C=S!=="unknown"?S:h;u[C]=(u[C]||0)+1}for(const h of c.tags||[])d[h]=(d[h]||0)+1}const f=Object.entries(u).sort((c,h)=>h[1]-c[1]).map(([c,h])=>`| ${H(c).name} | \`${h}\` |`).join(`
`),y=Object.entries(d).sort((c,h)=>h[1]-c[1]).slice(0,15).map(([c,h])=>`\`${c} (${h})\``).join(" • "),p=a.map(c=>{const h=O(c.id),S=W(c.id,c.slug),C=`[${c.title}](./${t}/${S})`,T=`[Notes](./${t}/${S}/notes.md)`,k=(c.languages||[]).map(R=>`[\`${H(R).name}\`](./${t}/${S}/${R})`).join(", "),P=(c.tags||[]).slice(0,3).join(", ")||"-",I=c.nextReviewDate?`\`${c.nextReviewDate}\``:"-",N=c.lastSyncedAt?c.lastSyncedAt.split("T")[0]:"-";return`| ${h} | ${C} | ${c.difficulty} | ${k} | ${P} | ${T} | ${N} | ${I} |`}),b=[...a].sort((c,h)=>new Date(h.lastSyncedAt||0).getTime()-new Date(c.lastSyncedAt||0).getTime()).slice(0,8).map(c=>{var N;const h=O(c.id),S=W(c.id,c.slug),C=((N=c.languages)==null?void 0:N[0])||"cpp",T=pe(C),k=`[${h}. ${c.title}](./${t}/${S})`,P=(c.languages||[]).map(R=>H(R).name).join(", ")||"C++",I=`[solution.${T}](./${t}/${S}/${C}/solution.${T})`;return`| ${k} | ${c.difficulty} | ${P} | ${I} |`}),x=[`[![Problems Tracked](https://img.shields.io/badge/Problems%20Tracked-${a.length}-blue)]()`],v=i.leetcodeSite||"us";e&&x.push(`[![LeetCode](https://img.shields.io/badge/LeetCode-Profile-orange?logo=leetcode)](${G(e,v)})`),i.githubUsername&&x.push(`[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?logo=github)](https://github.com/${i.githubUsername})`);let w="";if(e){const c=G(e,v);if(i.leetcodeVerified!==!1){const h=le(e,v,r),S=ue(e,v,r);w=`
## 🔗 LeetCode Profile

[${e}](${c})

## LeetCode Stats

[![LeetCode Stats](${h})](${c})

## Submission Activity

[![LeetCode Heatmap](${S})](${c})
`.trim()}else w=`
## 🔗 LeetCode Profile

[${e}](${c})

_External LeetCode statistics cards are unverified. Please verify your account in LC-Sync Settings._
`.trim()}else w=`
## 🔗 LeetCode Profile

[LeetCode](https://leetcode.com) — _Configure your LeetCode profile in LC-Sync Settings to view live stats._
`.trim();const A=i.githubUsername&&i.repoName?` • [GitHub Solutions Repo](https://github.com/${i.githubUsername}/${i.repoName})`:"";return`
${w}

## 📊 Repository Progress

<p align="center">
  <img src="./assets/progress.svg" alt="LC-Sync Progress" width="450" />
</p>

${x.join(" ")}

- **Distinct Problems Tracked**: **${a.length}**
- **Total Accepted Submissions**: **${s.totalSubmissions}**
- **Repository Solutions & Historical Versions**: **${s.totalSubmissions}**${A}

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
${y||"_No topic tags recorded yet._"}

---

## 📚 Solution Directory

👉 **[Browse All Solutions → ${t}/](./${t}/)**

### Recently Synchronized Problems

| Problem | Difficulty | Language | Solution |
| :--- | :-: | :--- | :--- |
${b.length>0?b.join(`
`):"| No solutions synchronized yet | - | - | - |"}

<details>
<summary><strong>View All Tracked Problems (${a.length})</strong></summary>

| # | Title | Difficulty | Languages | Topics | Notes | Date Solved | Next Revision |
| :-: | :--- | :-: | :--- | :--- | :-: | :-: | :-: |
${p.length>0?p.join(`
`):"| - | No problems tracked yet | - | - | - | - | - | - |"}

</details>

---

_Last synchronized via LC-Sync: \`${s.lastUpdated||new Date().toISOString()}\`_
`}function ke(s,i,t={}){const e=t.basePrefix||"solutions",r=Te(i,t),a=`# ⚡ LeetCode Daily

> My LeetCode problem-solving journey — automatically synchronized to GitHub using LC-Sync.
`,l=`
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
`;if(!s||!s.includes(D))return`${a}
${D}
${r.trim()}
${L}
${l}`.trim()+`
`;const o=s.indexOf(D),n=s.indexOf(L);if(o===-1||n===-1||n<o)return`${s}

${D}
${r.trim()}
${L}
`;let u=s.slice(0,o);const d=s.slice(n+L.length);return u=u.replace(/##\s*📈?\s*LeetCode Stats[\s\S]*?(?=(?:##\s|<!--\s*lc-sync|$))/gi,""),u=u.replace(/##\s*📅?\s*Submission Activity[\s\S]*?(?=(?:##\s|<!--\s*lc-sync|$))/gi,""),u=u.replace(/\[!\[LeetCode.*?\]\(https:\/\/leetcard\.jacoblin\.cool\/.*?\)\]\(.*?\)\s*/gi,""),u=u.trimEnd()+`

`,`${u}${D}
${r.trim()}
${L}${d}`}function Ne(s){const{totalTracked:i,easyCount:t,mediumCount:e,hardCount:r}=s,a=Math.max(1,i),l=Math.round(t/a*100),o=Math.round(e/a*100),n=Math.round(r/a*100),u=380,d=Math.round(t/a*u),f=Math.round(e/a*u),y=Math.round(r/a*u);return`<svg width="450" height="200" viewBox="0 0 450 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="450" height="200" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  
  <!-- Header -->
  <text x="24" y="36" fill="#f0f6fc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="16" font-weight="600">LC-Sync Progress Tracker</text>
  <text x="426" y="36" text-anchor="end" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="12">Tracked: ${i}</text>
  
  <!-- Stacked Progress Bar -->
  <g transform="translate(24, 55)">
    <rect width="${u}" height="10" rx="5" fill="#21262d" />
    <rect x="0" y="0" width="${d}" height="10" rx="5" fill="#238636" />
    <rect x="${d}" y="0" width="${f}" height="10" fill="#d29922" />
    <rect x="${d+f}" y="0" width="${y}" height="10" rx="5" fill="#da3633" />
  </g>
  
  <!-- Statistics Table -->
  <g transform="translate(24, 90)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">
    <!-- Easy -->
    <circle cx="6" cy="6" r="5" fill="#238636" />
    <text x="20" y="10" fill="#c9d1d9" font-size="13">Easy</text>
    <text x="100" y="10" fill="#f0f6fc" font-size="13" font-weight="600">${t}</text>
    <text x="130" y="10" fill="#8b949e" font-size="12">(${l}%)</text>
    
    <!-- Medium -->
    <circle cx="6" cy="36" r="5" fill="#d29922" />
    <text x="20" y="40" fill="#c9d1d9" font-size="13">Medium</text>
    <text x="100" y="40" fill="#f0f6fc" font-size="13" font-weight="600">${e}</text>
    <text x="130" y="40" fill="#8b949e" font-size="12">(${o}%)</text>
    
    <!-- Hard -->
    <circle cx="6" cy="66" r="5" fill="#da3633" />
    <text x="20" y="70" fill="#c9d1d9" font-size="13">Hard</text>
    <text x="100" y="70" fill="#f0f6fc" font-size="13" font-weight="600">${r}</text>
    <text x="130" y="70" fill="#8b949e" font-size="12">(${n}%)</text>
    
    <!-- Summary Divider & Stats -->
    <line x1="220" y1="0" x2="220" y2="76" stroke="#30363d" stroke-width="1" />
    
    <text x="240" y="20" fill="#8b949e" font-size="12">Total Solutions</text>
    <text x="240" y="40" fill="#58a6ff" font-size="18" font-weight="600">${s.totalSubmissions}</text>
    
    <text x="340" y="20" fill="#8b949e" font-size="12">Reviews Completed</text>
    <text x="340" y="40" fill="#3fb950" font-size="18" font-weight="600">${s.reviewsCompleted}</text>
  </g>
  
  <!-- Footer Note -->
  <text x="24" y="185" fill="#6e7681" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="10">Autogenerated by LC-Sync • Personal DSA Archive</text>
</svg>`}async function Re(s,i){var q;const t=i.rawSettings,e=s.submission,r=X(s.approachName||"solution");let a=await $.getSyncIndex();try{const m=await i.getFileContent(K);m!=null&&m.content&&(a=JSON.parse(m.content))}catch{}const l=await te(e,r,a);if(l.isDuplicate)return{success:!0,isDuplicate:!0,filesUpdated:[],error:`Skipped commit: Identical submission already synced at ${l.existingFilePath}`};const o=l.contentHash,n=new Date().toISOString(),u=t.defaultPathPrefix||"solutions",d=O(e.problemId),f=me(e.problemId,e.problemSlug,e.language,r,u),y=de(e.problemId,e.problemSlug,u),p=fe(e.problemId,e.problemSlug,u);let g=null;try{const m=await i.getFileContent(y);m!=null&&m.content&&(g=Q(JSON.parse(m.content),d,e.problemSlug))}catch{}g||(g=await $.getProblemMetadata(d)||Q(null,d,e.problemSlug));const b=be(s.confidence||g.confidenceRating||3,g.reviewsCount||0,((q=g.reviewHistory[g.reviewHistory.length-1])==null?void 0:q.intervalDays)||0),x={language:e.language,approachName:r,filePath:f,submissionId:e.submissionId,contentHash:o,syncedAt:n,runtime:e.runtime,memory:e.memory,complexity:{time:s.timeComplexity||g.estimatedTimeComplexity||"O(?)",space:s.spaceComplexity||g.estimatedSpaceComplexity||"O(?)"}},v=`${e.language}/${r}`,w={...g,id:d,title:e.problemTitle||g.title,slug:e.problemSlug,url:e.url||g.url,difficulty:e.difficulty!=="Unknown"?e.difficulty:g.difficulty,tags:Array.from(new Set([...g.tags,...s.tags||[]])),patterns:Array.from(new Set([...g.patterns,...s.patterns||[]])),lastSyncedAt:n,solutions:{...g.solutions,[v]:x},confidenceRating:s.confidence,nextReviewDate:b.nextReviewDate,reviewsCount:g.reviewsCount+1,failedRecallCount:g.failedRecallCount+(b.recalled?0:1),reviewHistory:[...g.reviewHistory,b.newReviewRecord],estimatedTimeComplexity:s.timeComplexity||g.estimatedTimeComplexity,estimatedSpaceComplexity:s.spaceComplexity||g.estimatedSpaceComplexity,verifiedComplexity:!1};let A="";try{const m=await i.getFileContent(p);if(m!=null&&m.content){const ne={...Se(m.content),...s.notes||{}};A=V(w,ne)}}catch{}A||(A=V(w,s.notes||{}));const c=e.submissionId||`${e.problemSlug}-${o.slice(0,12)}`,h={problemId:d,slug:e.problemSlug,title:e.problemTitle,difficulty:w.difficulty,language:e.language,approachName:r,submissionId:e.submissionId,contentHash:o,syncedAt:n,filePath:f},S=a.problems[d]||a.problems[e.problemSlug],C=Array.from(new Set([...(S==null?void 0:S.languages)||[],e.language])),T={id:d,title:e.problemTitle,slug:e.problemSlug,difficulty:w.difficulty,languages:C,approachesCount:Object.keys(w.solutions).length,lastSyncedAt:n,confidenceRating:s.confidence,nextReviewDate:b.nextReviewDate,tags:w.tags,patterns:w.patterns};a.submissions[c]=h,a.problems[d]=T,a.totalProblems=Object.keys(a.problems).length,a.totalSubmissions=Object.keys(a.submissions).length,a.lastUpdated=n;let k=null;try{const m=await i.getFileContent(J);k=(m==null?void 0:m.content)||null}catch{}for(const m of Object.values(a.submissions))m.filePath&&m.filePath.startsWith("problems/")&&(m.filePath=m.filePath.replace(/^problems\//,`${u}/`));const P=await $.getSettings(),I=Z(P==null?void 0:P.leetcodeProfileUsername),N=Math.floor(new Date(n).getTime()/1e3),R=ke(k,a,{repoName:t.repo,githubUsername:t.owner,leetcodeUsername:I||void 0,leetcodeSite:(P==null?void 0:P.leetcodeSite)||"us",basePrefix:u,cacheBuster:N});let j=0,U=0,z=0;for(const m of Object.values(a.problems)){m.difficulty==="Easy"?j++:m.difficulty==="Medium"?U++:m.difficulty==="Hard"&&z++;for(const B of m.languages);}const se={totalTracked:a.totalProblems,totalSubmissions:a.totalSubmissions,easyCount:j,mediumCount:U,hardCount:z,reviewsCompleted:w.reviewsCount},ie=Ne(se),F=[{path:f,content:e.code??""},{path:y,content:JSON.stringify(w,null,2)},{path:p,content:A},{path:K,content:JSON.stringify(a,null,2)},{path:J,content:R},{path:ge,content:ie}],ae=`feat(leetcode): sync ${e.problemTitle||e.problemSlug} (${e.language.toUpperCase()})`,oe=await ve(i,{message:ae,files:F,author:t.authorName&&t.authorEmail?{name:t.authorName,email:t.authorEmail}:void 0});return await $.saveSyncIndex(a),await $.saveProblemMetadata(w),{success:!0,isDuplicate:!1,commitSha:oe,filesUpdated:F.map(m=>m.path)}}class Ie{constructor(){_(this,"isProcessing",!1);_(this,"activeProcessingPromise",null)}async enqueue(i,t={}){const e=await $.getSyncQueue(),r=await $.getSyncIndex(),a=t.approachName||"solution",l=await te(i,a,r);let o="Pending",n;l.isDuplicate&&(o="Synced",n=`Duplicate detected: already synced at ${l.existingFilePath}`);const u={id:`queue-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,submission:i,approachName:a,notes:t.notes,confidence:t.confidence??3,tags:t.tags||[],patterns:t.patterns||[],timeComplexity:t.timeComplexity,spaceComplexity:t.spaceComplexity,status:o,attemptCount:0,maxAttempts:3,error:n,createdAt:new Date().toISOString()};return e.unshift(u),e.length>50&&(e.length=50),await $.saveSyncQueue(e),u}async processQueue(i,t){if(this.isProcessing&&this.activeProcessingPromise)try{await this.activeProcessingPromise}catch{}const e=this._executeQueue(i,t);this.activeProcessingPromise=e;try{await e}finally{this.activeProcessingPromise=null}}async _executeQueue(i,t){if(!this.isProcessing){this.isProcessing=!0;try{const e=i||new he((await $.getSettings()).github),r=e.rawSettings;if(!r.token||!r.owner||!r.repo)return;const a=await $.getSyncQueue();if(t){const l=a.findIndex(o=>o.id===t);if(l>0){const[o]=a.splice(l,1);a.unshift(o),await $.saveSyncQueue(a)}}for(let l=0;l<a.length;l++){const o=a[l];if(!(o.status!=="Pending"&&o.status!=="Failed")){o.status="Syncing",o.lastAttempt=new Date().toISOString(),o.attemptCount+=1,await $.saveSyncQueue(a);try{let n;const u=Re(o,e),d=new Promise((y,p)=>{n=setTimeout(()=>{p(new Error("Sync operation timed out after 30 seconds"))},3e4)}),f=await Promise.race([u,d]).finally(()=>{clearTimeout(n)});f.success?(o.status="Synced",o.commitSha=f.commitSha,o.error=f.isDuplicate?f.error:void 0):(o.status=o.attemptCount>=o.maxAttempts?"Needs Attention":"Failed",o.error=f.error||"Unknown sync error")}catch(n){o.error=n.message||"Execution error",o.status=o.attemptCount>=o.maxAttempts?"Needs Attention":"Failed"}await $.saveSyncQueue(a)}}}finally{this.isProcessing=!1}}}async retryItem(i,t){const e=await $.getSyncQueue(),r=e.find(a=>a.id===i);r&&(r.status="Pending",r.error=void 0,await $.saveSyncQueue(e),await this.processQueue(t))}async removeItem(i){const e=(await $.getSyncQueue()).filter(r=>r.id!==i);await $.saveSyncQueue(e)}}const He=new Ie;export{ee as E,Ne as a,ve as b,te as c,we as d,V as f,ke as g,Se as p,He as s};
