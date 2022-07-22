require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const basicAuth = require("express-basic-auth")
// const cookieParser = require("cookie-parser")
const path = require("path")
const mongoose = require("mongoose")
const cors = require("cors")

const index = require("./routes/index")
const posts = require("./routes/posts")
const email = require("./routes/email")

const app = express()
app.use(cors())

/* middleware set up */
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))
app.use(express.json())

const dbURI = process.env.URI
/* routes */

app.use("/api/", index)
app.use("/api/", posts)

/* keep heroku server from sleeping with uptime robot*/
app.get("/wake-up", (req, res) => res.json("👌"))

/* Email Verification */
app.use("/api/email", email)

console.log(process.env.PORT_SERVER)
/* Connect to MongDB database */
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(res => {
    app.listen(process.env.PORT || process.env.PORT_SERVER || 5000, () => console.log("server is up"))
  })
  .catch(err => console.log(err))
