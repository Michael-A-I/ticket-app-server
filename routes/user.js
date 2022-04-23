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
// Requiring ObjectId from mongoose npm package
const ObjectId = require("mongoose").Types.ObjectId
var deepPopulate = require("mongoose-deep-populate")(mongoose)

router.get("/u/posts/:id", async (req, res) => {
  console.log("user info")
  const id = req.params.id

  /* posts by user */
  const userPosts = await User.findById(id).populate("posts")
  console.log(userPosts)
  res.json(userPosts)
})

router.get("/u/comments/:id", async (req, res) => {
  console.log("user info")
  const id = req.params.id

  /* comments by user */
  const userComments = await User.findById(id).populate("comments")
  console.log(userComments)
  return res.json(userComments)
})

router.get("/u/:id", verifyJWT, async (req, res) => {
  console.log("user info")
  const id = req.params.id
  // Validator function
  function isValidObjectId(id) {
    if (ObjectId.isValid(id)) {
      if (String(new ObjectId(id)) === id) return true
      return false
    }
    return false
  }
  /* user */
  const user = await User.findById(id)

  /* comments by user */
  const userComments = await User.findById(id).populate("comments")
  /* posts by user */
  const userPosts = await User.findById(id).populate("posts")
  /* posts followed by user */
  const postFollowedByUser = await User.findById(id).populate("hasPostFollowed")

  const otherUserCommentsPosts = await User.find({ _id: { $in: user.hasPostFollowed } })

  // push all data into one array then send to front end.
  const allPostsData = userPosts.posts.concat(userComments.comments, postFollowedByUser.hasPostFollowed)
  // console.log("All feed data as array: " + allPostsData)

  await res.json(allPostsData)
})

module.exports = router
