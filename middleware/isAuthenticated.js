// Example with Node.js
var jose = require("node-jose")
var jwt = require("jsonwebtoken")
const fetch = require("node-fetch")
const isAdmin = async (req, res, next) => {
  console.log("MIDDLEWARE")
  const payload = await getPayload(req)
  console.log({ payload })

  if (!payload) {
    return
  }
  if (payload.includes("admin")) {
    console.log("user has access")
    next()
  } else {
    console.log("user does not have access")
    return "user does not have access"
  }
}

const isOwner = async (req, res, next) => {
  console.log("MIDDLEWARE")
  const payload = await getPayload(req)

  if (!payload) {
    return
  }
  if (payload.includes("owner")) {
    console.log("user has access")
    next()
  } else {
    console.log("user does not have access")
    return "user does not have access"
  }
}

const isManager = async (req, res, next) => {
  console.log("MIDDLEWARE")
  const payload = await getPayload(req)

  if (!payload) {
    return
  }
  if (payload.includes("manager")) {
    console.log("user has access")
    next()
  } else {
    console.log("user does not have access")
    return "user does not have access"
  }
}

const isMember = async (req, res, next) => {
  console.log("MIDDLEWARE")
  const payload = await getPayload(req)

  if (!payload) {
    return
  }
  if (payload.includes("member")) {
    console.log("user has access")
    next()
  } else {
    console.log("user does not have access")
    return "user does not have access"
  }
}

const isSupport = async (req, res, next) => {
  console.log("MIDDLEWARE")
  const payload = await getPayload(req)

  if (!payload) {
    return
  }
  if (payload.includes("support")) {
    console.log("user has access")
    next()
  } else {
    console.log("user does not have access")
    return "user does not have access"
  }
}

const isProtected = async (req, res, next) => {
  console.log("isProtected")
  const payload = await getPayload(req)

  console.log({ payload })

  if (!payload) {
    console.log("user not logged in")
    return
  }
  if (payload) {
    console.log("user logged in")
    next()
  }
}

const getPayload = async req => {
  const cookie = req.cookies["access.pn4qd8qb"]
  const JWKS = await getJWKS(cookie)

  // !revision on how to work with multiple keys
  const keystore = await jose.JWK.asKey(JWKS[0]).then(function (result) {
    return result
  })

  const { payload } = await jose.JWS.createVerify(keystore)
    .verify(cookie, { allowEmbeddedKey: true })
    .then(function (cookieResult) {
      return cookieResult
    })

  const rolesJSON = JSON.parse(payload.toString("utf-8"))

  console.log({ rolesJSON })

  return rolesJSON.authorization["pn4qd8qb"].roles
}

const getJWKS = async cookie => {
  console.log({ cookie })
  try {
    const response = await fetch(`https://api.userfront.com/v0/tenants/pn4qd8qb/jwks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie} `
      }
    })

    const JWKS = await response.json()

    return JWKS.keys
  } catch (error) {
    console.log(error)
  }
}

module.exports = { isAdmin, isProtected, isOwner, isManager, isMember, isSupport }
