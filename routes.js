const express = require("express")
const controlers = require("./controlers")
const router = express.Router()

router.get("/request", controlers.nodeFetcher)

module.exports = router