function formatUrlForGet(targetWebsite) {
    const queries = targetWebsite.split(process.env.AND_FOR_QUERY_NAME)
    const baseUrl = queries[0]

    const url = new URL(baseUrl)
    const searchParams = new URLSearchParams(url.search)

    for (let i = 0; i < queries.length; i++) {
        const [key, value] = queries[i].split("=")
        searchParams.append(decodeURIComponent(key), decodeURIComponent(value))

    }

    url.search = searchParams.toString()

    return url.toString()
}

function formatParamsForPost(postParams) {
    const params = postParams.split(process.env.AND_FOR_QUERY_NAME)
    const searchParams = new URLSearchParams()
    for (let i = 0; i < params.length; i++) {
        const [key, value] = params[i].split("=")
        searchParams.append(decodeURIComponent(key), decodeURIComponent(value))

    }
    return searchParams.toString()
}

module.exports = {
    formatUrlForGet,
    formatParamsForPost
}