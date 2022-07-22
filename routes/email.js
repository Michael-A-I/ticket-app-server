require("dotenv").config()
const router = require("express").Router()
const User = require("../models/user")
const sendEmail = require("../helpers/email/send")
const msg = require("../helpers/email/msgs")
const templates = require("../helpers/email/confirmEmail")

/* Code */

/* Sends Confirmation Email */
router.post("/collect", async (req, res) => {
  console.log("/collect")
  const email = req.body.email

  console.log(email)

  const user = await User.findOne({ email })
  console.log(user)
  try {
    if (!user) {
      // send email
      sendEmail(user.email, templates.confirm(user._id))
      console.log("sending email")
      res.json({ msg: msg.confirm })
    } else if (user && !user.emailValidated) {
      console.log("sending reconfirmation email")
      sendEmail(user.email, templates.confirm(user._id))
      res.json({ msg: msg.resend })
    } else {
      console.log("user already confirmed no need to confirm again")
      res.json({ msg: msg.alreadyConfirmed })
    }
  } catch (error) {
    console.log(error)
  }
})

/* confirm user */
router.get("/confirmed/:id", async (req, res) => {
  const { id } = req.params
  const user = User.findById(id)

  try {
    if (!user) {
      res.json({ msg: msg.couldNotFind })
    }

    // The user exists but has not been confirmed. We need to confirm this
    // user and let them know their email address has been confirmed.
    else if (user && !user.confirmed) {
      await User.findByIdAndUpdate(id, { confirmed: true })

      res.json({ msg: msg.confirmed })
    } else {
      res.json({ msg: msg.alreadyConfirmed })
    }
  } catch (error) {
    console.log(error)
  }
})

module.exports = router

/* https://morioh.com/p/7747be224b10 */
