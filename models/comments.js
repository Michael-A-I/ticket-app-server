const mongoose = require("mongoose")

const commentSchema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    },
    postName: {
      type: String
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    name: {
      type: String
    },
    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answers"
    },
    typeOf: {
      type: "String",
      default: "Comment"
    }
  },
  { timestamps: true }
)

const Comments = mongoose.model("Comments", commentSchema)

module.exports = Comments
