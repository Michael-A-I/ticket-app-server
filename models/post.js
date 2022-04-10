const mongoose = require("mongoose")

const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments"
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
    ]
  },
  { timestamps: true }
)

/* delete all the comments */
postSchema.pre("deleteOne", function (next) {
  const commentId = this.getQuery()["_id"]
  console.log("Comments ID Model " + commentId)

  mongoose.model("Comments").deleteMany({ comments: commentId }, function (err, result) {
    if (err) {
      console.log(`[error] ${err}`)
      next(err)
    } else {
      console.log("success")
      next()
    }
  })
})

const Post = mongoose.model("Post", postSchema)

module.exports = Post
