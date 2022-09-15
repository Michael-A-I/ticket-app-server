const mongoose = require("mongoose")

const commentSchema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Projects"
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tickets"
    },
    projectName: {
      type: String
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    name: {
      type: String
    },
    firstName: {
      type: String
    },
    lastName: {
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
