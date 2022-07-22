require("dotenv").config()

const router = require("express").Router()
/* Login + Register*/

const bcrypt = require("bcrypt")
const User = require("../models/user")
const jwt = require("jsonwebtoken")
const verifyJWT = require("../verifyJWT")
const msg = require("../helpers/email/msgs")

// hello_algolia.js
const algoliasearch = require("algoliasearch")

// Connect and authenticate with your Algolia app
const client = algoliasearch("SJKC9QEQKE", "33d7716afe47f46cf5c640953ca00acb")

router.get("/", (req, res) => {
  console.log("home")
  res.send("Home Page")
})

router.post("/register", async (req, res) => {
  console.log("register")

  const user = req.body
  console.log(user)

  // const takenUsername = await User.findOne({ username: user.username })
  const takenEmail = await User.findOne({ email: user.email })

  console.log(takenEmail)

  if (takenEmail) {
    res.json({ message: msg.taken })
  } else {
    console.log("saving")
    user.password = await bcrypt.hash(req.body.password, 10)
    try {
      const dbUser = new User({
        email: user.email.toLowerCase(),
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName
      })
      dbUser.save()
      res.json({ message: "Success" })
    } catch (error) {
      console.log("error")
      console.log(error)
    }
  }

  //! Index
  /* Add a single object to index algolia serach */
  //! Index
})

router.post("/login", async (req, res) => {
  console.log("login")

  const userLoggingIn = req.body
  /* find record of user */

  const email = userLoggingIn.email.toLowerCase()

  console.log(email)

  // console.log("USERNAME " + req.body.username)

  User.findOne({ email: email }).then(dbUser => {
    console.log(!dbUser)

    if (!dbUser) {
      return res.json({
        message: msg.failed
      })
    }

    if (!dbUser.confirmed) {
      return res.json({
        message: msg.resend
      })
    }

    bcrypt.compare(userLoggingIn.password, dbUser.password).then(isCorrect => {
      // console.log("/login password correct?:" + isCorrect)
      if (isCorrect) {
        const payload = {
          id: dbUser._id,
          email: dbUser.email
        }

        console.log(payload)
        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          {
            expiresIn: 186400
          },
          (err, token) => {
            // console.log("/login Server token set = " + token)
            if (err) return res.json({ message: err })
            return res.json({
              message: "Success",
              token: "Bearer " + token,
              id: dbUser.id,
              avatar: dbUser.image,
              email: dbUser.email,
              created: dbUser.createdAt
            })
          }
        )
      } else {
        return res.json({
          message: "invalid Username or Password"
        })
      }
    })
  })
})

/* dashboard */
/* router.get("/dashboard", verifyJWT, (req, res) => {
  console.log("dashboard")
  res.send("dashboard")
})
 */
/* If use is logged send back user information */

router.get("/isUserAuth", verifyJWT, (req, res) => {
  console.log("isUserAuth")

  return res.json({ isLoggedIn: true, user: req.user })
})

router.get("/getUsername", verifyJWT, (req, res) => {
  console.log("prxy")
  res.json({ isLoggedIn: true, user: req.user.username })
})

router.get("/users", verifyJWT, async (req, res) => {
  console.log("/users")
  try {
    const users = await User.find({}).select("-image").lean()
    // Create a new index and add a record
    const index = client.initIndex("users")
    const record = users

    await index.replaceAllObjects(users, {
      autoGenerateObjectIDIfNotExist: true
    })
  } catch (error) {
    console.log(error)
  }
})

router.get("/user", verifyJWT, async (req, res) => {
  console.log("/user")
  const userID = req.user.id
  try {
    // const user = await User.findById({ _id: userID }).select("-image").lean()

    const user = await User.findById({ _id: userID }).lean()
    console.log(user)
    res.json(user)
  } catch (error) {
    console.log(error)
  }
})

router.put("/profile/edit", verifyJWT, async (req, res) => {
  console.log("/profile/edit")

  const userID = req.user.id
  /* Find User */

  const body = req.body
  // console.log(id)
  // console.log(body)
  try {
    const user = await User.findByIdAndUpdate({ _id: userID }, body, { new: true })

    console.log(Array.isArray(user))

    res.json({ message: "success" })
  } catch (error) {
    console.log("error" + error)
  }

  /* Send update object to user and save */
  /* Return Success */
})

/* update avatar */
router.put("/profile/updateavatar", verifyJWT, async (req, res) => {
  console.log("/profile/updateavatar")

  const userID = req.user.id
  /* Find User */

  const body = req.body
  // console.log(id)
  // console.log(body)
  try {
    const user = await User.findByIdAndUpdate({ _id: userID }, body, { new: true })

    console.log(Array.isArray(user))

    res.json({ message: "success" })
  } catch (error) {
    console.log("error" + error)
  }

  /* Send update object to user and save */
  /* Return Success */
})

router.get("/userfeed", verifyJWT, async (req, res) => {
  console.log("/userfeed")

  const userID = req.user.id
  /* Find User */

  // const body = req.body
  // console.log(id)
  // console.log(body)
  try {
    // const user = await User.findById({ _id: userID }).select("-image").select("comments").populate("posts").populate("answers").populate("comments")
    const user = await User.findById({ _id: userID }).select("comments answers posts").populate("comments answers posts")
    console.log("=====================================")

    const userfeed = user.posts.concat(user.comments, user.answers)

    console.log(userfeed)

    res.json(userfeed)
  } catch (error) {
    console.log("error" + error)
  }

  /* Send update object to user and save */
  /* Return Success */
})

module.exports = router
/* logging out handled on front end */
