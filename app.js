const express = require("express")
const app = express()
const session = require("express-session")
const cors = require("cors")

const routes = require("./routes")

require("dotenv").config()

const PORT = process.env.PORT
const SECRET = process.env.SECRET

app.listen(PORT, ()=>{
    console.log(`Server is running on port: ${PORT}`)
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use("/api", routes)
app.get("/", (req, res)=>{
    res.status(200).json({
        message: "Welcome to Api Tester.",
        guide: {
            GET: "Please use this format: http://localhost:3000/api/request?method=GET&target={{targetWebsite}?{query}={value}<and>{query}={value}<and>...<and>{query}={value}}",
            POST: "Please use this format: http://localhost:3000/api/request?method=POST&target={targetWebsite}&params={name}={value}<and>{name}={value}<and>...<and>{name}={value}"
        },
        proxy: "To use proxy in your request, please add a proxy query with the url of the proxy as a value, (EX: ?proxy=protocol://name:pass@ip:port)"
    })
})