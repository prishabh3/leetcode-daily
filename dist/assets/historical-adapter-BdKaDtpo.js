var g=Object.defineProperty;var f=(d,e,s)=>e in d?g(d,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):d[e]=s;var h=(d,e,s)=>f(d,typeof e!="symbol"?e+"":e,s);import{n as p}from"./languages-C13mc9CV.js";class S{constructor(e="https://leetcode.com",s=200){h(this,"baseUrl");h(this,"minIntervalMs");h(this,"lastRequestTime",0);this.baseUrl=e.replace(/\/+$/,""),this.minIntervalMs=s}async rateLimitDelay(){const s=Date.now()-this.lastRequestTime;s<this.minIntervalMs&&await new Promise(o=>setTimeout(o,this.minIntervalMs-s)),this.lastRequestTime=Date.now()}async fetchWithRetry(e,s={},o=3){await this.rateLimitDelay();for(let m=1;m<=o;m++)try{const i=await fetch(e,{...s,credentials:"include",headers:{"Content-Type":"application/json",Accept:"application/json, text/plain, */*",...s.headers}});if(i.status===429){if(m<o){const n=this.minIntervalMs===0?5:Math.pow(2,m)*600;await new Promise(l=>setTimeout(l,n));continue}throw new Error("LeetCode rate limit reached (HTTP 429). Please wait a moment before continuing.")}return i}catch(i){if(m>=o)throw i;await new Promise(n=>setTimeout(n,this.minIntervalMs===0?5:500*m))}throw new Error("Failed to reach LeetCode after multiple attempts.")}async checkSession(){var s;const e=`
      query userStatus {
        userStatus {
          isSignedIn
          username
          realName
          userSlug
        }
      }
    `;try{const o=await this.fetchWithRetry(`${this.baseUrl}/graphql`,{method:"POST",body:JSON.stringify({query:e})});if(!o.ok)return{isSignedIn:!1,error:`LeetCode responded with HTTP ${o.status}. Please check your internet connection.`};const m=await o.json(),i=(s=m==null?void 0:m.data)==null?void 0:s.userStatus;return i&&i.isSignedIn?{isSignedIn:!0,username:i.username||i.userSlug}:{isSignedIn:!1,error:"Not logged in. Please sign in to LeetCode in your browser to import your historical submissions."}}catch(o){return{isSignedIn:!1,error:(o==null?void 0:o.message)||"Could not connect to LeetCode."}}}async fetchSubmissionsPage(e=0,s=20,o){var i;const m=`
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
    `;try{const n=await this.fetchWithRetry(`${this.baseUrl}/graphql`,{method:"POST",body:JSON.stringify({query:m,variables:{offset:e,limit:s,lastKey:o||null}})});if(n.ok){const l=await n.json(),t=(i=l==null?void 0:l.data)==null?void 0:i.submissionList;if(t&&Array.isArray(t.submissions))return{submissions:t.submissions.map(a=>{const r=String(a.lang||"").toLowerCase(),c=p(r);return{id:String(a.id),title:a.title||"",titleSlug:a.titleSlug||"",statusDisplay:a.statusDisplay||(a.isPending?"Pending":"Unknown"),lang:r,normalizedLanguage:c,runtime:a.runtime||void 0,memory:a.memory||void 0,timestamp:Number(a.timestamp)||Math.floor(Date.now()/1e3),url:a.url?a.url.startsWith("http")?a.url:`${this.baseUrl}${a.url}`:void 0}}),hasNext:!!t.hasNext,lastKey:t.lastKey||void 0}}}catch{}try{const n=`${this.baseUrl}/api/submissions/?offset=${e}&limit=${s}`,l=await this.fetchWithRetry(n,{method:"GET"});if(l.ok){const t=await l.json(),u=t.submissions_dump;if(Array.isArray(u))return{submissions:u.map(r=>{const c=String(r.lang||"").toLowerCase(),y=p(c);return{id:String(r.id),title:r.title||"",titleSlug:r.title_slug||"",statusDisplay:r.status_display||"Unknown",lang:c,normalizedLanguage:y,runtime:r.runtime||void 0,memory:r.memory||void 0,timestamp:Number(r.timestamp)||Math.floor(Date.now()/1e3),url:r.url?r.url.startsWith("http")?r.url:`${this.baseUrl}${r.url}`:void 0,code:r.code||void 0}}),hasNext:!!t.has_next}}}catch(n){throw new Error(`Failed to fetch LeetCode submissions page at offset ${e}: ${(n==null?void 0:n.message)||"Network error"}`)}return{submissions:[],hasNext:!1}}async fetchSubmissionDetails(e){var o,m;const s=parseInt(String(e),10);if(!isNaN(s)){const i=`
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
      `;try{const n=await this.fetchWithRetry(`${this.baseUrl}/graphql`,{method:"POST",body:JSON.stringify({query:i,variables:{submissionId:s}})});if(n.ok){const l=await n.json(),t=(o=l==null?void 0:l.data)==null?void 0:o.submissionDetails;if(t&&t.code){const u=Array.isArray(t.topicTags)?t.topicTags.map(a=>a.name||a.slug).filter(Boolean):[];return{code:t.code,runtime:t.runtimeDisplay||(t.runtime?`${t.runtime} ms`:void 0),memory:t.memoryDisplay||(t.memory?`${t.memory} MB`:void 0),problemId:((m=t.question)==null?void 0:m.questionId)||void 0,topicTags:u,statusCode:t.statusCode}}}}catch{}}try{const i=`${this.baseUrl}/submissions/detail/${e}/`,n=await this.fetchWithRetry(i,{method:"GET"});if(n.ok){const l=await n.text();let t="";const u=l.match(/submissionCode:\s*['"]([\s\S]*?)['"],/);if(u&&u[1])try{t=JSON.parse(`"${u[1]}"`)}catch{t=u[1].replace(/\\n/g,`
`).replace(/\\'/g,"'").replace(/\\"/g,'"')}if(!t){const c=l.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);c&&c[1]&&(t=c[1].replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/&quot;/g,'"'))}let a;const r=l.match(/questionId:\s*['"]?(\d+)['"]?/);return r&&(a=r[1]),{code:t,problemId:a}}}catch(i){throw new Error(`Failed to retrieve code for submission ${e}: ${(i==null?void 0:i.message)||"Network error"}`)}return{code:""}}}export{S as L};
