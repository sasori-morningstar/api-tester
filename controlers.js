const fetch = require('node-fetch');
const HttpsProxyAgent = require('https-proxy-agent');
const HttpProxyAgent = require('http-proxy-agent');
const {formatParamsForPost, formatUrlForGet} = require("./format")



/* TEST HERE: 
    GET: http://localhost:3000/api/request?method=GET&target=https://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=4658%3Cand%3Emanga=4199%3Cand%3Emanga=11608
    http://localhost:3000/api/request?method={METHOD}&target= {{targetWebsite}?{query}={value}<and>{query}={value}<and>...<and>{query}={value}} &{postParam}={postValue}&...&{postParam}={postValue}
*/
/* TEST HERE:
    POST: http://localhost:3000/api/request?method=POST&target=https://reqres.in/api/users/&params=name=ilyes<and>ggg=developer<and>...<and>value=key
    http://localhost:3000/api/request?method={METHOD}&target= {{targetWebsite}&params={query}={value}<and>{query}={value}<and>...<and>{query}={value}}
*/
async function nodeFetcher(req, res) {
    const method = req.query.method
    const targetWebsite = req.query.target
    const proxyUrl = req.query.proxy;

    if (!targetWebsite) {
        return res.status(400).json({ error: 'Target website URL is required.' });
    }

    try {

        let response
        const proxyAgent = proxyUrl ? (targetWebsite.startsWith('https') ? new HttpsProxyAgent(proxyUrl) : new HttpProxyAgent(proxyUrl)) : undefined;
        if (method == "GET") {
            let formatedTargetWebsite = formatUrlForGet(targetWebsite)
            response = await fetch(formatedTargetWebsite, { agent: proxyAgent })
        } else if (method == "POST") {
            const params = req.query.params;
            const formattedParams = formatParamsForPost(params)
            response = await fetch(targetWebsite, {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }, 
                body: formattedParams,
                agent: proxyAgent
            })

        }


        const contentType = response.headers.get("content-type").split(";")[0]
        let body;
        if (contentType.startsWith("text")) {
            body = await response.text()
        } else if (contentType == "application/json") {
            body = await response.json()
        } else {
            body = `Unsupported content type: ${contentType}`;
        }
        res.status(200).json({ status: response.status, message: body })
    } catch (err) {
        res.status(401).send(err)
    }
}

module.exports = {
    nodeFetcher
}