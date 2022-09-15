require("dotenv").config()
const mongoose = require("mongoose")
const router = require("express").Router()
/* Login + Register*/
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const Projects = require("../models/projects")
const Comments = require("../models/comments")
const User = require("../models/user")
const Answers = require("../models/answers")
const Tickets = require("../models/tickets")

const { resolveWatchPlugin } = require("jest-resolve")

/* Algolia Searh */
// hello_algolia.js
const algoliasearch = require("algoliasearch")

// Connect and authenticate with your Algolia app
const client = algoliasearch("SJKC9QEQKE", "33d7716afe47f46cf5c640953ca00acb")
/* Algolia Searh */

// Models
// project index
router.get("/indexSearch", async (req, res) => {
  console.log("indexSearch")
  try {
    const projects = await Projects.find({})
    // console.log({ projects })

    const index = client.initIndex("projects")
    const record = projects
    console.log({ record })

    await index.replaceAllObjects(record, {
      autoGenerateObjectIDIfNotExist: true
    })

    // res.json(projects)
  } catch (error) {
    res.json({ msg: error })
  }

  return
  try {
    const post = await Post.find({}).select("-file").lean()
    // Create a new index and add a record
    const index = client.initIndex("projects")
    const record = post

    await index.replaceAllObjects(post, {
      autoGenerateObjectIDIfNotExist: true
    })
  } catch (error) {
    console.log(error)
  }
})

router.get("/indexTickets", async (req, res) => {
  console.log("indexTickets")
  try {
    const tickets = await Tickets.find({})
    // console.log({ tickets })

    const index = client.initIndex("tickets")
    const record = tickets

    // console.log({ index })

    await index.replaceAllObjects(record, {
      autoGenerateObjectIDIfNotExist: true
    })
  } catch (error) {
    res.json({ msg: error })
  }

  return
  try {
    const post = await Post.find({}).select("-file").lean()
    // Create a new index and add a record
    const index = client.initIndex("projects")
    const record = post

    await index.replaceAllObjects(post, {
      autoGenerateObjectIDIfNotExist: true
    })
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
