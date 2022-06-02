const mongoose = require("mongoose")

const answerSchema = mongoose.Schema(
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
    typeOf: {
      type: "String",
      default: "Answer"
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments"
      }
    ]
  },
  { timestamps: true }
)

const Answers = mongoose.model("Answers", answerSchema)

module.exports = Answers
