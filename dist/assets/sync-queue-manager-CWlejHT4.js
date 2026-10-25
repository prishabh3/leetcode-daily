var re=Object.defineProperty;var ce=(i,s,t)=>s in i?re(i,s,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[s]=t;var _=(i,s,t)=>ce(i,typeof s!="symbol"?s+"":s,t);import{s as $,m as Q}from"./chrome-storage-DaAhaLg2.js";import{s as X,j as E,e as Z,f as O,k as W,l as G,m as le,n as ue,S as J,a as de,d as me,g as fe,R as K,P as ge,G as he}from"./profile-validator-6ePiqAx0.js";import{n as ye,g as H,b as pe}from"./languages-C13mc9CV.js";import{c as be}from"./scheduler-DCZwEqJq.js";const ee={intuition:"",keyObservation:"",approach:"",whyItWorks:"",complexityAnalysis:"",edgeCases:"",mistakes:"",simplifiedExplanation:""};function V(i,s){const t={...ee,...s};return`# ${i.title||"Problem Notes"}

- **Problem ID**: ${i.id||"N/A"}
- **Difficulty**: ${i.difficulty||"Unknown"}
- **LeetCode URL**: [${i.title||"Problem"}](${i.url||"#"})
- **Tags**: ${(i.tags||[]).join(", ")||"None"}
- **Patterns**: ${(i.patterns||[]).join(", ")||"None"}

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
${t.complexityAnalysis.trim()||`- **Time Complexity**: ${i.estimatedTimeComplexity||"O(?) (unverified)"}
- **Space Complexity**: ${i.estimatedSpaceComplexity||"O(?) (unverified)"}`}

## 6. Edge Cases
${t.edgeCases.trim()||"_No notes recorded yet._"}

## 7. Mistakes Made During Initial Attempt
${t.mistakes.trim()||"_No mistakes recorded._"}

## 8. Simpler Explanation for Future Revision
${t.simplifiedExplanation.trim()||"_No revision summary recorded._"}
`}function Se(i){const s={...ee};if(!i)return s;const t=[{key:"intuition",title:"1. Problem Intuition"},{key:"keyObservation",title:"2. Key Observation"},{key:"approach",title:"3. Algorithm or Approach"},{key:"whyItWorks",title:"4. Why the Approach Works"},{key:"complexityAnalysis",title:"5. Complexity Analysis"},{key:"edgeCases",title:"6. Edge Cases"},{key:"mistakes",title:"7. Mistakes Made During Initial Attempt"},{key:"simplifiedExplanation",title:"8. Simpler Explanation for Future Revision"}];for(let e=0;e<t.length;e++){const r=t[e],o=new RegExp(`##\\s+${Y(r.title)}`,"i"),l=i.match(o);if(l&&l.index!==void 0){const a=l.index+l[0].length;let n=i.length;if(e+1<t.length){const m=new RegExp(`##\\s+${Y(t[e+1].title)}`,"i"),f=i.slice(a).match(m);f&&f.index!==void 0&&(n=a+f.index)}const u=i.slice(a,n).trim();u&&!u.startsWith("_No notes")&&!u.startsWith("_No mistakes")&&(s[r.key]=u)}}return s}function Y(i){return i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function $e(i){return i?i.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`).map(s=>s.trimEnd()).join(`
`).trim():""}async function we(i){var e;const s=$e(i),t=typeof globalThis<"u"&&((e=globalThis.crypto)!=null&&e.subtle)?globalThis.crypto.subtle:typeof crypto<"u"&&crypto.subtle?crypto.subtle:null;if(t&&typeof t.digest=="function"){const o=new TextEncoder().encode(s),l=await t.digest("SHA-256",o);return Array.from(new Uint8Array(l)).map(n=>n.toString(16).padStart(2,"0")).join("")}return xe(s)}function xe(i){let s=-559038737,t=1103515245;for(let o=0;o<i.length;o++){const l=i.charCodeAt(o);s=Math.imul(s^l,2654435761),t=Math.imul(t^l,1597334677)}s=Math.imul(s^s>>>16,2246822507)^Math.imul(t^t>>>13,3266489909),t=Math.imul(t^t>>>16,2246822507)^Math.imul(s^s>>>13,3266489909);const e=(s>>>0).toString(16).padStart(8,"0"),r=(t>>>0).toString(16).padStart(8,"0");return(e+r).repeat(4).slice(0,64)}async function te(i,s,t){const e=await we(i.code),r=X(s);if(!t||!t.submissions)return{isDuplicate:!1,contentHash:e,isUpdateToExistingProblem:!1};if(i.submissionId){const l=t.submissions[i.submissionId];if(l)return{isDuplicate:!0,reason:"SUBMISSION_ID_EXISTS",existingFilePath:l.filePath,matchedKey:i.submissionId}}for(const[l,a]of Object.entries(t.submissions))if(a.slug===i.problemSlug&&a.language===i.language&&a.approachName===r&&a.contentHash===e)return{isDuplicate:!0,reason:"CONTENT_HASH_EXISTS",existingFilePath:a.filePath,matchedKey:l};const o=!!(i.problemId&&t.problems[i.problemId]||t.problems[i.problemSlug]);return{isDuplicate:!1,contentHash:e,isUpdateToExistingProblem:o,existingProblemId:o?i.problemId:void 0}}class Ce{constructor(){_(this,"queue",new Map)}async acquire(s,t,e=45e3){const r=this.queue.get(s)||Promise.resolve();let o;const l=async()=>Promise.race([t(),new Promise((n,u)=>{o=setTimeout(()=>{u(new E(`Lock timeout after ${e/1e3}s waiting for branch write lock (${s})`,408))},e)})]).finally(()=>{clearTimeout(o)}),a=r.then(()=>l(),()=>l());this.queue.set(s,a);try{return await a}finally{this.queue.get(s)===a&&this.queue.delete(s)}}}const Pe=new Ce;async function M(i,s,t,e){var l,a,n,u,m,f;const r=Date.now(),o={"Cache-Control":"no-cache, no-store, max-age=0, must-revalidate",Pragma:"no-cache"};try{const y=await i.rawRequest(`/repos/${s}/${t}/git/ref/heads/${encodeURIComponent(e)}?_ts=${r}`,{headers:o});if((l=y==null?void 0:y.object)!=null&&l.sha)return y.object.sha;if(Array.isArray(y)&&((n=(a=y[0])==null?void 0:a.object)!=null&&n.sha))return y[0].object.sha}catch(y){if(y.status!==404)try{const p=await i.rawRequest(`/repos/${s}/${t}/git/refs/heads/${encodeURIComponent(e)}?_ts=${r}`,{headers:o});if(Array.isArray(p)&&((m=(u=p[0])==null?void 0:u.object)!=null&&m.sha))return p[0].object.sha;if((f=p==null?void 0:p.object)!=null&&f.sha)return p.object.sha}catch{}if(y.status===404)return null;throw y}return null}async function ve(i,s){const{owner:t,repo:e,branch:r="main"}=i.rawSettings,o=`${t}/${e}/${r}`;return Pe.acquire(o,async()=>Ae(i,s,t,e,r))}async function Ae(i,s,t,e,r){var l;const o=s.maxRetries??5;for(let a=1;a<=o;a++)try{let n=await M(i,t,e,r);if(!n)try{const P=(await i.rawRequest(`/repos/${t}/${e}`)).default_branch;if(P&&P!==r){const A=await M(i,t,e,P);A&&(n=A,await i.rawRequest(`/repos/${t}/${e}/git/refs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ref:`refs/heads/${r}`,sha:n})}))}}catch(b){if(b.status!==404)throw b}if(!n)if(s.files.length>0){const b=s.files[0],P=await i.putSingleFile(b.path,b.content,"chore(init): initial commit for LC-Sync");if(s.files.length===1)return P;if(n=await M(i,t,e,r),!n)throw new E("Failed to initialize branch head for empty repository.",500)}else throw new E("No files provided for commit.",400);const m=(await i.rawRequest(`/repos/${t}/${e}/git/commits/${n}`)).tree.sha,f=[];for(const b of s.files){const P=await i.rawRequest(`/repos/${t}/${e}/git/blobs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:b.content,encoding:"utf-8"})});f.push({path:b.path,mode:"100644",type:"blob",sha:P.sha})}const y=await i.rawRequest(`/repos/${t}/${e}/git/trees`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base_tree:m,tree:f})}),p={message:s.message,tree:y.sha,parents:[n]};s.author&&(p.author={name:s.author.name,email:s.author.email,date:s.author.date||new Date().toISOString()}),s.committer?p.committer={name:s.committer.name,email:s.committer.email,date:s.committer.date||new Date().toISOString()}:(l=s.author)!=null&&l.date&&(p.committer={name:s.author.name,email:s.author.email,date:s.author.date});const g=await i.rawRequest(`/repos/${t}/${e}/git/commits`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});try{await i.rawRequest(`/repos/${t}/${e}/git/refs/heads/${encodeURIComponent(r)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sha:g.sha,force:!1})})}catch(b){if(await M(i,t,e,r)===g.sha)return g.sha;throw b}return g.sha}catch(n){const u=(n==null?void 0:n.status)===422||(n==null?void 0:n.message)&&n.message.toLowerCase().includes("not a fast forward");if(((n==null?void 0:n.status)===409||u)&&a<o){const f=Math.min(1e3*Math.pow(2,a-1),8e3);console.warn(`[createAtomicCommit] Attempt ${a} failed with non-fast-forward conflict. Retrying in ${f}ms with refreshed branch HEAD...`),await new Promise(y=>setTimeout(y,f));continue}throw n}throw new E(`Failed to complete atomic commit on '${r}' after ${o} attempts due to non-fast-forward conflicts.`,409)}const I="<!-- lc-sync:start -->",D="<!-- lc-sync:end -->";function Te(i,s={}){const t=s.basePrefix||"solutions",e=Z(s.leetcodeUsername),r=s.cacheBuster||Math.floor(Date.now()/1e3),o=Object.values(i.problems||{}).sort((c,h)=>{const S=parseInt(c.id,10),w=parseInt(h.id,10);return!isNaN(S)&&!isNaN(w)?S-w:c.id.localeCompare(h.id)});let l=0,a=0,n=0;const u={},m={};for(const c of o){c.difficulty==="Easy"?l++:c.difficulty==="Medium"?a++:c.difficulty==="Hard"&&n++;for(const h of c.languages||[]){const S=ye(h),w=S!=="unknown"?S:h;u[w]=(u[w]||0)+1}for(const h of c.tags||[])m[h]=(m[h]||0)+1}const f=Object.entries(u).sort((c,h)=>h[1]-c[1]).map(([c,h])=>`| ${H(c).name} | \`${h}\` |`).join(`
`),y=Object.entries(m).sort((c,h)=>h[1]-c[1]).slice(0,15).map(([c,h])=>`\`${c} (${h})\``).join(" • "),p=o.map(c=>{const h=O(c.id),S=W(c.id,c.slug),w=`[${c.title}](./${t}/${S})`,v=`[Notes](./${t}/${S}/notes.md)`,T=(c.languages||[]).map(N=>`[\`${H(N).name}\`](./${t}/${S}/${N})`).join(", "),x=(c.tags||[]).slice(0,3).join(", ")||"-",R=c.nextReviewDate?`\`${c.nextReviewDate}\``:"-",L=c.lastSyncedAt?c.lastSyncedAt.split("T")[0]:"-";return`| ${h} | ${w} | ${c.difficulty} | ${T} | ${x} | ${v} | ${L} | ${R} |`}),b=[...o].sort((c,h)=>new Date(h.lastSyncedAt||0).getTime()-new Date(c.lastSyncedAt||0).getTime()).slice(0,8).map(c=>{var L;const h=O(c.id),S=W(c.id,c.slug),w=((L=c.languages)==null?void 0:L[0])||"cpp",v=pe(w),T=`[${h}. ${c.title}](./${t}/${S})`,x=(c.languages||[]).map(N=>H(N).name).join(", ")||"C++",R=`[solution.${v}](./${t}/${S}/${w}/solution.${v})`;return`| ${T} | ${c.difficulty} | ${x} | ${R} |`}),P=[`[![Problems Tracked](https://img.shields.io/badge/Problems%20Tracked-${o.length}-blue)]()`],A=s.leetcodeSite||"us";e&&P.push(`[![LeetCode](https://img.shields.io/badge/LeetCode-Profile-orange?logo=leetcode)](${G(e,A)})`),s.githubUsername&&P.push(`[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?logo=github)](https://github.com/${s.githubUsername})`);let C="";if(e){const c=G(e,A);if(s.leetcodeVerified!==!1){const h=le(e,A,r),S=ue(e,A,r);let w="";if(s.leetcodeAccountStats){const v=s.leetcodeAccountStats,T=v.ranking?` • Ranking: \`#${v.ranking}\``:"";w=`
- **Total Solved on LeetCode**: **${v.totalSolved}** (🟢 Easy: **${v.easySolved}** • 🟡 Medium: **${v.mediumSolved}** • 🔴 Hard: **${v.hardSolved}**)${T}
`.trim()}C=`
## 🌐 LeetCode Account

### 🔗 LeetCode Profile
[${e}](${c})
${w?`
${w}
`:""}
### 📈 Account Statistics
[![LeetCode Stats](${h})](${c})

### 🔥 Submission Activity Heatmap
[![LeetCode Heatmap](${S})](${c})

_External card caching notice: JacobLinCool and GitHub Camo cache card graphics for 1–4 hours. Local repository records below are updated immediately upon every sync._
`.trim()}else C=`
## 🌐 LeetCode Account

### 🔗 LeetCode Profile
[${e}](${c})

_External LeetCode statistics cards are unverified. Connect your active LeetCode session or verify your account in LC-Sync Settings._
`.trim()}else C=`
## 🌐 LeetCode Account

### 🔗 LeetCode Profile
[LeetCode](https://leetcode.com) — _Connect your active LeetCode session in LC-Sync Settings to view live account statistics and activity heatmap._
`.trim();const k=s.githubUsername&&s.repoName?` • [GitHub Solutions Repo](https://github.com/${s.githubUsername}/${s.repoName})`:"";return`
${C}

## 📊 LC-Sync Repository

<p align="center">
  <img src="./assets/progress.svg" alt="LC-Sync Progress" width="450" />
</p>

${P.join(" ")}

- **Distinct Problems Tracked**: **${o.length}**
- **Total Accepted Submissions**: **${i.totalSubmissions}**
- **Repository Solutions & Historical Versions**: **${i.totalSubmissions}**${k}

### 🎯 Difficulty Breakdown
| Difficulty | Solved |
| :--- | :--- |
| 🟢 Easy | **${l}** |
| 🟡 Medium | **${a}** |
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
<summary><strong>View All Tracked Problems (${o.length})</strong></summary>

| # | Title | Difficulty | Languages | Topics | Notes | Date Solved | Next Revision |
| :-: | :--- | :-: | :--- | :--- | :-: | :-: | :-: |
${p.length>0?p.join(`
`):"| - | No problems tracked yet | - | - | - | - | - | - |"}

</details>

---

_Last synchronized via LC-Sync: \`${i.lastUpdated||new Date().toISOString()}\`_
`}function ke(i,s,t={}){const e=t.basePrefix||"solutions",r=Te(s,t),o=`# ⚡ LeetCode Daily

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
`;if(!i||!i.includes(I))return`${o}
${I}
${r.trim()}
${D}
${l}`.trim()+`
`;const a=i.indexOf(I),n=i.indexOf(D);if(a===-1||n===-1||n<a)return`${i}

${I}
${r.trim()}
${D}
`;let u=i.slice(0,a);const m=i.slice(n+D.length);return u=u.replace(/##\s*📈?\s*LeetCode Stats[\s\S]*?(?=(?:##\s|<!--\s*lc-sync|$))/gi,""),u=u.replace(/##\s*📅?\s*Submission Activity[\s\S]*?(?=(?:##\s|<!--\s*lc-sync|$))/gi,""),u=u.replace(/\[!\[LeetCode.*?\]\(https:\/\/leetcard\.jacoblin\.cool\/.*?\)\]\(.*?\)\s*/gi,""),u=u.trimEnd()+`

`,`${u}${I}
${r.trim()}
${D}${m}`}function Le(i){const{totalTracked:s,easyCount:t,mediumCount:e,hardCount:r}=i,o=Math.max(1,s),l=Math.round(t/o*100),a=Math.round(e/o*100),n=Math.round(r/o*100),u=380,m=Math.round(t/o*u),f=Math.round(e/o*u),y=Math.round(r/o*u);return`<svg width="450" height="200" viewBox="0 0 450 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="450" height="200" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  
  <!-- Header -->
  <text x="24" y="36" fill="#f0f6fc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="16" font-weight="600">LC-Sync Progress Tracker</text>
  <text x="426" y="36" text-anchor="end" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="12">Tracked: ${s}</text>
  
  <!-- Stacked Progress Bar -->
  <g transform="translate(24, 55)">
    <rect width="${u}" height="10" rx="5" fill="#21262d" />
    <rect x="0" y="0" width="${m}" height="10" rx="5" fill="#238636" />
    <rect x="${m}" y="0" width="${f}" height="10" fill="#d29922" />
    <rect x="${m+f}" y="0" width="${y}" height="10" rx="5" fill="#da3633" />
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
    <text x="130" y="40" fill="#8b949e" font-size="12">(${a}%)</text>
    
    <!-- Hard -->
    <circle cx="6" cy="66" r="5" fill="#da3633" />
    <text x="20" y="70" fill="#c9d1d9" font-size="13">Hard</text>
    <text x="100" y="70" fill="#f0f6fc" font-size="13" font-weight="600">${r}</text>
    <text x="130" y="70" fill="#8b949e" font-size="12">(${n}%)</text>
    
    <!-- Summary Divider & Stats -->
    <line x1="220" y1="0" x2="220" y2="76" stroke="#30363d" stroke-width="1" />
    
    <text x="240" y="20" fill="#8b949e" font-size="12">Total Solutions</text>
    <text x="240" y="40" fill="#58a6ff" font-size="18" font-weight="600">${i.totalSubmissions}</text>
    
    <text x="340" y="20" fill="#8b949e" font-size="12">Reviews Completed</text>
    <text x="340" y="40" fill="#3fb950" font-size="18" font-weight="600">${i.reviewsCompleted}</text>
  </g>
  
  <!-- Footer Note -->
  <text x="24" y="185" fill="#6e7681" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="10">Autogenerated by LC-Sync • Personal DSA Archive</text>
</svg>`}async function Ne(i,s){var q;const t=s.rawSettings,e=i.submission,r=X(i.approachName||"solution");let o=await $.getSyncIndex();try{const d=await s.getFileContent(J);d!=null&&d.content&&(o=JSON.parse(d.content))}catch{}const l=await te(e,r,o);if(l.isDuplicate)return{success:!0,isDuplicate:!0,filesUpdated:[],error:`Skipped commit: Identical submission already synced at ${l.existingFilePath}`};const a=l.contentHash,n=new Date().toISOString(),u=t.defaultPathPrefix||"solutions",m=O(e.problemId),f=de(e.problemId,e.problemSlug,e.language,r,u),y=me(e.problemId,e.problemSlug,u),p=fe(e.problemId,e.problemSlug,u);let g=null;try{const d=await s.getFileContent(y);d!=null&&d.content&&(g=Q(JSON.parse(d.content),m,e.problemSlug))}catch{}g||(g=await $.getProblemMetadata(m)||Q(null,m,e.problemSlug));const b=be(i.confidence||g.confidenceRating||3,g.reviewsCount||0,((q=g.reviewHistory[g.reviewHistory.length-1])==null?void 0:q.intervalDays)||0),P={language:e.language,approachName:r,filePath:f,submissionId:e.submissionId,contentHash:a,syncedAt:n,runtime:e.runtime,memory:e.memory,complexity:{time:i.timeComplexity||g.estimatedTimeComplexity||"O(?)",space:i.spaceComplexity||g.estimatedSpaceComplexity||"O(?)"}},A=`${e.language}/${r}`,C={...g,id:m,title:e.problemTitle||g.title,slug:e.problemSlug,url:e.url||g.url,difficulty:e.difficulty!=="Unknown"?e.difficulty:g.difficulty,tags:Array.from(new Set([...g.tags,...i.tags||[]])),patterns:Array.from(new Set([...g.patterns,...i.patterns||[]])),lastSyncedAt:n,solutions:{...g.solutions,[A]:P},confidenceRating:i.confidence,nextReviewDate:b.nextReviewDate,reviewsCount:g.reviewsCount+1,failedRecallCount:g.failedRecallCount+(b.recalled?0:1),reviewHistory:[...g.reviewHistory,b.newReviewRecord],estimatedTimeComplexity:i.timeComplexity||g.estimatedTimeComplexity,estimatedSpaceComplexity:i.spaceComplexity||g.estimatedSpaceComplexity,verifiedComplexity:!1};let k="";try{const d=await s.getFileContent(p);if(d!=null&&d.content){const ne={...Se(d.content),...i.notes||{}};k=V(C,ne)}}catch{}k||(k=V(C,i.notes||{}));const c=e.submissionId||`${e.problemSlug}-${a.slice(0,12)}`,h={problemId:m,slug:e.problemSlug,title:e.problemTitle,difficulty:C.difficulty,language:e.language,approachName:r,submissionId:e.submissionId,contentHash:a,syncedAt:n,filePath:f},S=o.problems[m]||o.problems[e.problemSlug],w=Array.from(new Set([...(S==null?void 0:S.languages)||[],e.language])),v={id:m,title:e.problemTitle,slug:e.problemSlug,difficulty:C.difficulty,languages:w,approachesCount:Object.keys(C.solutions).length,lastSyncedAt:n,confidenceRating:i.confidence,nextReviewDate:b.nextReviewDate,tags:C.tags,patterns:C.patterns};o.submissions[c]=h,o.problems[m]=v,o.totalProblems=Object.keys(o.problems).length,o.totalSubmissions=Object.keys(o.submissions).length,o.lastUpdated=n;let T=null;try{const d=await s.getFileContent(K);T=(d==null?void 0:d.content)||null}catch{}for(const d of Object.values(o.submissions))d.filePath&&d.filePath.startsWith("problems/")&&(d.filePath=d.filePath.replace(/^problems\//,`${u}/`));const x=await $.getSettings(),R=Z(x==null?void 0:x.leetcodeProfileUsername),L=Math.floor(new Date(n).getTime()/1e3),N=ke(T,o,{repoName:t.repo,githubUsername:t.owner,leetcodeUsername:R||void 0,leetcodeSite:(x==null?void 0:x.leetcodeSite)||"us",leetcodeVerified:(x==null?void 0:x.leetcodeVerified)===!0,leetcodeAccountStats:x==null?void 0:x.leetcodeAccountStats,basePrefix:u,cacheBuster:L});let j=0,U=0,z=0;for(const d of Object.values(o.problems)){d.difficulty==="Easy"?j++:d.difficulty==="Medium"?U++:d.difficulty==="Hard"&&z++;for(const B of d.languages);}const se={totalTracked:o.totalProblems,totalSubmissions:o.totalSubmissions,easyCount:j,mediumCount:U,hardCount:z,reviewsCompleted:C.reviewsCount},ie=Le(se),F=[{path:f,content:e.code??""},{path:y,content:JSON.stringify(C,null,2)},{path:p,content:k},{path:J,content:JSON.stringify(o,null,2)},{path:K,content:N},{path:ge,content:ie}],oe=`feat(leetcode): sync ${e.problemTitle||e.problemSlug} (${e.language.toUpperCase()})`,ae=await ve(s,{message:oe,files:F,author:t.authorName&&t.authorEmail?{name:t.authorName,email:t.authorEmail}:void 0});return await $.saveSyncIndex(o),await $.saveProblemMetadata(C),{success:!0,isDuplicate:!1,commitSha:ae,filesUpdated:F.map(d=>d.path)}}class Re{constructor(){_(this,"isProcessing",!1);_(this,"activeProcessingPromise",null)}async enqueue(s,t={}){const e=await $.getSyncQueue(),r=await $.getSyncIndex(),o=t.approachName||"solution",l=await te(s,o,r);let a="Pending",n;l.isDuplicate&&(a="Synced",n=`Duplicate detected: already synced at ${l.existingFilePath}`);const u={id:`queue-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,submission:s,approachName:o,notes:t.notes,confidence:t.confidence??3,tags:t.tags||[],patterns:t.patterns||[],timeComplexity:t.timeComplexity,spaceComplexity:t.spaceComplexity,status:a,attemptCount:0,maxAttempts:3,error:n,createdAt:new Date().toISOString()};return e.unshift(u),e.length>50&&(e.length=50),await $.saveSyncQueue(e),u}async processQueue(s,t){if(this.isProcessing&&this.activeProcessingPromise)try{await this.activeProcessingPromise}catch{}const e=this._executeQueue(s,t);this.activeProcessingPromise=e;try{await e}finally{this.activeProcessingPromise=null}}async _executeQueue(s,t){if(!this.isProcessing){this.isProcessing=!0;try{const e=s||new he((await $.getSettings()).github),r=e.rawSettings;if(!r.token||!r.owner||!r.repo)return;const o=await $.getSyncQueue();if(t){const l=o.findIndex(a=>a.id===t);if(l>0){const[a]=o.splice(l,1);o.unshift(a),await $.saveSyncQueue(o)}}for(let l=0;l<o.length;l++){const a=o[l];if(!(a.status!=="Pending"&&a.status!=="Failed")){a.status="Syncing",a.lastAttempt=new Date().toISOString(),a.attemptCount+=1,await $.saveSyncQueue(o);try{let n;const u=Ne(a,e),m=new Promise((y,p)=>{n=setTimeout(()=>{p(new Error("Sync operation timed out after 30 seconds"))},3e4)}),f=await Promise.race([u,m]).finally(()=>{clearTimeout(n)});f.success?(a.status="Synced",a.commitSha=f.commitSha,a.error=f.isDuplicate?f.error:void 0):(a.status=a.attemptCount>=a.maxAttempts?"Needs Attention":"Failed",a.error=f.error||"Unknown sync error")}catch(n){a.error=n.message||"Execution error",a.status=a.attemptCount>=a.maxAttempts?"Needs Attention":"Failed"}await $.saveSyncQueue(o)}}}finally{this.isProcessing=!1}}}async retryItem(s,t){const e=await $.getSyncQueue(),r=e.find(o=>o.id===s);r&&(r.status="Pending",r.error=void 0,await $.saveSyncQueue(e),await this.processQueue(t))}async removeItem(s){const e=(await $.getSyncQueue()).filter(r=>r.id!==s);await $.saveSyncQueue(e)}}const He=new Re;export{ee as E,Le as a,ve as b,te as c,we as d,V as f,ke as g,Se as p,He as s};
