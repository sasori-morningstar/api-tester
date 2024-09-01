const fetch = require('node-fetch');
const HttpsProxyAgent = require('https-proxy-agent');
const HttpProxyAgent = require('http-proxy-agent');
const SocksProxyAgent = require('socks-proxy-agent');
const url = require('url');
const { formatParamsForPost, formatUrlForGet } = require('./format');

/*async function testProxy() {
    const proxyUrl = "http://AcpVQtYstcLT4Q7d:wifi;fr;;;@rotating.proxyempire.io:9000";
    const targetUrl = "http://httpbin.org/ip";

    try {
        const proxyAgent = new HttpProxyAgent.HttpProxyAgent(proxyUrl);
        const response = await fetch(targetUrl, { agent: proxyAgent });
        const data = await response.text();
        console.log("Response Data:", data);
    } catch (err) {
        console.error("Proxy Test Error:", err);
    }
}*/

async function nodeFetcher(req, res) {
    const method = req.query.method || 'GET';
    const targetWebsite = req.query.target;
    const proxyUrl = req.query.proxy;

    console.log("Received Proxy URL:", proxyUrl);

    if (!targetWebsite) {
        return res.status(400).json({ error: 'Target website URL is required.' });
    }

    try {
        let response;
        let proxyAgent;

        if (proxyUrl) {
            const parsedProxyUrl = url.parse(proxyUrl);
            console.log(parsedProxyUrl);

            const protocol = parsedProxyUrl.protocol;
            
            if (protocol === 'http:' || protocol === 'https:') {
                proxyAgent = new (protocol === 'https:' ? HttpsProxyAgent.HttpsProxyAgent : HttpProxyAgent.HttpProxyAgent)(proxyUrl);
            } else if (protocol === 'socks4:' || protocol === 'socks5:') {
                proxyAgent = new SocksProxyAgent.SocksProxyAgent(proxyUrl);
            } else {
                return res.status(400).json({ error: 'Unsupported proxy protocol.' });
            }
        }

        console.log("Proxy Agent:", proxyAgent);

        if (method === 'GET') {
            const formattedTargetWebsite = formatUrlForGet(targetWebsite);
            response = await fetch(formattedTargetWebsite, { agent: proxyAgent });
        } else if (method === 'POST') {
            const params = req.query.params;
            const formattedParams = formatParamsForPost(params);
            response = await fetch(targetWebsite, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formattedParams,
                agent: proxyAgent,
            });
        }

        const contentType = response.headers.get('content-type').split(';')[0];
        let body;
        if (contentType.startsWith('text')) {
            body = await response.text();
        } else if (contentType === 'application/json') {
            body = await response.json();
        } else {
            body = `Unsupported content type: ${contentType}`;
        }

        res.status(200).json({ status: response.status, message: body });
    } catch (err) {
        console.error('Error during fetch:', err);
        res.status(401).json({ error: err.message, stack: err.stack });
    }
}

module.exports = {
    nodeFetcher,
    //testProxy
};
