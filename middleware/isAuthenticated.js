const router = require("express").Router()
const mongoose = require("mongoose")
const Users = require("../models/user")

const isAuthenticated = async (req, res, next) => {
  console.log("isAuthenticated")
  const users = await Users.find({})
  console.log("asdfasdfasdfasdfasdf" + users)
  console.log(req.params.email)

  next()
}

module.exports = isAuthenticated
