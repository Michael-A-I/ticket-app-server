require("dotenv").config()
const mongoose = require("mongoose")
const router = require("express").Router()
/* Login + Register*/
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const Comments = require("../models/comments")
const User = require("../models/user")
const Answers = require("../models/answers")
const Uuid = require("../models/uuid")
const Tickets = require("../models/tickets")
const { resolveWatchPlugin } = require("jest-resolve")

// Models
const Projects = require("../models/projects")
// project index
router.get("/projects", async (req, res) => {
  console.log("projects")
  try {
    const projects = await Projects.find({}).populate([{ path: "createdBy" }, { path: "assigned" }])
    // console.log(projects)
    res.json(projects)
  } catch (error) {
    res.json({ msg: error })
  }
})

// get project

router.get("/projects/:id", async (req, res) => {
  const id = req.params.id
  // console.log({ id })
  const project = await Projects.findById({ _id: id }).populate("comments").populate("answers").populate("assigned").populate("createdBy")

  // console.log({ project })

  res.json(project)
})

//create project
router.post("/projects/new", async (req, res) => {
  console.log("/projects/new")
  try {
    const project = req.body
    const email = req.body.email
    const formUuid = await Uuid.findOne({ uuid: project.uuid })

    if (formUuid) {
      res.json({ err: "form already submitted" })
      return
    }
    const formId = new Uuid({
      uuid: project.uuid
    })

    formId.save(function (err, uuid) {
      if (uuid) {
        console.log({ uuid })
      } else {
        console.log(err)
        res.json({ err: err.message })
      }
    })

    const user = await User.findOne({ email })

    console.log({ email })

    console.log({ user })

    const id = user._id.toString()
    // console.log(project)
    // console.log(id)
    // console.log({ project })

    // console.table([
    //   ["id", user.id],
    //   ["file ", project.file]
    // ])

    const dbProject = new Projects({
      title: project.title,
      description: project.description,
      createdBy: id,
      assigned: id,
      name: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      numberOfLikes: 0,
      hasUserLiked: [],
      hasUserFollowed: [],
      file: project.file,
      category: project.category
    })

    // console.log({ dbProject })

    dbProject.save(function (err, project) {
      if (project) {
        res.json({ msg: "Success", _id: project.id })
      } else {
        console.log(err)
        res.json({ err: err.message })
      }
    })

    // !UPDATE
    // projects related to tieckts
    /* sets posts on USER model */

    user.projects.push(dbProject)

    /* save to db */
    user.save(function (err) {
      if (err) {
        console.log(err)
        res.json({ err: err.message })
      }
    })
  } catch (error) {
    console.log(error)
    res.json({ err: error.message })
  }
})

// edit project
router.put("/projects/:id", async (req, res) => {
  console.log("/projects/:id")
  try {
    const id = req.params.id

    const body = req.body
    console.log(req.body)

    const project = await Projects.findByIdAndUpdate({ _id: id }, body, { new: true })

    res.json({ msg: "Success" })
  } catch (error) {
    console.log(error)
    res.json({ err: error })
  }
})

//archive
router.put("/projects/:id/archived", async (req, res) => {
  console.log("/projects/:id")
  try {
    const id = req.params.id

    const body = req.body
    body.done = true
    console.log({ body })
    const project = await Projects.findByIdAndUpdate({ _id: id }, body, { new: true })
    const tickets = await Tickets.updateMany({ project: id }, { $set: { done: true } })
    console.log({ tickets })

    return

    /* set all tickets to done as well*/
    /*  */
    res.json({ msg: "Success" })
  } catch (error) {
    console.log(error)
    res.json({ err: error })
  }
})

// delete project

router.delete("/projects/:id", async (req, res) => {
  console.log("/projects/:id")
  try {
    const id = req.params.id

    const project = await Projects.deleteOne({ _id: id })
  } catch (error) {
    console.log(error)
  }
})

// Comments

/* Projects Comment */

router.post("/project/:id/comments", async (req, res) => {
  console.time("getUploadRead")

  console.log("/project/:id/comments")

  const comments = req.body
  const id = req.params.id
  const userEmail = comments.email

  // const userId = user.id
  const user = await User.findOne({ email: userEmail })
  const project = await Projects.findById(id)

  // console.log({ project, comments, user, usercomments: user, userEmail })

  /* creates relationshipt between single comment and the single project */
  const dbComments = new Comments({
    text: comments.text,
    project: id,
    projectName: project.title,
    user: user._id,
    name: user.username,
    firstName: user.firstName,
    lastName: user.lastName
  })

  dbComments.save()

  /* relationship between projects and comments */
  project.comments.push(dbComments)
  /* relationship between user and comments */
  user.comments.push(dbComments)

  project.save(function (err) {
    if (err) {
      // console.log(err)
    }
  })
  user.save(function (err) {
    if (err) {
      // console.log(err)
    }
  })

  res.json({ message: "Success" })
  console.timeEnd("getUploadRead")
})

// get comments
router.get("/project/:id/comments", async (req, res) => {
  console.log("GET /project/:id/comments")

  const id = req.params.id

  // const userId = user.id
  // const user = await User.findOne({ email: userEmail })
  const comments = await Projects.findById(id).populate("comments")

  // console.log({ comments })

  res.json(comments)
})

module.exports = router
