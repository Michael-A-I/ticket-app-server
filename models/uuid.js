const mongoose = require("mongoose")

const uuidSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

const Uuid = mongoose.model("Uuid", uuidSchema)

module.exports = Uuid
