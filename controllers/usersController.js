"use strict";

const User = require("../models/user"),
  passport = require("passport"),
  httpStatus = require("http-status-codes"),
  jsonWebToken = require("jsonwebtoken"),
  getUserParams = body => {
    return {
      name: body.name,
      email: body.email,
      password: body.password,
      loginStatus: body.loginStatus,
      socketId: body.name
    };
  };

module.exports = {
  index: (req, res, next) => {
    console.log("--- userController.index");
    console.log(req.sessionID);
    console.log(req.session);
    console.log(res.locals);
    User.find()
      .then(users => {
        res.locals.users = users;
        next();
      })
      .catch(error => {
        console.log(`Error fetching users: ${error.message}`);
        next(error);
      });
  },
  indexView: (req, res) => {
    console.log("--- userController.indexView");
    res.render("users/index");
  },

  new: (req, res) => {
    console.log("--- userController.new");
    res.render("users/new");
  },

  create: (req, res, next) => {
    console.log("--- userController.create");
    if (req.skip) return next();
    let newUser = new User(getUserParams(req.body));
    User.register(newUser, req.body.password, (e, user) => {
      if (user) {
        req.flash("success", `${user.name}'s account created successfully!`);
        res.locals.redirect = "/users";
        next();
      } else {
        req.flash("error", `Failed to create user account because: ${e.message}.`);
        res.locals.redirect = "/users/new";
        next();
      }
    });
  },

  redirectView: (req, res, next) => {
    console.log("--- userController.redirectView");
    let redirectPath = res.locals.redirect;
    if (redirectPath !== undefined) res.redirect(redirectPath);
    else next();
  },

  show: (req, res, next) => {
    console.log("--- userController.show");
    let userId = req.params.id;
    User.findById(userId)
      .then(user => {
        res.locals.user = user;
        next();
      })
      .catch(error => {
        console.log(`Error fetching user by ID: ${error.message}`);
        next(error);
      });
  },

  showView: (req, res) => {
    console.log("--- userController.showView");
    res.render("users/show");
  },

  edit: (req, res, next) => {
    console.log("--- userController.edit");
    let userId = req.params.id;
    User.findById(userId)
      .then(user => {
        res.render("users/edit", {
          user: user
        });
      })
      .catch(error => {
        console.log(`Error fetching user by ID: ${error.message}`);
        next(error);
      });
  },

  update: (req, res, next) => {
    console.log("--- userController.update");
    let userId = req.params.id,
      userParams = getUserParams(req.body);

    User.findByIdAndUpdate(userId, {
      $set: userParams
    })
      .then(user => {
        res.locals.redirect = `/users/${userId}`;
        res.locals.user = user;
        next();
      })
      .catch(error => {
        console.log(`Error updating user by ID: ${error.message}`);
        next(error);
      });
  },

  delete: (req, res, next) => {
    console.log("--- userController.delete");
    let userId = req.params.id;
    User.findByIdAndRemove(userId)
      .then(() => {
        res.locals.redirect = "/users";
        next();
      })
      .catch(error => {
        console.log(`Error deleting user by ID: ${error.message}`);
        next();
      });
  },
  login: (req, res) => {
    console.log("--- userController.login");
    res.render("users/login");
  },
  validate: (req, res, next) => {
    console.log("--- userController.validate");
    req
      .sanitizeBody("email")
      .normalizeEmail({
        all_lowercase: true
      })
      .trim();
    req.check("name", "Name is invalid").notEmpty();
    req.check("password", "Password cannot be empty").notEmpty();
    req.getValidationResult().then(error => {
      if (!error.isEmpty()) {
        let messages = error.array().map(e => e.msg);
        req.skip = true;
        req.flash("error", messages.join(" and "));
        res.locals.redirect = "/users/new";
        next();
      } else {
        next();
      }
    });
  },
  authenticate: passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: "Failed to login.",
    successRedirect: "/",
    successFlash: "Logged in!"
  }),
  logout: (req, res, next) => {
    console.log("--- userController.logout");
    console.log(res.locals);
    console.log(res.locals.currentUser);
    // User.findAndModify({
    //   // query: { _id: ObjectId(res.locals.currentUser.id)}, update: { $set: { loginStatus: false }}
    //   query: { name: res.locals.currentUser.name}, update: { $set: { loginStatus: false }}
    // })
    if (res.locals.loggedIn == false){
      res.json({
        success: false,
        message: "Not Loggedin."
      });
      return;
    }
    let userId = res.locals.currentUser.id,
        userParams = {
          loginStatus: 0
        };
    User.findByIdAndUpdate(userId, {
      $set: userParams
    })
      .then(dbuser => {
        console.log("dbuser = " + dbuser);
        req.logout();
        req.flash("success", "You have been logged out!");
        res.locals.loggedIn = false;
        res.locals.redirect = "/";
        next();
      })
      .catch(error => {
        console.log("Error = ${error.message}");
        next();
      });
  },
  // verifyToken: (req, res, next) => {
  //   let token = req.query.apiToken;
  //   if (token) {
  //     User.findOne({ apiToken: token })
  //       .then(user => {
  //         if (user) next();
  //         else next(new Error("Invalid API token."));
  //       })
  //       .catch(error => {
  //         next(new Error(error.message));
  //       });
  //   } else {
  //     next(new Error("Invalid API token."));
  //   }
  // },
  apiAuthenticate: (req, res, next) => {
    console.log("--- userController.apiAuthenticate");
    passport.authenticate("local", (errors, user) => {
      if (user) {
        console.log("---" + user);
        user.loginStatus = 1;
        user
          .save()
          .then(result =>{
            let signedToken = jsonWebToken.sign(
              {
                data: user._id,
                exp: new Date().setDate(new Date().getDate() + 1)
              },
              "secret_encoding_passphrase"
            );
            console.log(signedToken);
            res.locals.loggedIn = true;
            res.json({
              success: true,
              token: signedToken
            });
          })
          .catch(error =>{
            if (error){
              res.json({
                success: false,
                message: error.message
              });
            };
          });
      } else
        res.json({
          success: false,
          message: "Could not authenticate user."
        });
    })(req, res, next);
  },
  verifyJWT: (req, res, next) => {
    console.log("--- userController.verifyJWT");
    let token = req.headers.token;
    console.log(req.headers);
    console.log(token);
    if (token) {
      jsonWebToken.verify(token, "secret_encoding_passphrase", (errors, payload) => {
        if (payload) {
          User.findById(payload.data).then(user => {
            console.log(user);
            if (user) {
              res.locals.loggedIn = true;
              res.locals.currentUser = user;
              next();
            } else {
              res.status(httpStatus.FORBIDDEN).json({
                error: true,
                message: "No User account found."
              });
            }
          });
        } else {
          res.status(httpStatus.UNAUTHORIZED).json({
            error: true,
            message: "Cannot verify API token."
          });
          next();
        }
      });
    } else {
      res.status(httpStatus.UNAUTHORIZED).json({
        error: true,
        message: "Provide Token"
      });
    }
  },
  filterUserLoggedIn: (req, res, next) => {
    console.log("--- usersController.filterUserLoggedIn");
    User.find({
      // loginStatus: true
    })
      .then(dbuser => {
        // console.log("dbuser = " + dbuser);
        res.locals.users = dbuser;
        next();
      })
      .catch(error => {
        console.log("filterUserLoggedIn: Error = ${error.message}");
        next();
      });
  },
  respondJSON: (req, res) => {
    console.log("--- usersController.respondJSON");
    res.json({
      status: httpStatus.OK,
      data: res.locals
    });
  }
};
