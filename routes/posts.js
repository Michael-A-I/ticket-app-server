require("dotenv").config()
const mongoose = require("mongoose")
const router = require("express").Router()
/* Login + Register*/
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const Post = require("../models/post")
const Comments = require("../models/comments")
const User = require("../models/user")
const Answers = require("../models/answers")

const { resolveWatchPlugin } = require("jest-resolve")

/* Algolia Searh */
// hello_algolia.js
const algoliasearch = require("algoliasearch")

// Connect and authenticate with your Algolia app
const client = algoliasearch("SJKC9QEQKE", "33d7716afe47f46cf5c640953ca00acb")
/* Algolia Searh */

router.post("/posts/new", async (req, res) => {
  console.log("/posts/new")

  const post = req.body
  const user = req.user
  const userId = req.user.id

  // console.table([
  //   ["id", user.id],
  //   ["file ", post.file]
  // ])

  console.log("USERNAME TYPEOF " + typeof user.username)

  const dbPost = new Post({
    title: post.title,
    description: post.description,
    user: user.id,
    name: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    numberOfLikes: 0,
    hasUserLiked: [],
    hasUserFollowed: [],
    image: post.file,
    category: post.category,
    file: post.file
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

router.get("/posts/index", async (req, res) => {
  console.log("/posts/index")

  /* Speed increase due to not loading image and using lean */
  const post = await Post.find({}).select("-file").lean()

  console.log(post)
  return res.json(post)
})

router.get("/posts/search", async (req, res) => {
  console.log("/posts/search")

  try {
    const post = await Post.find({}).select("-file").lean()
    // Create a new index and add a record
    const index = client.initIndex("posts")
    const record = post

    await index.replaceAllObjects(post, {
      autoGenerateObjectIDIfNotExist: true
    })
  } catch (error) {
    console.log(error)
  }
})

router.get("/posts/support", async (req, res) => {
  console.log("/posts/support")
  const post = await Post.find({ category: "Support" })

  // console.log(res.json)
  return res.json(post)
})
/* filters */
router.get("/posts/product", async (req, res) => {
  console.log("/posts/product")
  const post = await Post.find({ category: "Product" })

  // console.log(res.json)
  return res.json(post)
})
router.get("/posts/general", async (req, res) => {
  console.log("/posts/general")
  const post = await Post.find({ category: "General" })

  // console.log(res.json)
  return res.json(post)
})
router.get("/posts/engineer", async (req, res) => {
  console.log("/posts/engineer")
  const post = await Post.find({ category: "Engineer" })

  return res.json(post)
})

router.get("/posts/:id", async (req, res) => {
  console.log("/posts/:id")

  let paramsId = req.params.id
  const post = await Post.findById({ _id: `${paramsId}` })
    .populate("user")
    .lean()
    .exec()

  return res.json(post)
})

/*! Update Post */
router.put("/posts/:id", async (req, res) => {
  console.log("/posts/:id")
  const id = req.params.id
  const body = req.body
  // console.log(id)
  // console.log(body)
  try {
    await Post.findByIdAndUpdate({ _id: id }, body, { new: true })

    res.json({ message: "success" })
  } catch (error) {
    // console.log("error" + error)
  }

  /* try {
    const comment = await Comments.findById(id)

    // console.log(comment)
  } catch (error) {
    // console.log(error)
  } */
})

router.put("/posts/:id/edit", async (req, res) => {
  console.log("/posts/:id/edit")
  const id = req.params.id
  const body = req.body
  // console.log(id)
  // console.log(body)
  try {
    await Post.findByIdAndUpdate({ _id: id }, body, { new: true })

    res.json({ message: "success" })
  } catch (error) {
    // console.log("error" + error)
  }

  try {
    const comment = await Comments.findById(id)

    // console.log(comment)
  } catch (error) {
    // console.log(error)
  }
})

/* Update Post Likes */
router.put("/posts/:id/like", async (req, res) => {
  console.log("/posts/:id/like")
  const id = req.params.id
  const body = req.body
  const userId = req.user.id
  // console.log(body)
  // console.log(id)

  try {
    /* increment # of likes */
    const postLikes = await Post.findByIdAndUpdate({ _id: id }, { $inc: { numberOfLikes: 1 } }, { new: true }).exec()
    /* increment # of likes */

    const post = await Post.findByIdAndUpdate({ _id: id }, { hasUserLiked: userId }, { new: true }).exec()

    /* if user likes post add post to the user model */
    const user = await User.findByIdAndUpdate(userId, { hasUserLiked: id }, { new: true }).exec()

    console.log(user)
    res.json({
      message: "success"
    })
  } catch (error) {
    console.log(error)
  }
})

/* unlike */

/* BL */
router.put("/posts/:id/unlike", async (req, res) => {
  console.log("/posts/:id/unlike")
  const id = req.params.id
  const body = req.body
  const userId = req.user.id
  // console.log(id)
  // console.log(userId)

  try {
    /* reduce like count by 1 */
    const postupdate = await Post.findByIdAndUpdate({ _id: id }, { $inc: { numberOfLikes: -1 } }, { new: true }).exec()
    /* remove user id from post */
    // await Post.findByIdAndUpdate({ _id: id }, { hasUserLiked: userId }, { new: true }).exec()
    /*TODO: updateOne */
    /* remove hasUserLiked */
    const post = await Post.updateOne({ _id: id }, { $pull: { hasUserLiked: userId } })
    /* remove post id from user model */
    const user = await User.updateOne({ _id: userId }, { $pull: { hasUserLiked: id } })

    console.log(user)
    res.json({
      message: "success"
    })
  } catch (error) {
    console.log(error)
  }
})

/* has user liked? */

router.get("/posts/:id/hasUserLiked", async (req, res) => {
  console.log("/posts/:id/hasUserLiked")
  const userID = req.user.id
  const id = req.params.id

  const post = await Post.findById({ _id: id })

  const hasUserLiked = post.hasUserLiked

  console.log(hasUserLiked)
  if (hasUserLiked !== null) {
    hasUserLiked.map(user => {
      // console.log(user)
      // console.log(userID)
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
/* BLOCKING */
router.post("/posts/:id/follow", async (req, res) => {
  console.log("/posts/:id/follow")

  const id = req.params.id
  const body = req.body
  const hasUserFollowed = req.body.hasUserFollowed
  const userId = req.user.id

  // console.log("hasUserFollowed :" + hasUserFollowed)
  // console.log("body :" + body)
  // console.log("id :" + id)
  /* find id of user that is following. and then update it with post id */
  try {
    const user = User.findById({ _id: hasUserFollowed })
    const post = Post.findById({ _id: id })

    const [userRes, postRes] = await Promise.all([user, post])

    // console.log(user)
    // console.log(post)

    userRes.hasPostFollowed.push(id)
    postRes.hasUserFollowed.push(hasUserFollowed)

    userRes.save(function (err) {
      if (err) {
        // console.log(err)
      }
    })
    postRes.save(function (err) {
      if (err) {
        // console.log(err)
      }
    })
    // console.log("user: " + user)
    // console.log("post: " + post)
    res.json({ message: "Success" })
  } catch (error) {
    console.log(error)
  }
})
/* Unfollow Post */
/* Blocks */
router.put("/posts/:id/unfollow", async (req, res) => {
  console.log("/posts/:id/unfollow")
  const id = req.params.id
  const userIdFromBody = req.body
  const userId = req.user.id
  const hasPostFollowed = { hasPostFollowed: id }

  /*  */
  // console.log("body :" + userIdFromBody)
  // console.log("id :" + id)
  // console.log("userId :" + userId)

  try {
    /* $pull the  */
    const postafterdelete = Post.updateOne({ _id: id }, { $pull: userIdFromBody }).exec()
    const userAfterDelete = User.updateOne({ _id: userId }, { $pull: hasPostFollowed }).exec()

    const [postafterdeleteRes, userAfterDeleteRes] = await Promise.all([postafterdelete, userAfterDelete])

    /* no need to save after $pull */

    // console.log("postafterdelete :" + postafterdelete)
    // console.log("userAfterDelete :" + userAfterDelete)
    res.json({ message: "Success" })
  } catch (error) {
    // console.log(error)
  }
})
/* get if user had followed */
router.get("/posts/:id/followcheck", async (req, res) => {
  console.log("/posts/:id/followcheck")

  const id = req.params.id
  // console.log(id)

  try {
    const post = await Post.findById({ _id: id })
    // check if user has follwed

    /* post.hasUserFollowed is array of user ids */

    const isUserFollowing = post.hasUserFollowed.includes(req.user.id)
    // console.log("is user following" + isUserFollowing)
    res.json(isUserFollowing)
  } catch (error) {
    console.log(error)
  }
})

/* Delete Post */
/* BLOCKING */
router.delete("/posts/:id", async (req, res) => {
  console.log("/posts/:id")
  let id = req.params.id

  try {
    /*TODO: if comments attached to post delete comments */

    // console.log(post)
    const postDel = await Post.deleteOne({ _id: id })
    const posts = await Post.find({})

    console.log("post deleted")
    return res.json(posts)
  } catch (error) {
    // console.log(error)
  }
})

/* Post Comment */

router.post("/posts/:id/comments", async (req, res) => {
  console.time("getUploadRead")

  console.log("/posts/:id/comments")
  const comments = req.body
  const id = req.params.id
  const user = req.user
  const userId = user.id

  const post = await Post.findById(id).select("title").lean()
  // console.log(post)

  /* creates relationshipt between single comment and the single post */
  const dbComments = new Comments({
    text: comments.text,
    post: id,
    postName: post.title,
    user: user.id,
    name: user.username,
    firstName: user.firstName,
    lastName: user.lastName
  })
  dbComments.save()
  /* this creates relationsip between post and many comments */
  const relatedPost = Post.findById(id)
  /* this creats a relationship to the user and many comments */
  const relatedUser = User.findById(userId)

  const [relatedPostResponse, relatedUserResponse] = await Promise.all([relatedPost, relatedUser])

  relatedPostResponse.comments.push(dbComments)
  relatedUserResponse.comments.push(dbComments)

  relatedPostResponse.save(function (err) {
    if (err) {
      // console.log(err)
    }
  })
  relatedUserResponse.save(function (err) {
    if (err) {
      // console.log(err)
    }
  })

  res.json({ message: "Success" })
  console.timeEnd("getUploadRead")
})

/* GET Comment */
router.get("/posts/:id/comments", async (req, res) => {
  console.time("GET /posts/:id/comments")
  console.log("/posts/:id/comments")
  let id = req.params.id
  /* Deep populate */
  const post = await Post.findById(id)
    .populate({ path: "comments", populate: { path: "user" } })
    .lean()
  // const post = await Post.findById(id).populate("comments")

  // console.log(post)
  if (post.comments) {
    let comments = post.comments
    // console.log(comments)

    res.json(comments)
  } else {
    res.json({ message: "404" })
  }
  console.timeEnd("GET /posts/:id/comments")
})

/* Delete Comment */
/* BLOCKING */
router.delete("/posts/:id/comments", async (req, res) => {
  console.time("delete /posts/:id/comments")

  console.log("/posts/:id/comments")
  let id = req.params.id

  try {
    await Comments.deleteOne({ _id: id })

    const comments = await Comments.findById(id)

    console.log("comment deleted")
    return res.json(comments)
  } catch (error) {
    console.log(error)
  }
  console.timeEnd("delete /posts/:id/comments")
})

/* Edit Comment */
router.put("/posts/:id/comments", async (req, res) => {
  console.log("/posts/:id/comments")
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
  console.log("/posts/:user/following")
  const id = req.params.user

  const userIsFollowingPost = await User.findById({ _id: id }).populate("hasPostFollowed").lean()
  console.log(userIsFollowingPost.hasPostFollowed)
  res.json(userIsFollowingPost.hasPostFollowed)
})
/* Answers */

/* Get Answers */
router.get("/posts/:id/answers", async (req, res) => {
  console.log("GET /posts/:id/answers")
  const id = req.params.id

  /* Get post then populate answers */
  /* Deep populate */

  const post = await Post.findById(id)
    .populate({ path: "answers", populate: { path: "user" } })
    .lean()

  if (post.answers) {
    const answers = post.answers
    res.json(answers)
  } else {
    res.json({ message: "404" })
  }
})
/* Get Answers */

router.get("/posts/answers/:id", async (req, res) => {
  console.log("GET /posts/answers/:id")
  const id = req.params.id

  const post = await Post.findById(id)
    .populate({ path: "answers", populate: [{ path: "comments", populate: { path: "user" } }, { path: "user" }] })
    .lean()

  //!TypeError: Cannot read properties of undefined (reading 'split')

  const answers = await post.answers

  res.json(answers)
})

/* Post Answers */
// BLOCKING
router.post("/posts/:id/answers", async (req, res) => {
  console.log("POST /posts/:id/answers")
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
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.username,
    comments: []
  })
  dbAnswers.save()
  /* this creates relationsip between post and many answers */
  const relatedPost = Post.findById(id)
  /* this creats a relationship to the user and many answers */
  const relatedUser = User.findById(userId)

  const [relatedPostResponse, relatedUserResponse] = await Promise.all([relatedPost, relatedUser])

  relatedPostResponse.answers.push(dbAnswers)
  relatedUserResponse.answers.push(dbAnswers)

  const postSave = relatedPostResponse.save(function (err) {
    if (err) {
      console.log(err)
    }
  })

  const userSave = relatedUserResponse.save(function (err) {
    if (err) {
      console.log(err)
    }
  })

  await Promise.all([postSave, userSave])

  res.json({ message: "Success" })
})

/* Delete Answers */

router.delete("/posts/:id/answers/delete", async (req, res) => {
  console.log("/posts/:id/answers/delete")
  const answerID = req.params.id

  const answer = await Answers.findByIdAndDelete(answerID)

  // console.log("Answer to Delete " + answer)

  res.json(answer)
})

/* Edit Answer */

router.put("/posts/:id/answers/edit", async (req, res) => {
  console.log("/posts/:id/answers/edit")

  // const answer = await Answers.findByIdAndDelete(answerID)

  // console.log("Answer to Delete " + answer)

  // res.json(answer)

  /*! Edit Answers */

  const answerID = req.params.id
  const body = req.body

  // console.log(answerID)
  // console.log(body)
  try {
    await Answers.findByIdAndUpdate({ _id: answerID }, body, { new: true })

    return res.json({ message: "success" })
  } catch (error) {
    console.log(error)
  }
})

/* Answer Comments */
/* BLOCKING */
router.post("/posts/:post/answer/:comment", async (req, res) => {
  console.log("/posts/:post/answer/:comment")
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
    firstName: user.firstName,
    lastName: user.lastName,
    answer: commentID
  })
  await dbComments.save()

  /* create a relationship between comment and post */
  const relatedAnswer = await Answers.findById(commentID)
  relatedAnswer.comments.push(dbComments)
  // console.log("relatedAnswer :" + relatedAnswer)
  // console.log("CommentID " + commentID)

  /* this creats a relationship to the user and many comments */
  const relatedUser = await User.findById(userId)
  relatedUser.comments.push(dbComments)

  await relatedAnswer.save(function (err) {
    if (err) {
      // console.log(err)
    }
  })
  await relatedUser.save(function (err) {
    if (err) {
      // console.log(err)
    }
  })

  res.json({ message: "Success" })
})

// router.get("/posts/search/:search", async (req, res) => {
//   console.log("search posts")

//   const search = req.params.search
//   let regex = new RegExp(search, "i")

//   const results = await Post.search({
//     query_string: {
//       query: "Hey"
//     }
//   })

//   console.log(results)

//   res.json(results)
// })

module.exports = router
