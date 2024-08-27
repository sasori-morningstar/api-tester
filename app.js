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
    res.status(200).json({message: "Welcome to Api Tester."})
})