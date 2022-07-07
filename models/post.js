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

/* Partial search functionality */
postSchema.plugin(mongoosastic)
const Post = mongoose.model("Post", postSchema)

module.exports = Post
