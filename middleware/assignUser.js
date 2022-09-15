const User = require("../models/user")

const assignUser = (req, res, next) => {
  const email = req.params.email
  console.log("assignUser")
  console.log({ email })

  // console.log("assignUser")
  // const token = req.header("Authorization")

  // const user = userMap.get(token)

  // req.user = user

  next()
}

module.exports = assignUser
