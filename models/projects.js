const mongoose = require("mongoose")
const Schema = mongoose.Schema

const projectsSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["Feature", "Bug"]
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    assigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    title: {
      type: String,
      required: true
    },
    files: {
      type: [{ type: String }]
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

    name: {
      type: String
    },
    typeOf: {
      type: "String",
      default: "Project"
    },
    hasUserFollowed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    done: {
      type: Boolean,
      default: false
    },
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tickets"
      }
    ],
    archived: {
      type: Boolean,
      default: false
    }
  },

  { timestamps: true }
)

/* delete all the comments */
// postSchema.pre("deleteOne", function (next) {
//   // get the query of the post from id
//   const postID = this.getQuery()["_id"]
//   // commentID = to PostID
//   console.log("Comments ID Model " + postID)
//   // delete comments from Post reference

//   /* MiddleWare to delete Comments (Both Answers, Post Comments stored in same record) Records tied to Post */

//   mongoose.model("Comments").deleteMany({ post: postID }, function (err, result) {
//     console.log(result)
//     if (err) {
//       console.log(`[error] ${err}`)
//       next(err)
//     } else {
//       console.log("success")

//       next()
//     }
//   })

//   /* MiddleWare to delete Answers Records tied to Post */

//   mongoose.model("Answers").deleteMany({ post: postID }, function (err, result) {
//     console.log(result)
//     if (err) {
//       console.log(`[error] ${err}`)
//       next(err)
//     } else {
//       console.log("success")

//       next()
//     }
//   })

//   // mongoose.model("Comments").deleteMany({ _id: { $in: comments } }, function (err, result) {
//   // if (err) {
//   //   console.log(`[error] ${err}`)
//   //   next(err)
//   // } else {
//   //   console.log("success")

//   //   next()
//   // }
//   // })
//   // mongoose.model("Comments").deleteMany({ comments: postID }, function (err, result) {
//   //   if (err) {
//   //     console.log(`[error] ${err}`)
//   //     next(err)
//   //   } else {
//   //     console.log("success")

//   //     next()
//   //   }
//   // })
//   //
// })
/* delete all the comments */

const Projects = mongoose.model("Projects", projectsSchema)

module.exports = Projects
