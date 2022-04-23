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

/* Post Search */

router.get("/search/:query", verifyJWT, async (req, res) => {
  const query = req.params.query

  const searchedPosts = await Post.find({ $text: { $search: query } })
  // TODO: limit posts by 10 and limit description by first 10 words.
  // TODO: find post by description and title limit post to 1 if query hits multiple times in title
  // TODO: search doesn't have to be exact match

  res.json(searchedPosts)
})

module.exports = router
