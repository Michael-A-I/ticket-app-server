require("dotenv").config()
const mongoose = require("mongoose")
const router = require("express").Router()
/* Login + Register*/
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const Comments = require("../models/comments")
const Users = require("../models/user")
const Answers = require("../models/answers")
const { resolveWatchPlugin } = require("jest-resolve")

// Models
const Projects = require("../models/projects")
// Authorization Middleware
const { isProtected, isAdmin } = require("../middleware/isAuthenticated")

const addId = (req, res, next) => {
  // Defining middleware
  console.log("addId")

  next()
}

router.get("/dashboard/index", async (req, res) => {
  console.log("/posts/index")
  console.log(req.id)
  /* Speed increase due to not loading image and using lean */
  const project = await Projects.find({})

  // console.log({ project })

  return res.json(project)
})

router.get("/dashboard/userTickets", async (req, res) => {
  console.log("/posts/userTickets")

  /* Speed increase due to not loading image and using lean */
  const users = await Users.find({}).populate("myTickets")

  // console.log({ users })

  return res.json(users)
})

router.get("/dashboard/myTickets/:email", async (req, res) => {
  console.log("/posts/userTickets")

  const email = req.params.email

  /* Speed increase due to not loading image and using lean */
  const users = await Users.findOne({ email }).populate("myTickets")

  // console.log({ users })

  return res.json(users)
})

router.get("/dashboard/bugsandfeatures/:email", async (req, res) => {
  console.log("dashboard/bugsandfeatures")

  try {
    const email = req.params.email

    /* Speed increase due to not loading image and using lean */
    const users = await Users.findOne({ email }).populate("myTickets")

    console.log("dashboard/bugsandfeatures")
    // ! on live server users is coming up as null

    console.log({ users })

    return res.json(users)
  } catch (error) {
    console.log(error)
  }
})

router.get("/dashboard/ticketstatus/:email", async (req, res) => {
  console.log("/dashboard/ticketstatus/")

  try {
    const email = req.params.email

    /* Speed increase due to not loading image and using lean */
    const users = await Users.findOne({ email }).populate("myTickets")

    return res.json(users)
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
