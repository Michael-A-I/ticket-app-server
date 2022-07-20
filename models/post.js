const mongoose = require("mongoose")
const mongoosastic = require("mongoosastic")
const Schema = mongoose.Schema

const postSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["General", "Engineer", "Product", "Support"],
      default: "General"
    },
    title: {
      type: String,
      required: true
    },
    file: {
      type: String
      // required: true
    },
    description: {
      type: String,
      required: true
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments"
      }
    ],
    answers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answers"
      }
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    name: {
      type: String
    },

    numberOfLikes: {
      type: Number
    },
    hasUserLiked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    typeOf: {
      type: "String",
      default: "Post"
    },
    hasUserFollowed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
)

/* delete all the comments */
postSchema.pre("deleteOne", function (next) {
  // get the query of the post from id
  const postID = this.getQuery()["_id"]
  // commentID = to PostID
  console.log("Comments ID Model " + postID)
  // delete comments from Post reference

  /* MiddleWare to delete Comments (Both Answers, Post Comments stored in same record) Records tied to Post */

  mongoose.model("Comments").deleteMany({ post: postID }, function (err, result) {
    console.log(result)
    if (err) {
      console.log(`[error] ${err}`)
      next(err)
    } else {
      console.log("success")

      next()
    }
  })

  /* MiddleWare to delete Answers Records tied to Post */

  mongoose.model("Answers").deleteMany({ post: postID }, function (err, result) {
    console.log(result)
    if (err) {
      console.log(`[error] ${err}`)
      next(err)
    } else {
      console.log("success")

      next()
    }
  })

  // mongoose.model("Comments").deleteMany({ _id: { $in: comments } }, function (err, result) {
  // if (err) {
  //   console.log(`[error] ${err}`)
  //   next(err)
  // } else {
  //   console.log("success")

  //   next()
  // }
  // })
  // mongoose.model("Comments").deleteMany({ comments: postID }, function (err, result) {
  //   if (err) {
  //     console.log(`[error] ${err}`)
  //     next(err)
  //   } else {
  //     console.log("success")

  //     next()
  //   }
  // })
  //
})
/* delete all the comments */

/* Partial search functionality */
/* ! Used Algolia instead */
postSchema.plugin(mongoosastic)
const Post = mongoose.model("Post", postSchema)

module.exports = Post
/* ! Used Algolia instead */
