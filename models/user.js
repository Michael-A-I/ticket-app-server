const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
  {
    username: {
      type: String
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    upload: { type: Boolean },
    image: { type: String, default: "/default-profile.jpg" },
    title: { type: String },
    bio: { type: String },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Projects"
      }
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
      }
    ],
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
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
      }
    ],
    hasUserLiked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
      }
    ],
    hasPostFollowed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
      }
    ]
  },
  { timestamps: true }
)

const User = mongoose.model("User", userSchema)

module.exports = User

/* delete users from db and recreate with posts/comments */

/* when a object added to any of theses fields then notification should be sent with the object id.  */

/* set up default image of user profile. */
