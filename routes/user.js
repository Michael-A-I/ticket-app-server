require("dotenv").config()
const mongoose = require("mongoose")
const router = require("express").Router()
/* Login + Register*/
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const Post = require("../models/post")
const Comments = require("../models/comments")
const verifyJWT = require("../verifyJWT")
const User = require("../models/user")

router.get("/u/:id", verifyJWT, async (req, res) => {
  console.log("user info")
  const id = req.params.id

  const userComments = await User.findById(id).populate("comments")
  const userPosts = await User.findById(id).populate("posts")
  console.log(userComments)
  console.log(userPosts)

  await res.json({ posts: userPosts, comments: userComments })
})
module.exports = router
