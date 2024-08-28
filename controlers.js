const fetch = require('node-fetch');
const HttpsProxyAgent = require('https-proxy-agent');
const HttpProxyAgent = require('http-proxy-agent');
const url = require('url');
const { formatParamsForPost, formatUrlForGet } = require("./format");

async function nodeFetcher(req, res) {
    const method = req.query.method;
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
            // Parse the proxy URL to extract hostname, port, and auth
            const parsedProxyUrl = url.parse(proxyUrl);
            const auth = parsedProxyUrl.auth ? parsedProxyUrl.auth.split(':') : null;

            const proxyOptions = {
                host: parsedProxyUrl.hostname,
                port: parsedProxyUrl.port,
            };

            if (auth) {
                const [username, password] = auth;
                proxyOptions.auth = `${username}:${password}`;
            }

            proxyAgent = targetWebsite.startsWith('https')
                ? new HttpsProxyAgent.HttpsProxyAgent(proxyOptions)
                : new HttpProxyAgent.HttpProxyAgent(proxyOptions);
        }

        console.log("Proxy Agent:", proxyAgent);

        if (method === "GET") {
            const formattedTargetWebsite = formatUrlForGet(targetWebsite);
            response = await fetch(formattedTargetWebsite, { agent: proxyAgent });
        } else if (method === "POST") {
            const params = req.query.params;
            const formattedParams = formatParamsForPost(params);
            response = await fetch(targetWebsite, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formattedParams,
                agent: proxyAgent,
            });
        }

        const contentType = response.headers.get("content-type").split(";")[0];
        let body;
        if (contentType.startsWith("text")) {
            body = await response.text();
        } else if (contentType === "application/json") {
            body = await response.json();
        } else {
            body = `Unsupported content type: ${contentType}`;
        }

        res.status(200).json({ status: response.status, message: body });
    } catch (err) {
        console.error("Error during fetch:", err); // Improved error logging
        res.status(401).json({ error: err.message, stack: err.stack });
    }
}

module.exports = {
    nodeFetcher,
};
