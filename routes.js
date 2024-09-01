const express = require("express")
const controlers = require("./controlers")
const router = express.Router()

router.get("/request", controlers.nodeFetcher)
//router.get("/test", controlers.testProxy)

module.exports = router