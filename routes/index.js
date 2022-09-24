require("dotenv").config()

const router = require("express").Router()
/* Login + Register*/
// const addId = require("../middleware/addId")

const bcrypt = require("bcrypt")
const User = require("../models/user")

// Userfront token verification.
const jwt = require("jsonwebtoken")
const publicKey = process.env.PUBLICKEY

const msg = require("../helpers/email/msgs")

// hello_algolia.js
const algoliasearch = require("algoliasearch")

// Connect and authenticate with your Algolia app
const client = algoliasearch("SJKC9QEQKE", "33d7716afe47f46cf5c640953ca00acb")

const assignUser = require("../middleware/assignUser")
router.use(assignUser)

const { isProtected, isAdmin } = require("../middleware/isAuthenticated")
const { accessSync } = require("fs-extra")
const { resolveContent } = require("nodemailer/lib/shared")

router.get("/", (req, res) => {
  res.send("sdfasdf")
})

router.get("/login/test", isAdmin, (req, res) => {
  console.log("home")
  // console.log({ cookie: access.pn4qd8qb })
  // console.log({ c })

  res.send("test")
})

router.post("/register", async (req, res) => {
  console.log("register")

  const user = req.body
  const email = user.email.toLowerCase()

  console.log(user)

  // const takenUsername = await User.findOne({ username: user.username })
  const takenEmail = await User.findOne({ email: email })

  console.log(takenEmail)

  if (takenEmail) {
    res.json({ message: msg.taken })
  } else {
    try {
      const dbUser = new User({
        email: user.email.toLowerCase(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        userId: user.userId
      })
      dbUser.save()
      res.json({ message: "Success" })
    } catch (error) {
      console.log("error")
      console.log(error)
    }
  }
})

/* dashboard */
/* router.get("/dashboard", (req, res) => {
  console.log("dashboard")
  res.send("dashboard")
})
 */
/* If use is logged send back user information */

router.get("/isUserAuth", (req, res) => {
  console.log("isUserAuth")

  return res.json({ isLoggedIn: true, user: req.user })
})

router.get("/getUserEmail", (req, res) => {
  console.log("prxy")
  res.json({ isLoggedIn: true, user: req.user.email })
})

router.get("/users", async (req, res) => {
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

/* get users with image */
router.get("/usersIndex", async (req, res) => {
  console.log("/usersIndex /users w/ image")

  try {
    const users = await User.find({})

    return res.json(users)
  } catch (error) {
    console.log(error)
  }
})

/* edit user */
router.put("/user/:id", async (req, res) => {
  console.log("/user/:id")
  const id = req.params.id
  const body = req.body
  console.log(body)
  try {
    const user = await User.findByIdAndUpdate({ _id: id }, body, { new: true })

    return res.json(user)
  } catch (error) {
    console.log(error)
  }
})

// Update user in USERFRONT.js
router.put("/user/userfront/:id", async (req, res) => {
  console.log("/user/userfront/:id")
  const id = req.params.id
  const body = req.body

  console.log({ id })
  console.log({ body })
  const payload = body[0]
  const roles = body[1]

  // try {
  //   const response = await fetch(`https://api.userfront.com/v0/users/${id}/`, {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer uf_test_admin_pn4qd8qb_716f06f96e75339e20560eff39515269"
  //     },
  //     body: JSON.stringify(body)
  //   })
  //   console.log(await response.json())
  //   // return await response.json()
  // } catch (error) {
  //   console.log(error)
  // }

  try {
    const response = await fetch(`https://api.userfront.com/v0/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer uf_test_admin_pn4qd8qb_716f06f96e75339e20560eff39515269"
      },
      body: JSON.stringify(payload)
    })
    console.log(await response.json())
  } catch (error) {
    console.log(error)
  }

  try {
    const response = await fetch(`https://api.userfront.com/v0/users/${id}/roles`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer uf_test_admin_pn4qd8qb_716f06f96e75339e20560eff39515269"
      },
      body: JSON.stringify(roles)
    })
    console.log(await response.json())
  } catch (error) {
    console.log(error)
  }
})

/* delete user */
router.delete("/user/:id", isProtected, isAdmin, async (req, res) => {
  try {
    console.log("delete /user/:id")
    const id = req.params.id
    const deleteUser = await User.deleteOne({ _id: id })

    res.json({ msg: "user deleted" })
  } catch (error) {
    console.log(error)
    res.json({ msg: error })
  }
})

router.get("/user/:email", async (req, res) => {
  console.log("/user")
  const email = req.params.email

  try {
    const user = await User.findOne({ email })

    // const user = await User.findByIdAndUpdate({ _id: userID }, body, { new: true })
    console.log(user)
    res.json(user)
  } catch (error) {
    console.log(error)
  }
})

router.put("/profile/edit/:email", async (req, res) => {
  console.log("/profile/edit")

  // const userID = req.user.id
  /* Find User */
  const email = req.params.email
  const body = req.body
  // console.log(id)
  console.log(body)
  try {
    const { _id } = await User.findOne({ email })

    const user = await User.findByIdAndUpdate({ _id }, body, { new: true })

    console.log(Array.isArray(user))

    res.json({ message: "success" })
  } catch (error) {
    console.log("error" + error)
  }

  /* Send update object to user and save */
  /* Return Success */
})

/* update avatar */
router.put("/profile/updateavatar", async (req, res) => {
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

router.get("/userfeed/:email", async (req, res) => {
  console.log("/userfeed")

  const email = req.params.email
  /* Find User */
  console.log(email)
  // const body = req.body
  // console.log(id)
  // console.log(body)
  try {
    // const user = await User.findById({ _id: userID }).select("-image").select("comments").populate("posts").populate("answers").populate("comments")
    // const user = await User.findOne({ email }).select("comments answers posts").populate("comments answers posts")

    const user = await User.findOne({ email }).populate([{ path: "myTickets answers posts createdTickets projects" }, { path: "comments", populate: "ticket" }])

    console.log({ user })

    console.log("=====================================")

    const userfeed = user.posts.concat(user.comments, user.projects, user.myTickets)

    console.log(user.comments)

    res.json(userfeed)
  } catch (error) {
    console.log("error" + error)
  }

  /* Send update object to user and save */
  /* Return Success */
})

router.get("/getUser/:email", async (req, res) => {
  const email = req.params.email

  console.log({ email })

  const user = await User.findOne({ email })

  console.log({ user })

  res.json(user)
})

module.exports = router
/* logging out handled on front end */
