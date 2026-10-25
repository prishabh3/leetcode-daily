var p=Object.defineProperty;var b=(h,s,e)=>s in h?p(h,s,{enumerable:!0,configurable:!0,writable:!0,value:e}):h[s]=e;var f=(h,s,e)=>b(h,typeof s!="symbol"?s+"":s,e);import{n as g}from"./languages-C13mc9CV.js";class ${constructor(s="https://leetcode.com",e=200){f(this,"baseUrl");f(this,"minIntervalMs");f(this,"lastRequestTime",0);this.baseUrl=s.replace(/\/+$/,""),this.minIntervalMs=e}async rateLimitDelay(){const e=Date.now()-this.lastRequestTime;e<this.minIntervalMs&&await new Promise(i=>setTimeout(i,this.minIntervalMs-e)),this.lastRequestTime=Date.now()}async fetchWithRetry(s,e={},i=3){await this.rateLimitDelay();for(let l=1;l<=i;l++)try{const a=await fetch(s,{...e,credentials:"include",headers:{"Content-Type":"application/json",Accept:"application/json, text/plain, */*",...e.headers}});if(a.status===429){if(l<i){const o=this.minIntervalMs===0?5:Math.pow(2,l)*600;await new Promise(u=>setTimeout(u,o));continue}throw new Error("LeetCode rate limit reached (HTTP 429). Please wait a moment before continuing.")}return a}catch(a){if(l>=i)throw a;await new Promise(o=>setTimeout(o,this.minIntervalMs===0?5:500*l))}throw new Error("Failed to reach LeetCode after multiple attempts.")}async checkSession(){var e;const s=`
      query userStatus {
        userStatus {
          isSignedIn
          username
          realName
          userSlug
        }
      }
    `;try{const i=await this.fetchWithRetry(`${this.baseUrl}/graphql`,{method:"POST",body:JSON.stringify({query:s})});if(!i.ok)return{isSignedIn:!1,error:`LeetCode responded with HTTP ${i.status}. Please check your internet connection.`};const l=await i.json(),a=(e=l==null?void 0:l.data)==null?void 0:e.userStatus;return a&&a.isSignedIn?{isSignedIn:!0,username:a.username||a.userSlug}:{isSignedIn:!1,error:"Not logged in. Please sign in to LeetCode in your browser to import your historical submissions."}}catch(i){return{isSignedIn:!1,error:(i==null?void 0:i.message)||"Could not connect to LeetCode."}}}async fetchUserStats(s){var i,l,a;const e=`
      query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;try{const o=await this.fetchWithRetry(`${this.baseUrl}/graphql`,{method:"POST",body:JSON.stringify({query:e,variables:{username:s}})});if(!o.ok)return null;const u=await o.json(),t=(i=u==null?void 0:u.data)==null?void 0:i.matchedUser;if(!t)return null;const m=((l=t.submitStatsGlobal)==null?void 0:l.acSubmissionNum)||[];let r=0,n=0,c=0,y=0;for(const d of m)d.difficulty==="All"?r=d.count:d.difficulty==="Easy"?n=d.count:d.difficulty==="Medium"?c=d.count:d.difficulty==="Hard"&&(y=d.count);return{totalSolved:r,easySolved:n,mediumSolved:c,hardSolved:y,ranking:(a=t.profile)==null?void 0:a.ranking}}catch{return null}}async checkAuthenticatedIdentity(){const s=this.baseUrl.includes(".cn")?"cn":"us",e=await this.checkSession();if(!e.isSignedIn||!e.username)return{status:e.error&&/HTTP 429|rate limit/i.test(e.error)?"ERROR":"EXPIRED",site:s,authMethod:"session",error:e.error||"No active LeetCode session found. Please sign in to LeetCode in your browser."};const i=e.username.trim(),l=await this.fetchUserStats(i);return{status:"CONNECTED",username:i,site:s,verifiedAt:new Date().toISOString(),stats:l||void 0,authMethod:"session"}}async fetchSubmissionsPage(s=0,e=20,i){var a;const l=`
      query submissionList($offset: Int!, $limit: Int!, $lastKey: String) {
        submissionList(offset: $offset, limit: $limit, lastKey: $lastKey) {
          lastKey
          hasNext
          submissions {
            id
            statusDisplay
            lang
            runtime
            timestamp
            url
            isPending
            title
            memory
            titleSlug
          }
        }
      }
    `;try{const o=await this.fetchWithRetry(`${this.baseUrl}/graphql`,{method:"POST",body:JSON.stringify({query:l,variables:{offset:s,limit:e,lastKey:i||null}})});if(o.ok){const u=await o.json(),t=(a=u==null?void 0:u.data)==null?void 0:a.submissionList;if(t&&Array.isArray(t.submissions))return{submissions:t.submissions.map(r=>{const n=String(r.lang||"").toLowerCase(),c=g(n);return{id:String(r.id),title:r.title||"",titleSlug:r.titleSlug||"",statusDisplay:r.statusDisplay||(r.isPending?"Pending":"Unknown"),lang:n,normalizedLanguage:c,runtime:r.runtime||void 0,memory:r.memory||void 0,timestamp:Number(r.timestamp)||Math.floor(Date.now()/1e3),url:r.url?r.url.startsWith("http")?r.url:`${this.baseUrl}${r.url}`:void 0}}),hasNext:!!t.hasNext,lastKey:t.lastKey||void 0}}}catch{}try{const o=`${this.baseUrl}/api/submissions/?offset=${s}&limit=${e}`,u=await this.fetchWithRetry(o,{method:"GET"});if(u.ok){const t=await u.json(),m=t.submissions_dump;if(Array.isArray(m))return{submissions:m.map(n=>{const c=String(n.lang||"").toLowerCase(),y=g(c);return{id:String(n.id),title:n.title||"",titleSlug:n.title_slug||"",statusDisplay:n.status_display||"Unknown",lang:c,normalizedLanguage:y,runtime:n.runtime||void 0,memory:n.memory||void 0,timestamp:Number(n.timestamp)||Math.floor(Date.now()/1e3),url:n.url?n.url.startsWith("http")?n.url:`${this.baseUrl}${n.url}`:void 0,code:n.code||void 0}}),hasNext:!!t.has_next}}}catch(o){throw new Error(`Failed to fetch LeetCode submissions page at offset ${s}: ${(o==null?void 0:o.message)||"Network error"}`)}return{submissions:[],hasNext:!1}}async fetchSubmissionDetails(s){var i,l;const e=parseInt(String(s),10);if(!isNaN(e)){const a=`
        query submissionDetails($submissionId: Int!) {
          submissionDetails(submissionId: $submissionId) {
            runtime
            runtimeDisplay
            memory
            memoryDisplay
            code
            timestamp
            statusCode
            lang {
              name
              verboseName
            }
            question {
              questionId
              titleSlug
              title
            }
            topicTags {
              name
              slug
            }
          }
        }
      `;try{const o=await this.fetchWithRetry(`${this.baseUrl}/graphql`,{method:"POST",body:JSON.stringify({query:a,variables:{submissionId:e}})});if(o.ok){const u=await o.json(),t=(i=u==null?void 0:u.data)==null?void 0:i.submissionDetails;if(t&&t.code){const m=Array.isArray(t.topicTags)?t.topicTags.map(r=>r.name||r.slug).filter(Boolean):[];return{code:t.code,runtime:t.runtimeDisplay||(t.runtime?`${t.runtime} ms`:void 0),memory:t.memoryDisplay||(t.memory?`${t.memory} MB`:void 0),problemId:((l=t.question)==null?void 0:l.questionId)||void 0,topicTags:m,statusCode:t.statusCode}}}}catch{}}try{const a=`${this.baseUrl}/submissions/detail/${s}/`,o=await this.fetchWithRetry(a,{method:"GET"});if(o.ok){const u=await o.text();let t="";const m=u.match(/submissionCode:\s*['"]([\s\S]*?)['"],/);if(m&&m[1])try{t=JSON.parse(`"${m[1]}"`)}catch{t=m[1].replace(/\\n/g,`
`).replace(/\\'/g,"'").replace(/\\"/g,'"')}if(!t){const c=u.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);c&&c[1]&&(t=c[1].replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/&quot;/g,'"'))}let r;const n=u.match(/questionId:\s*['"]?(\d+)['"]?/);return n&&(r=n[1]),{code:t,problemId:r}}}catch(a){throw new Error(`Failed to retrieve code for submission ${s}: ${(a==null?void 0:a.message)||"Network error"}`)}return{code:""}}}export{$ as L};
