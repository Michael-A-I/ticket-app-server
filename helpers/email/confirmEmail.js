require("dotenv").config()

// This file is exporting an Object with a single key/value pair.
// However, because this is not a part of the logic of the application
// it makes sense to abstract it to another file. Plus, it is now easily
// extensible if the application needs to send different email templates
// (eg. unsubscribe) in the future.

module.exports = {
  confirm: id => ({
    subject: "React Confirm Email",
    html: `
      <a href='${process.env.CLIENT_ORIGIN_DEV}api/email/confirmed/${id}'>
        click to confirm email
      </a>
    `,
    text: `Copy and paste this link: ${process.env.CLIENT_ORIGIN_DEV}/confirm/${id}`
  }),
  confirm_production: id => ({
    subject: "React Confirm Email",
    html: `
      <a href='${process.env.CLIENT_ORIGIN}api/email/confirmed/${id}'>
        click to confirm email
      </a>
    `,
    text: `Copy and paste this link: ${process.env.CLIENT_ORIGIN}/confirm/${id}`
  })
}
