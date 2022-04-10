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

router.post("/posts/new", verifyJWT, async (req, res) => {
  // console.log(req.body)

  const post = req.body
  const user = req.user
  const userId = user.id

  console.table([
    ["username", user.username],
    ["id", user.id]
  ])

  console.log("USERNAME TYPEOF " + typeof user.username)

  const dbPost = new Post({
    title: post.title,
    description: post.description,
    user: user.id,
    name: user.username,
    numberOfLikes: 0,
    hasUserLiked: null
  })
  /* sets posts on USER model */
  const relatedUser = await User.findById(userId)
  relatedUser.posts.push(dbPost)

  relatedUser.save(function (err) {
    if (err) {
      console.log(err)
    }
  })
  /*  */
  dbPost.save(function (err, post) {
    if (post) {
      res.json({ message: "Success", _id: post.id })
    } else {
      console.log(err)
    }
  })
})

router.get("/posts/index", verifyJWT, async (req, res) => {
  const post = await Post.find({})
  console.log("trying to send data to front end")

  // console.log(res.json)
  return res.json(post)
})

router.get("/posts/:id", verifyJWT, async (req, res) => {
  // console.log(typeof req.params.id)
  let paramsId = req.params.id
  const post = await Post.findById({ _id: `${paramsId}` }).exec()
  console.log("trying to send data to front end")

  // console.log(res.json(post))
  return res.json(post)
})

/*! Update Post */
router.put("/posts/:id", verifyJWT, async (req, res) => {
  console.log("updating...")
  const id = req.params.id
  const body = req.body
  console.log(id)
  console.log(body)
  try {
    await Post.findByIdAndUpdate({ _id: id }, body, { new: true })
  } catch (error) {
    console.log("error" + error)
  }

  try {
    const comment = await Comments.findById(id)

    console.log(comment)
  } catch (error) {}
})

/* Update Post Likes */
router.put("/posts/:id/like", verifyJWT, async (req, res) => {
  console.log("updating likes...")
  const id = req.params.id
  const body = req.body
  const userId = req.user.id
  console.log(body)
  console.log(id)

  try {
    await Post.findByIdAndUpdate({ _id: id }, { $inc: { numberOfLikes: 1 } }, { new: true }).exec()
    /* adds user object t
    o hasUserLiked */
    await Post.findByIdAndUpdate({ _id: id }, { hasUserLiked: userId }, { new: true }).exec()
  } catch (error) {
    console.log(error)
  }
})

/* unlike */
router.put("/posts/:id/unlike", verifyJWT, async (req, res) => {
  console.log("updating unlike...")
  const id = req.params.id
  const body = req.body
  const userId = req.user.id
  console.log(id)
  console.log(userId)

  try {
    const postupdate = await Post.findByIdAndUpdate({ _id: id }, { $inc: { numberOfLikes: -1 } }, { new: true }).exec()
    await Post.findByIdAndUpdate({ _id: id }, { hasUserLiked: userId }, { new: true }).exec()
    /*TODO: updateOne */
    /* remove hasUserLiked */
    await Post.updateOne({ _id: id }, { $pull: { hasUserLiked: userId } })
  } catch (error) {
    console.log(error)
  }
})

/* has user liked? */

router.get("/posts/:id/hasUserLiked", verifyJWT, async (req, res) => {
  console.log("hasUserLiked")
  const userID = req.user.id
  const id = req.params.id

  const post = await Post.findById({ _id: id })

  const hasUserLiked = post.hasUserLiked

  console.log(hasUserLiked)
  if (hasUserLiked !== null) {
    hasUserLiked.map(user => {
      console.log(user)
      console.log(userID)
      if (userID == user) {
        return res.json({ hasLiked: true })
      } else {
        return res.json({ hasLiked: false })
      }
    })
  } else {
    return res.json({ hasLiked: false })
  }
})

/* Delete Post */
router.delete("/posts/:id", verifyJWT, async (req, res) => {
  /* find post by id > delete post */
  let id = req.params.id

  console.log(id)

  try {
    /* if comments attached to post delete comments */

    await Post.deleteOne({ _id: id })

    const post = await Post.findById(id)

    console.log("post deleted")
    return res.json(post)
  } catch (error) {
    console.log(error)
  }
})

router.post("/posts/:id/comments", verifyJWT, async (req, res) => {
  const comments = req.body
  const id = req.params.id
  const user = req.user
  const userId = user.id
  const post = await Post.findById(id)

  /* creates relationshipt between single comment and the single post */
  const dbComments = new Comments({
    text: comments.text,
    post: id,
    postName: post.title,
    user: user.id,
    name: user.username
  })
  dbComments.save()
  /* this creates relationsip between post and many comments */
  const relatedPost = await Post.findById(id)
  relatedPost.comments.push(dbComments)
  /* this creats a relationship to the user and many comments */
  const relatedUser = await User.findById(userId)
  relatedUser.comments.push(dbComments)

  await relatedPost.save(function (err) {
    if (err) {
      console.log(err)
    }
  })
  await relatedUser.save(function (err) {
    if (err) {
      console.log(err)
    }
  })

  res.json({ message: "Success" })
})

router.get("/posts/:id/comments", verifyJWT, async (req, res) => {
  let id = req.params.id
  console.log(typeof id)
  const post = await Post.findById(id).populate("comments")

  if (post.comments) {
    let comments = post.comments
    console.log(comments)

    res.json(comments)
  }
})

router.delete("/posts/:id/comments", verifyJWT, async (req, res) => {
  let id = req.params.id

  console.log(id)

  try {
    await Comments.deleteOne({ _id: id })

    const comments = await Comments.findById(id)

    console.log("comment deleted")
    return res.json(comments)
  } catch (error) {
    console.log(error)
  }
})

/* Edit Comment */
router.put("/posts/:id/comments", async (req, res) => {
  console.log("updating...")
  const id = req.params.id
  const body = req.body
  console.log(id)
  console.log(body)
  try {
    await Comments.findByIdAndUpdate({ _id: id }, body, { new: true })
  } catch (error) {
    console.log(error)
  }

  try {
    const comment = await Comments.findById(id)

    console.log(comment)
  } catch (error) {}
})

/* ! GET REQUEST FOR COMMENTS */

// router.get("/posts/isUserAuth", verifyJWT, (req, res) => {
//   console.log("prxy")

//   return res.json({ isLoggedIn: true, user: req.user })
// })

module.exports = router
