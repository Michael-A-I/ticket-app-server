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
const Answers = require("../models/answers")

router.post("/posts/new", verifyJWT, async (req, res) => {
  console.log("/posts/new")

  const post = req.body
  const user = req.user
  const userId = user.id

  console.table([
    ["username", user.username],
    ["id", user.id],
    ["file ", post.file]
  ])

  console.log("USERNAME TYPEOF " + typeof user.username)

  const dbPost = new Post({
    title: post.title,
    description: post.description,
    user: user.id,
    name: user.username,
    numberOfLikes: 0,
    hasUserLiked: [],
    hasUserFollowed: [],
    image: post.file,
    category: post.category
  })
  /* sets posts on USER model */
  const relatedUser = await User.findById(userId)
  relatedUser.posts.push(dbPost)
  /* save to db */
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
router.get("/posts/support", verifyJWT, async (req, res) => {
  const post = await Post.find({ category: "Support" })
  console.log("trying to send data to front end")

  // console.log(res.json)
  return res.json(post)
})
/* filters */
router.get("/posts/product", verifyJWT, async (req, res) => {
  const post = await Post.find({ category: "Product" })
  console.log("trying to send data to front end")

  // console.log(res.json)
  return res.json(post)
})
router.get("/posts/general", verifyJWT, async (req, res) => {
  const post = await Post.find({ category: "General" })
  console.log("trying to send data to front end")

  // console.log(res.json)
  return res.json(post)
})
router.get("/posts/engineer", verifyJWT, async (req, res) => {
  const post = await Post.find({ category: "Engineer" })
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
  } catch (error) {
    console.log(error)
  }
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

/* Follow Post */
router.post("/posts/:id/follow", verifyJWT, async (req, res) => {
  console.log("updating follow...")
  const id = req.params.id
  const body = req.body
  const hasUserFollowed = req.body.hasUserFollowed
  const userId = req.user.id

  console.log("hasUserFollowed :" + hasUserFollowed)
  console.log("body :" + body)
  console.log("id :" + id)
  /* find id of user that is following. and then update it with post id */
  try {
    /* query db */
    const user = await User.findById({ _id: body.hasUserFollowed })
    const post = await Post.findById({ _id: id })

    console.log(user)
    console.log(post)

    /* push to db */
    user.hasPostFollowed.push(id)
    post.hasUserFollowed.push(hasUserFollowed)

    /* save to db */
    user.save(function (err) {
      if (err) {
        console.log(err)
      }
    })
    post.save(function (err) {
      if (err) {
        console.log(err)
      }
    })
    console.log("user: " + user)
    console.log("post: " + post)
  } catch (error) {
    console.log(error)
  }
})
/* Unfollow Post */
router.put("/posts/:id/unfollow", verifyJWT, async (req, res) => {
  console.log("updating unfollow...")
  const id = req.params.id
  const userIdFromBody = req.body
  const userId = req.user.id
  const hasPostFollowed = { hasPostFollowed: id }

  /*  */
  console.log("body :" + userIdFromBody)
  console.log("id :" + id)
  console.log("userId :" + userId)

  try {
    /* $pull the  */
    const postafterdelete = await Post.updateOne({ _id: id }, { $pull: userIdFromBody }).exec()
    const userAfterDelete = await User.updateOne({ _id: userId }, { $pull: hasPostFollowed }).exec()

    /* no need to save after $pull */

    console.log("postafterdelete :" + postafterdelete)
    console.log("userAfterDelete :" + userAfterDelete)
  } catch (error) {
    console.log(error)
  }
})
/* get if user had followed */
router.get("/posts/:id/followcheck", verifyJWT, async (req, res) => {
  console.log("checking if user follows...")
  console.log("Still running")
  const id = req.params.id
  console.log(id)

  try {
    const post = await Post.findById({ _id: id })
    res.json(post.hasUserFollowed)
  } catch (error) {
    console.log(error)
  }
})

/* Delete Post */
router.delete("/posts/:id", verifyJWT, async (req, res) => {
  /* find post by id > delete post */
  let id = req.params.id

  console.log(id)

  try {
    /*TODO: if comments attached to post delete comments */

    const post = await Post.findById(id)
    console.log(post)
    await Post.deleteOne({ _id: id })

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

/* Delete Comment */
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
  console.log("updating comment...")
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
  } catch (error) {
    console.log(error)
  }
})

router.get("/posts/:user/following", async (req, res) => {
  console.log("Get posts user is following")
  const id = req.params.user

  const userIsFollowingPost = await User.findById({ _id: id }).populate("hasPostFollowed")
  console.log(userIsFollowingPost.hasPostFollowed)
  res.json(userIsFollowingPost.hasPostFollowed)
})
/* Answers */

/* Get Answers */
router.get("/posts/:id/answers", async (req, res) => {
  console.log("Get Answers")
  const id = req.params.id

  /* Get post then populate answers */
  const answers = await Post.findById(id).populate("answers")

  console.log("server: " + answers)
  res.json(answers)
})

/* Post Answers */
router.post("/posts/:id/answers", verifyJWT, async (req, res) => {
  console.log("Post Answers")
  /* Post Answer to Database */
  const id = req.params.id
  const answer = req.body

  const user = req.user
  // console.log(user)
  const userId = user.id

  const post = await Post.findById(id)

  /* creates relationshipt between single comment and the single post */
  const dbAnswers = new Answers({
    text: answer.text,
    post: id,
    postName: post.title,
    user: user.id,
    name: user.username,
    comments: []
  })
  dbAnswers.save()
  /* this creates relationsip between post and many answers */
  const relatedPost = await Post.findById(id)
  relatedPost.answers.push(dbAnswers)
  /* this creats a relationship to the user and many answers */
  const relatedUser = await User.findById(userId)
  relatedUser.answers.push(dbAnswers)

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

/* Answer Comments */

router.post("/posts/:post/answer/:comment", verifyJWT, async (req, res) => {
  console.log("Post Answer Comment")
  const postID = req.params.post
  const commentID = req.params.comment
  const comments = req.body
  const user = req.user
  const userId = user.id

  const post = await Post.findById(postID)

  /* creates relationshipt between single comment and the single post */
  const dbComments = new Comments({
    text: comments.text,
    post: postID,
    postName: post.title,
    user: user.id,
    name: user.username,
    answer: commentID
  })
  dbComments.save()

  /* create a relationship between comment and post */
  const relatedAnswer = await Answers.findById(commentID)
  relatedAnswer.comments.push(dbComments)
  console.log("relatedAnswer :" + relatedAnswer)
  console.log("CommentID " + commentID)

  /* this creats a relationship to the user and many comments */
  const relatedUser = await User.findById(userId)
  relatedUser.comments.push(dbComments)

  await relatedAnswer.save(function (err) {
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

/* Get Answers Comments*/

// router.get("/posts/answers/:id", verifyJWT, async (req, res) => {
//   console.log("Get Answers Comments")
//   const id = req.params.id

//   const answers = await Answers.findById( id ).populate("comments")
//   console.log(answers)
//   // res.json(answers)
// })

router.get("/posts/answers/:id", verifyJWT, async (req, res) => {
  console.log("Get Array of Answers IDs from Post")
  const id = req.params.id

  // console.log(id)
  const postAnswerIds = await Post.findById(id).select("answers")

  /* returns answers from post */
  console.log("GET ARRAY OF ANSWER IDS FROM POST " + postAnswerIds.answers)

  const answers = await Answers.find().where("_id").in(postAnswerIds.answers).populate("comments")

  // const answers = await Answers.findById(id).populate("comments")
  console.log("GET ARRAY OF ANSWER IDS FROM POST RESPONSE " + answers)
  res.json(answers)
})

/* ! GET REQUEST FOR COMMENTS */

// router.get("/posts/isUserAuth", verifyJWT, (req, res) => {
//   console.log("prxy")

//   return res.json({ isLoggedIn: true, user: req.user })
// })

module.exports = router
