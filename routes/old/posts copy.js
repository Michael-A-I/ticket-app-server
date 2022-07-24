require("dotenv").config()
const mongoose = require("mongoose")
const router = require("express").Router()
/* Login + Register*/
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const Post = require("../../models/post")
const Comments = require("../../models/comments")
const verifyJWT = require("../../verifyJWT")
const User = require("../../models/user")
const Answers = require("../../models/answers")
const { resolveWatchPlugin } = require("jest-resolve")

router.post("/posts/new", verifyJWT, async (req, res) => {
  console.log("/posts/new")

  const post = req.body
  const user = req.user
  const userId = req.user.id

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
  const post = await Post.findById({ _id: `${paramsId}` })
    .populate("user")
    .exec()

  // console.log(res.json(post))
  return res.json(post)
})

/*! Update Post */
router.put("/posts/:id", verifyJWT, async (req, res) => {
  console.log("updating...")
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

router.put("/posts/:id/edit", verifyJWT, async (req, res) => {
  console.log("updating...")
  const id = req.params.id
  const body = req.body
  console.log(id)
  console.log(body)
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
router.put("/posts/:id/like", verifyJWT, async (req, res) => {
  console.log("updating likes...")
  const id = req.params.id
  const body = req.body
  const userId = req.user.id
  console.log(body)
  console.log(id)

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
router.put("/posts/:id/unlike", verifyJWT, async (req, res) => {
  console.log("updating unlike...")
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

router.get("/posts/:id/hasUserLiked", verifyJWT, async (req, res) => {
  console.log("hasUserLiked")
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
router.post("/posts/:id/follow", verifyJWT, async (req, res) => {
  console.log("updating follow...")
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
router.put("/posts/:id/unfollow", verifyJWT, async (req, res) => {
  console.log("updating unfollow...")
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
router.get("/posts/:id/followcheck", verifyJWT, async (req, res) => {
  console.log("checking if user follows...")
  console.log("Still running")
  const id = req.params.id
  // console.log(id)

  try {
    const post = await Post.findById({ _id: id })
    // check if user has follwed
    console.log("check followed")

    /* post.hasUserFollowed is array of user ids */

    const isUserFollowing = post.hasUserFollowed.includes(req.user.id)
    console.log("is user following" + isUserFollowing)
    res.json(isUserFollowing)
  } catch (error) {
    console.log(error)
  }
})

/* Delete Post */
/* BLOCKING */
router.delete("/posts/:id", verifyJWT, async (req, res) => {
  /* find post by id > delete post */
  let id = req.params.id

  // console.log(id)

  try {
    /*TODO: if comments attached to post delete comments */

    const post = Post.findById(id)
    // console.log(post)
    const postDel = Post.deleteOne({ _id: id })

    const [postRes, postDelRes] = Promise.all([post, postDel])

    console.log("post deleted")
    return res.json(postRes)
  } catch (error) {
    // console.log(error)
  }
})

/* BLOCKING */
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
  /* this creats a relationship to the user and many comments */
  const relatedUser = await User.findById(userId)

  relatedPost.comments.push(dbComments)
  relatedUser.comments.push(dbComments)

  relatedPost.save(function (err) {
    if (err) {
      // console.log(err)
    }
  })
  relatedUser.save(function (err) {
    if (err) {
      // console.log(err)
    }
  })

  res.json({ message: "Success" })
})

router.get("/posts/:id/comments", verifyJWT, async (req, res) => {
  let id = req.params.id
  // console.log(typeof id)
  /* Deep populate */
  const post = await Post.findById(id).populate({ path: "comments", populate: { path: "user" } })
  // const post = await Post.findById(id).populate("comments")

  // console.log(post)
  if (post.comments) {
    let comments = post.comments
    // console.log(comments)

    res.json(comments)
  } else {
    res.json({ message: "404" })
  }
})

/* Delete Comment */
/* BLOCKING */
router.delete("/posts/:id/comments", verifyJWT, async (req, res) => {
  let id = req.params.id

  // console.log(id)

  try {
    await Comments.deleteOne({ _id: id })

    const comments = await Comments.findById(id)

    console.log("comment deleted")
    return res.json(comments)
  } catch (error) {
    // console.log(error)
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
router.get("/posts/:id/answers", verifyJWT, async (req, res) => {
  console.log("Get Answers")
  const id = req.params.id

  /* Get post then populate answers */
  /* Deep populate */

  const post = await Post.findById(id).populate({ path: "answers", populate: { path: "user" } })

  if (post.answers) {
    const answers = post.answers
    res.json(answers)
  } else {
    res.json({ message: "404" })
  }
})

/* Post Answers */
// BLOCKING
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

/* Delete Answers */

router.delete("/posts/:id/answers/delete", verifyJWT, async (req, res) => {
  console.log("delete answer")
  const answerID = req.params.id

  const answer = await Answers.findByIdAndDelete(answerID)

  // console.log("Answer to Delete " + answer)

  res.json(answer)
})

/* Edit Answer */

router.put("/posts/:id/answers/edit", verifyJWT, async (req, res) => {
  console.log("edit answer")

  // const answer = await Answers.findByIdAndDelete(answerID)

  // console.log("Answer to Delete " + answer)

  // res.json(answer)

  /*! Edit Answers */

  console.log("updating Answer...")
  const answerID = req.params.id
  const body = req.body

  // console.log(answerID)
  // console.log(body)
  try {
    await Answers.findByIdAndUpdate({ _id: answerID }, body, { new: true })

    return res.json({ message: "success" })
  } catch (error) {
    // console.log(error)
  }
})

/* Answer Comments */
/* BLOCKING */
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
  // const postAnswerIds = await Post.findById(id).select("answers")
  const post = await Post.findById(id).populate({ path: "answers", populate: [{ path: "comments", populate: { path: "user" } }, { path: "user" }] })

  // const answers = await Post.findById(id).populate({ path: "answers", populate: { path: "comments", populate: { path: "user" } } })

  /* returns answers from post */
  // console.log("GET ARRAY OF ANSWER IDS FROM POST " + postAnswerIds.answers)

  //!TypeError: Cannot read properties of undefined (reading 'split')

  // const answers = await Answers.find()
  //   .where("_id")
  //   .in(postAnswerIds.answers)
  //   .populate({ path: "comments", populate: { path: "user" } })

  const answers = post.answers
  // const answers = await Answers.findById(id).populate("comments")
  // console.log("GET ARRAY OF ANSWER IDS FROM POST RESPONSE " + answers)
  res.json(answers)
})

router.get("/posts/search/:search", verifyJWT, async (req, res) => {
  console.log("search posts")

  const search = req.params.search
  let regex = new RegExp(search, "i")

  const results = await Post.search({
    query_string: {
      query: "Hey"
    }
  })

  console.log(results)

  res.json(results)
})

/* ! GET REQUEST FOR COMMENTS 

Model
    .find(
        { $text : { $search : "text to look for" } }, 
        { score : { $meta: "textScore" } }
    )
    .sort({ score : { $meta : 'textScore' } })
    .exec(function(err, results) {
        // callback
    });

*/

// router.get("/posts/isUserAuth", verifyJWT, (req, res) => {
//   console.log("prxy")

//   return res.json({ isLoggedIn: true, user: req.user })
// })

module.exports = router
