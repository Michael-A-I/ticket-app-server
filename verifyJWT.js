const jwt = require("jsonwebtoken")

function verifyJWT(req, res, next) {
  // console.log("req.headers " + JSON.stringify(req.headers))
  // console.log("req.headers x-access-token " + req.headers["x-access-token"])

  const token = req.headers["x-access-token"].split(" ")[1]
  console.log("verifyJWT")

  console.log("token: " + token)

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("jwt.verify error: " + err)
        return res.json({
          isLoggedIn: false,
          message: "Failed to Authenticate"
        })
      }
      console.log(decoded)
      req.user = {}
      req.user.id = decoded.id
      req.user.username = decoded.username
      next()
    })
  } else {
    res.json({ message: "incorrect Token Given", isLoggedIn: false })
  }
}

module.exports = verifyJWT
