require("dotenv").config()
const mongoose = require("mongoose")
const router = require("express").Router()
/* Login + Register*/
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const Comments = require("../models/comments")
const User = require("../models/user")
const Answers = require("../models/answers")
const Tickets = require("../models/tickets")
const { resolveWatchPlugin } = require("jest-resolve")

// Models
const Projects = require("../models/projects")

// ticket index
router.get("/projects/tickets/:id", async (req, res) => {
  console.log("projects")
  const id = req.params.id

  try {
    const { tickets } = await Projects.findById(id).populate({ path: "tickets", populate: [{ path: "createdBy" }, { path: "assigned" }] })
    // console.log(tickets)

    res.json(tickets)
  } catch (error) {
    res.json({ msg: error })
  }
})

// get ticket

router.get("/projects/ticket/:id", async (req, res) => {
  const id = req.params.id
  // console.log({ id })
  const ticket = await Tickets.findById({ _id: id })

  // console.log({ ticket })

  res.json(ticket)
})

//create ticket
router.post("/projects/:id/tickets/new", async (req, res) => {
  console.log("/projects/:id/tickets/new")

  const ticket = req.body
  const email = req.body.email
  const projectId = req.params.id
  const createTicketUser = await User.findOne({ email: email })
  const assignedTicketUser = await User.findById({ _id: ticket.assigned })
  const project = await Projects.findById({ _id: projectId })
  console.log({ createTicketUser })
  console.log({ email })

  const id = createTicketUser._id.toString()

  // console.log(project)
  // console.log(id)
  // console.log({ ticket, email, createTicketUser, id })

  // console.log({ createdTickets: createTicketUser.createdTickets })
  // console.log({ createTicketUser })
  const dbTicket = new Tickets({
    title: ticket.title,
    description: ticket.description,
    createdBy: id,
    numberOfLikes: 0,
    project: projectId,
    hasUserLiked: [],
    hasUserFollowed: [],
    file: ticket.file,
    category: ticket.category,
    assigned: ticket.assigned,
    status: ticket.status,
    priority: ticket.priority
  })

  // console.log({ dbTicket })
  // console.log({ project })
  // console.log({ projectId })
  try {
    dbTicket.save(function (err, project) {
      if (project) {
        res.json({ msg: "Success", _id: project.id })
      } else {
        console.log(err)
      }
    })
  } catch (error) {
    res.json({ err: error })
  }

  // should be saved to assined user if unassigned then return

  createTicketUser.createdTickets.push(dbTicket)
  assignedTicketUser.myTickets.push(dbTicket)

  project.tickets.push(dbTicket)
  /* save to db */
  createTicketUser.save(function (err) {
    if (err) {
      console.log(err)
    }
  })
  if (ticket.assigned != "unassigned") {
    assignedTicketUser.save(function (err) {
      if (err) {
        console.log(err)
      }
    })
  }
  project.save(function (err) {
    if (err) {
      console.log(err)
    }
  })
  /*  */
})

// edit ticket

router.put("/projects/ticket/:id", async (req, res) => {
  try {
    const id = req.params.id

    const { files } = req.body
    // console.log({ files })
    const body = req.body
    // ! dont overwrite images
    // delete body.files
    console.log({ body })

    const ticket = await Tickets.findByIdAndUpdate({ _id: id }, body, { new: true })

    res.json(ticket)
  } catch (error) {
    console.log(error)
  }
})

router.put("/project/:id/comments", async (req, res) => {
  const id = req.params.id
  const body = req.body
  // const ticket = await Tickets.findById({ _id: id })
  console.log({ body })
  const comment = await Comments.findByIdAndUpdate({ _id: id }, body, { new: true })
  res.json(comment)
})

// delete ticket

router.delete("/projects/ticket:id", async (req, res) => {
  console.log("/projects/:id")
  try {
    const id = req.params.id

    const project = await Tickets.deleteOne({ _id: id })
  } catch (error) {
    console.log(error)
  }
})

// Comments

/* ticket Comment */

router.post("/projects/ticket/:id/comments", async (req, res) => {
  console.log("/project/:id/comments")

  const comments = req.body
  const id = req.params.id
  const userEmail = comments.email
  const user = await User.findOne({ email: userEmail })
  const ticket = await Tickets.findById(id)

  /* creates relationshipt between single comment and the single project */
  const dbComments = new Comments({
    text: comments.text,
    ticket: id,
    user: user._id,
    name: user.username,
    firstName: user.firstName,
    lastName: user.lastName
  })

  dbComments.save()

  /* relationship between projects and comments */
  ticket.comments.push(dbComments)
  /* relationship between user and comments */
  user.comments.push(dbComments)

  ticket.save(function (err) {
    if (err) {
      console.log(err)
    }
  })
  user.save(function (err) {
    if (err) {
      console.log(err)
    }
  })
  // console.log({ ticket })
  res.json({ message: "Success" })
  console.timeEnd("getUploadRead")
})

// get comments
router.get("/projects/ticket/:id/comments", async (req, res) => {
  console.log("GET /project/:id/comments")

  const id = req.params.id

  // const userId = user.id
  // const user = await User.findOne({ email: userEmail })
  const ticket = await Tickets.findById(id).populate("comments")

  // console.log({ ticket })
  console.log({ yo: ticket.comments })

  res.json(ticket)
})

// my tickets

// my ticket

router.get("/projects/myticket/:id", async (req, res) => {
  console.log("get mytickets")
  const id = req.params.id
  console.log({ id })
  try {
    const { myTickets } = await User.findById(id).populate({ path: "myTickets", populate: [{ path: "createdBy" }, { path: "assigned" }] })
    console.log({ myTickets })

    res.json(myTickets)
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
