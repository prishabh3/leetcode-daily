var re=Object.defineProperty;var le=(s,i,t)=>i in s?re(s,i,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[i]=t;var L=(s,i,t)=>le(s,typeof i!="symbol"?i+"":i,t);import{s as $,m as B}from"./chrome-storage-CpCzf1rQ.js";import{s as Y,j as E,e as X,f as O,k as W,l as Q,m as ce,n as ue,S as G,a as de,d as me,g as fe,R as K,P as ge,G as he}from"./profile-validator-CnmtIJx2.js";import{n as ye,g as H,b as pe}from"./languages-C13mc9CV.js";import{c as be}from"./scheduler-DCZwEqJq.js";const Z={intuition:"",keyObservation:"",approach:"",whyItWorks:"",complexityAnalysis:"",edgeCases:"",mistakes:"",simplifiedExplanation:""};function J(s,i){const t={...Z,...i};return`# ${s.title||"Problem Notes"}

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
`}function Se(s){const i={...Z};if(!s)return i;const t=[{key:"intuition",title:"1. Problem Intuition"},{key:"keyObservation",title:"2. Key Observation"},{key:"approach",title:"3. Algorithm or Approach"},{key:"whyItWorks",title:"4. Why the Approach Works"},{key:"complexityAnalysis",title:"5. Complexity Analysis"},{key:"edgeCases",title:"6. Edge Cases"},{key:"mistakes",title:"7. Mistakes Made During Initial Attempt"},{key:"simplifiedExplanation",title:"8. Simpler Explanation for Future Revision"}];for(let e=0;e<t.length;e++){const o=t[e],a=new RegExp(`##\\s+${V(o.title)}`,"i"),n=s.match(a);if(n&&n.index!==void 0){const c=n.index+n[0].length;let r=s.length;if(e+1<t.length){const f=new RegExp(`##\\s+${V(t[e+1].title)}`,"i"),y=s.slice(c).match(f);y&&y.index!==void 0&&(r=c+y.index)}const u=s.slice(c,r).trim();u&&!u.startsWith("_No notes")&&!u.startsWith("_No mistakes")&&(i[o.key]=u)}}return i}function V(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function $e(s){return s?s.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`).map(i=>i.trimEnd()).join(`
`).trim():""}async function xe(s){var e;const i=$e(s),t=typeof globalThis<"u"&&((e=globalThis.crypto)!=null&&e.subtle)?globalThis.crypto.subtle:typeof crypto<"u"&&crypto.subtle?crypto.subtle:null;if(t&&typeof t.digest=="function"){const a=new TextEncoder().encode(i),n=await t.digest("SHA-256",a);return Array.from(new Uint8Array(n)).map(r=>r.toString(16).padStart(2,"0")).join("")}return we(i)}function we(s){let i=-559038737,t=1103515245;for(let a=0;a<s.length;a++){const n=s.charCodeAt(a);i=Math.imul(i^n,2654435761),t=Math.imul(t^n,1597334677)}i=Math.imul(i^i>>>16,2246822507)^Math.imul(t^t>>>13,3266489909),t=Math.imul(t^t>>>16,2246822507)^Math.imul(i^i>>>13,3266489909);const e=(i>>>0).toString(16).padStart(8,"0"),o=(t>>>0).toString(16).padStart(8,"0");return(e+o).repeat(4).slice(0,64)}async function ee(s,i,t){const e=await xe(s.code),o=Y(i);if(!t||!t.submissions)return{isDuplicate:!1,contentHash:e,isUpdateToExistingProblem:!1};if(s.submissionId){const n=t.submissions[s.submissionId];if(n)return{isDuplicate:!0,reason:"SUBMISSION_ID_EXISTS",existingFilePath:n.filePath,matchedKey:s.submissionId}}for(const[n,c]of Object.entries(t.submissions))if(c.slug===s.problemSlug&&c.language===s.language&&c.approachName===o&&c.contentHash===e)return{isDuplicate:!0,reason:"CONTENT_HASH_EXISTS",existingFilePath:c.filePath,matchedKey:n};const a=!!(s.problemId&&t.problems[s.problemId]||t.problems[s.problemSlug]);return{isDuplicate:!1,contentHash:e,isUpdateToExistingProblem:a,existingProblemId:a?s.problemId:void 0}}class Ce{constructor(){L(this,"queue",new Map)}async acquire(i,t){const o=(this.queue.get(i)||Promise.resolve()).then(()=>t(),()=>t());this.queue.set(i,o);try{return await o}finally{this.queue.get(i)===o&&this.queue.delete(i)}}}const Pe=new Ce;async function M(s,i,t,e){var n,c,r,u,f,y;const o=Date.now(),a={"Cache-Control":"no-cache, no-store, max-age=0, must-revalidate",Pragma:"no-cache"};try{const h=await s.rawRequest(`/repos/${i}/${t}/git/ref/heads/${encodeURIComponent(e)}?_ts=${o}`,{headers:a});if((n=h==null?void 0:h.object)!=null&&n.sha)return h.object.sha;if(Array.isArray(h)&&((r=(c=h[0])==null?void 0:c.object)!=null&&r.sha))return h[0].object.sha}catch(h){if(h.status!==404)try{const b=await s.rawRequest(`/repos/${i}/${t}/git/refs/heads/${encodeURIComponent(e)}?_ts=${o}`,{headers:a});if(Array.isArray(b)&&((f=(u=b[0])==null?void 0:u.object)!=null&&f.sha))return b[0].object.sha;if((y=b==null?void 0:b.object)!=null&&y.sha)return b.object.sha}catch{}if(h.status===404)return null;throw h}return null}async function ve(s,i){const{owner:t,repo:e,branch:o="main"}=s.rawSettings,a=`${t}/${e}/${o}`;return Pe.acquire(a,async()=>Ae(s,i,t,e,o))}async function Ae(s,i,t,e,o){var n;const a=i.maxRetries??5;for(let c=1;c<=a;c++)try{let r=await M(s,t,e,o);if(!r)try{const x=(await s.rawRequest(`/repos/${t}/${e}`)).default_branch;if(x&&x!==o){const P=await M(s,t,e,x);P&&(r=P,await s.rawRequest(`/repos/${t}/${e}/git/refs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ref:`refs/heads/${o}`,sha:r})}))}}catch(p){if(p.status!==404)throw p}if(!r)if(i.files.length>0){const p=i.files[0],x=await s.putSingleFile(p.path,p.content,"chore(init): initial commit for LC-Sync");if(i.files.length===1)return x;if(r=await M(s,t,e,o),!r)throw new E("Failed to initialize branch head for empty repository.",500)}else throw new E("No files provided for commit.",400);const f=(await s.rawRequest(`/repos/${t}/${e}/git/commits/${r}`)).tree.sha,y=[];for(const p of i.files){const x=await s.rawRequest(`/repos/${t}/${e}/git/blobs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:p.content,encoding:"utf-8"})});y.push({path:p.path,mode:"100644",type:"blob",sha:x.sha})}const h=await s.rawRequest(`/repos/${t}/${e}/git/trees`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base_tree:f,tree:y})}),b={message:i.message,tree:h.sha,parents:[r]};i.author&&(b.author={name:i.author.name,email:i.author.email,date:i.author.date||new Date().toISOString()}),i.committer?b.committer={name:i.committer.name,email:i.committer.email,date:i.committer.date||new Date().toISOString()}:(n=i.author)!=null&&n.date&&(b.committer={name:i.author.name,email:i.author.email,date:i.author.date});const m=await s.rawRequest(`/repos/${t}/${e}/git/commits`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});try{await s.rawRequest(`/repos/${t}/${e}/git/refs/heads/${encodeURIComponent(o)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sha:m.sha,force:!1})})}catch(p){if(await M(s,t,e,o)===m.sha)return m.sha;throw p}return m.sha}catch(r){const u=(r==null?void 0:r.status)===422||(r==null?void 0:r.message)&&r.message.toLowerCase().includes("not a fast forward");if(((r==null?void 0:r.status)===409||u)&&c<a){const y=Math.min(1e3*Math.pow(2,c-1),8e3);console.warn(`[createAtomicCommit] Attempt ${c} failed with non-fast-forward conflict. Retrying in ${y}ms with refreshed branch HEAD...`),await new Promise(h=>setTimeout(h,y));continue}throw r}throw new E(`Failed to complete atomic commit on '${o}' after ${a} attempts due to non-fast-forward conflicts.`,409)}const I="<!-- lc-sync:start -->",D="<!-- lc-sync:end -->";function Te(s,i={}){const t=i.basePrefix||"solutions",e=X(i.leetcodeUsername),o=i.cacheBuster||Math.floor(Date.now()/1e3),a=Object.values(s.problems||{}).sort((l,g)=>{const S=parseInt(l.id,10),w=parseInt(g.id,10);return!isNaN(S)&&!isNaN(w)?S-w:l.id.localeCompare(g.id)});let n=0,c=0,r=0;const u={},f={};for(const l of a){l.difficulty==="Easy"?n++:l.difficulty==="Medium"?c++:l.difficulty==="Hard"&&r++;for(const g of l.languages||[]){const S=ye(g),w=S!=="unknown"?S:g;u[w]=(u[w]||0)+1}for(const g of l.tags||[])f[g]=(f[g]||0)+1}const y=Object.entries(u).sort((l,g)=>g[1]-l[1]).map(([l,g])=>`| ${H(l).name} | \`${g}\` |`).join(`
`),h=Object.entries(f).sort((l,g)=>g[1]-l[1]).slice(0,15).map(([l,g])=>`\`${l} (${g})\``).join(" • "),b=a.map(l=>{const g=O(l.id),S=W(l.id,l.slug),w=`[${l.title}](./${t}/${S})`,A=`[Notes](./${t}/${S}/notes.md)`,R=(l.languages||[]).map(k=>`[\`${H(k).name}\`](./${t}/${S}/${k})`).join(", "),T=(l.tags||[]).slice(0,3).join(", ")||"-",v=l.nextReviewDate?`\`${l.nextReviewDate}\``:"-",N=l.lastSyncedAt?l.lastSyncedAt.split("T")[0]:"-";return`| ${g} | ${w} | ${l.difficulty} | ${R} | ${T} | ${A} | ${N} | ${v} |`}),p=[...a].sort((l,g)=>new Date(g.lastSyncedAt||0).getTime()-new Date(l.lastSyncedAt||0).getTime()).slice(0,8).map(l=>{var N;const g=O(l.id),S=W(l.id,l.slug),w=((N=l.languages)==null?void 0:N[0])||"cpp",A=pe(w),R=`[${g}. ${l.title}](./${t}/${S})`,T=(l.languages||[]).map(k=>H(k).name).join(", ")||"C++",v=`[solution.${A}](./${t}/${S}/${w}/solution.${A})`;return`| ${R} | ${l.difficulty} | ${T} | ${v} |`}),x=[`[![Problems Tracked](https://img.shields.io/badge/Problems%20Tracked-${a.length}-blue)]()`];e&&x.push(`[![LeetCode](https://img.shields.io/badge/LeetCode-Profile-orange?logo=leetcode)](${Q(e)})`),i.githubUsername&&x.push(`[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?logo=github)](https://github.com/${i.githubUsername})`);let P="";if(e){const l=Q(e),g=ce(e,o),S=ue(e,o);P=`
## 🔗 LeetCode Profile

[${e}](${l})

## LeetCode Stats

[![LeetCode Stats](${g})](${l})

## Submission Activity

[![LeetCode Heatmap](${S})](${l})
`.trim()}else P=`
## 🔗 LeetCode Profile

[LeetCode](https://leetcode.com)
`.trim();const C=i.githubUsername&&i.repoName?` • [GitHub Solutions Repo](https://github.com/${i.githubUsername}/${i.repoName})`:"";return`
${P}

## 📊 Repository Progress

<p align="center">
  <img src="./assets/progress.svg" alt="LC-Sync Progress" width="450" />
</p>

${x.join(" ")}

- **Distinct Problems Tracked**: **${a.length}**
- **Total Accepted Submissions**: **${s.totalSubmissions}**
- **Repository Solutions & Historical Versions**: **${s.totalSubmissions}**${C}

### 🎯 Difficulty Breakdown
| Difficulty | Solved |
| :--- | :--- |
| 🟢 Easy | **${n}** |
| 🟡 Medium | **${c}** |
| 🔴 Hard | **${r}** |

### 💻 Language Distribution
| Language | Solved Problems |
| :--- | :--- |
${y||"| None | 0 |"}

### 🏷️ Topic Tags
${h||"_No topic tags recorded yet._"}

---

## 📚 Solution Directory

👉 **[Browse All Solutions → ${t}/](./${t}/)**

### Recently Synchronized Problems

| Problem | Difficulty | Language | Solution |
| :--- | :-: | :--- | :--- |
${p.length>0?p.join(`
`):"| No solutions synchronized yet | - | - | - |"}

<details>
<summary><strong>View All Tracked Problems (${a.length})</strong></summary>

| # | Title | Difficulty | Languages | Topics | Notes | Date Solved | Next Revision |
| :-: | :--- | :-: | :--- | :--- | :-: | :-: | :-: |
${b.length>0?b.join(`
`):"| - | No problems tracked yet | - | - | - | - | - | - |"}

</details>

---

_Last synchronized via LC-Sync: \`${s.lastUpdated||new Date().toISOString()}\`_
`}function Ne(s,i,t={}){const e=t.basePrefix||"solutions",o=Te(i,t),a=`# ⚡ LeetCode Daily

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
`;if(!s||!s.includes(I))return`${a}
${I}
${o.trim()}
${D}
${n}`.trim()+`
`;const c=s.indexOf(I),r=s.indexOf(D);if(c===-1||r===-1||r<c)return`${s}

${I}
${o.trim()}
${D}
`;let u=s.slice(0,c);const f=s.slice(r+D.length);return u=u.replace(/##\s*📈?\s*LeetCode Stats[\s\S]*?(?=(?:##\s|<!--\s*lc-sync|$))/gi,""),u=u.replace(/##\s*📅?\s*Submission Activity[\s\S]*?(?=(?:##\s|<!--\s*lc-sync|$))/gi,""),u=u.replace(/\[!\[LeetCode.*?\]\(https:\/\/leetcard\.jacoblin\.cool\/.*?\)\]\(.*?\)\s*/gi,""),u=u.trimEnd()+`

`,`${u}${I}
${o.trim()}
${D}${f}`}function ke(s){const{totalTracked:i,easyCount:t,mediumCount:e,hardCount:o}=s,a=Math.max(1,i),n=Math.round(t/a*100),c=Math.round(e/a*100),r=Math.round(o/a*100),u=380,f=Math.round(t/a*u),y=Math.round(e/a*u),h=Math.round(o/a*u);return`<svg width="450" height="200" viewBox="0 0 450 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="450" height="200" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  
  <!-- Header -->
  <text x="24" y="36" fill="#f0f6fc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="16" font-weight="600">LC-Sync Progress Tracker</text>
  <text x="426" y="36" text-anchor="end" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="12">Tracked: ${i}</text>
  
  <!-- Stacked Progress Bar -->
  <g transform="translate(24, 55)">
    <rect width="${u}" height="10" rx="5" fill="#21262d" />
    <rect x="0" y="0" width="${f}" height="10" rx="5" fill="#238636" />
    <rect x="${f}" y="0" width="${y}" height="10" fill="#d29922" />
    <rect x="${f+y}" y="0" width="${h}" height="10" rx="5" fill="#da3633" />
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
    <text x="100" y="70" fill="#f0f6fc" font-size="13" font-weight="600">${o}</text>
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
</svg>`}async function Re(s,i){var F;const t=i.rawSettings,e=s.submission,o=Y(s.approachName||"solution");let a=await $.getSyncIndex();try{const d=await i.getFileContent(G);d!=null&&d.content&&(a=JSON.parse(d.content))}catch{}const n=await ee(e,o,a);if(n.isDuplicate)return{success:!0,isDuplicate:!0,filesUpdated:[],error:`Skipped commit: Identical submission already synced at ${n.existingFilePath}`};const c=n.contentHash,r=new Date().toISOString(),u=t.defaultPathPrefix||"solutions",f=O(e.problemId),y=de(e.problemId,e.problemSlug,e.language,o,u),h=me(e.problemId,e.problemSlug,u),b=fe(e.problemId,e.problemSlug,u);let m=null;try{const d=await i.getFileContent(h);d!=null&&d.content&&(m=B(JSON.parse(d.content),f,e.problemSlug))}catch{}m||(m=await $.getProblemMetadata(f)||B(null,f,e.problemSlug));const p=be(s.confidence||m.confidenceRating||3,m.reviewsCount||0,((F=m.reviewHistory[m.reviewHistory.length-1])==null?void 0:F.intervalDays)||0),x={language:e.language,approachName:o,filePath:y,submissionId:e.submissionId,contentHash:c,syncedAt:r,runtime:e.runtime,memory:e.memory,complexity:{time:s.timeComplexity||m.estimatedTimeComplexity||"O(?)",space:s.spaceComplexity||m.estimatedSpaceComplexity||"O(?)"}},P=`${e.language}/${o}`,C={...m,id:f,title:e.problemTitle||m.title,slug:e.problemSlug,url:e.url||m.url,difficulty:e.difficulty!=="Unknown"?e.difficulty:m.difficulty,tags:Array.from(new Set([...m.tags,...s.tags||[]])),patterns:Array.from(new Set([...m.patterns,...s.patterns||[]])),lastSyncedAt:r,solutions:{...m.solutions,[P]:x},confidenceRating:s.confidence,nextReviewDate:p.nextReviewDate,reviewsCount:m.reviewsCount+1,failedRecallCount:m.failedRecallCount+(p.recalled?0:1),reviewHistory:[...m.reviewHistory,p.newReviewRecord],estimatedTimeComplexity:s.timeComplexity||m.estimatedTimeComplexity,estimatedSpaceComplexity:s.spaceComplexity||m.estimatedSpaceComplexity,verifiedComplexity:!1};let l="";try{const d=await i.getFileContent(b);if(d!=null&&d.content){const ne={...Se(d.content),...s.notes||{}};l=J(C,ne)}}catch{}l||(l=J(C,s.notes||{}));const g=e.submissionId||`${e.problemSlug}-${c.slice(0,12)}`,S={problemId:f,slug:e.problemSlug,title:e.problemTitle,difficulty:C.difficulty,language:e.language,approachName:o,submissionId:e.submissionId,contentHash:c,syncedAt:r,filePath:y},w=a.problems[f]||a.problems[e.problemSlug],A=Array.from(new Set([...(w==null?void 0:w.languages)||[],e.language])),R={id:f,title:e.problemTitle,slug:e.problemSlug,difficulty:C.difficulty,languages:A,approachesCount:Object.keys(C.solutions).length,lastSyncedAt:r,confidenceRating:s.confidence,nextReviewDate:p.nextReviewDate,tags:C.tags,patterns:C.patterns};a.submissions[g]=S,a.problems[f]=R,a.totalProblems=Object.keys(a.problems).length,a.totalSubmissions=Object.keys(a.submissions).length,a.lastUpdated=r;let T=null;try{const d=await i.getFileContent(K);T=(d==null?void 0:d.content)||null}catch{}for(const d of Object.values(a.submissions))d.filePath&&d.filePath.startsWith("problems/")&&(d.filePath=d.filePath.replace(/^problems\//,`${u}/`));const v=await $.getSettings(),N=X(v==null?void 0:v.leetcodeProfileUsername),k=Math.floor(new Date(r).getTime()/1e3),te=Ne(T,a,{repoName:t.repo,githubUsername:t.owner,leetcodeUsername:N||void 0,basePrefix:u,cacheBuster:k});let _=0,j=0,U=0;for(const d of Object.values(a.problems)){d.difficulty==="Easy"?_++:d.difficulty==="Medium"?j++:d.difficulty==="Hard"&&U++;for(const q of d.languages);}const se={totalTracked:a.totalProblems,totalSubmissions:a.totalSubmissions,easyCount:_,mediumCount:j,hardCount:U,reviewsCompleted:C.reviewsCount},ie=ke(se),z=[{path:y,content:e.code},{path:h,content:JSON.stringify(C,null,2)},{path:b,content:l},{path:G,content:JSON.stringify(a,null,2)},{path:K,content:te},{path:ge,content:ie}],ae=`feat(leetcode): sync ${e.problemTitle||e.problemSlug} (${e.language.toUpperCase()})`,oe=await ve(i,{message:ae,files:z,author:t.authorName&&t.authorEmail?{name:t.authorName,email:t.authorEmail}:void 0});return await $.saveSyncIndex(a),await $.saveProblemMetadata(C),{success:!0,isDuplicate:!1,commitSha:oe,filesUpdated:z.map(d=>d.path)}}class Ie{constructor(){L(this,"isProcessing",!1)}async enqueue(i,t={}){const e=await $.getSyncQueue(),o=await $.getSyncIndex(),a=t.approachName||"solution",n=await ee(i,a,o);let c="Pending",r;n.isDuplicate&&(c="Synced",r=`Duplicate detected: already synced at ${n.existingFilePath}`);const u={id:`queue-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,submission:i,approachName:a,notes:t.notes,confidence:t.confidence??3,tags:t.tags||[],patterns:t.patterns||[],timeComplexity:t.timeComplexity,spaceComplexity:t.spaceComplexity,status:c,attemptCount:0,maxAttempts:3,error:r,createdAt:new Date().toISOString()};return e.unshift(u),e.length>50&&(e.length=50),await $.saveSyncQueue(e),u}async processQueue(i){if(!this.isProcessing){this.isProcessing=!0;try{const t=i||new he((await $.getSettings()).github),e=t.rawSettings;if(!e.token||!e.owner||!e.repo)return;const o=await $.getSyncQueue();for(let a=0;a<o.length;a++){const n=o[a];if(!(n.status!=="Pending"&&n.status!=="Failed")){n.status="Syncing",n.lastAttempt=new Date().toISOString(),n.attemptCount+=1,await $.saveSyncQueue(o);try{const c=await Re(n,t);c.success?(n.status="Synced",n.commitSha=c.commitSha,n.error=c.isDuplicate?c.error:void 0):(n.status=n.attemptCount>=n.maxAttempts?"Needs Attention":"Failed",n.error=c.error||"Unknown sync error")}catch(c){n.error=c.message||"Execution error",n.status=n.attemptCount>=n.maxAttempts?"Needs Attention":"Failed"}await $.saveSyncQueue(o)}}}finally{this.isProcessing=!1}}}async retryItem(i,t){const e=await $.getSyncQueue(),o=e.find(a=>a.id===i);o&&(o.status="Pending",o.error=void 0,await $.saveSyncQueue(e),await this.processQueue(t))}async removeItem(i){const e=(await $.getSyncQueue()).filter(o=>o.id!==i);await $.saveSyncQueue(e)}}const Oe=new Ie;export{Z as E,ke as a,ve as b,ee as c,xe as d,J as f,Ne as g,Se as p,Oe as s};
