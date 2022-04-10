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
const user = require("./routes/user")
const app = express()
app.use(cors())

/* middleware set up */
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const dbURI = process.env.URI
/* routes */

app.use("/", index)
app.use("/", posts)
app.use("/", user)

console.log(process.env.PORT_SERVER)
/* Connect to MongDB database */
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(res => {
    app.listen(process.env.PORT_SERVER, () => console.log("server is up"))
  })
  .catch(err => console.log(err))
