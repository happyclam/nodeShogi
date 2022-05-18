"use strict";
const User = require("../models/user"),
  httpStatus = require("http-status-codes"),
  passport = require("passport"),
  jsonWebToken = require("jsonwebtoken");

module.exports = {
  // index: (req, res, next) => {
  //   console.log("--- homeController.index");
  //   console.log(req.sessionID);
  //   console.log(req.session);
  //   console.log(res.locals);
  //   User.find()
  //     .then(users => {
  //       res.locals.users = users;
  //       next();
  //     })
  //     .catch(error => {
  //       console.log(`Error fetching users: ${error.message}`);
  //       next(error);
  //     });
  // },
  index: (req, res) => {
    res.render("index");
  },
  apply: (req, res) => {
    console.log("homeController.apply");
    console.log(req.params);
    console.log(res.locals);
    res.json({
      status: httpStatus.OK,
      data: res.locals
    });
  }
};
