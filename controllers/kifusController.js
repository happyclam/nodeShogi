"use strict";
const Kifu = require("../models/kifu"),
  httpStatus = require("http-status-codes"),
  User = require("../models/user")

module.exports = {
  index: (req, res, next) => {
    console.log("--- kifusController.index");
    Kifu.find()
      .sort({
        createdAt: -1
      })
      .then(kifus => {
        // console.log("--- " + kifus);
        res.locals.kifus = kifus;
        next();
      })
      .catch(error => {
        console.log(`Error fetching kifus: ${error.message}`);
        next(error);
      });
  },
  indexView: (req, res) => {
    console.log("--- kifusController.indexView");
    res.render("kifus/index");
  },
  new: (req, res) => {
    console.log("--- kifusController.new");
    User.find()
      .then(users => {
        res.render("kifus/new", {
          users: users
        });
      })
      .catch(error => {
        console.log(`Error fetching users: ${error.message}`);
      });
  },

  create: (req, res, next) => {
    console.log("--- kifusController.create");
    let kifuParams = {
      title: req.body.title,
      description: req.body.description,
      firstPlayer: req.body.firstPlayer.split(",")[0],
      secondPlayer: req.body.secondPlayer.split(",")[0],
      users: [req.body.firstPlayer.split(",")[1], req.body.secondPlayer.split(",")[1]],
      items: [req.body.items.split(",")]
    };
    // console.log(kifuParams);
    Kifu.create(kifuParams)
      .then(kifu => {
        res.locals.redirect = "/kifus";
        res.locals.kifu = kifu;
        next();
      })
      .catch(error => {
        console.log(`Error saving kifu: ${error.message}`);
        next(error);
      });
  },

  show: (req, res, next) => {
    console.log("--- kifusController.show");
    let kifuId = req.params.id;
    Kifu.findById(kifuId)
      .then(kifu => {
        res.locals.kifu = kifu;
        next();
      })
      .catch(error => {
        console.log(`Error fetching kifu by ID: ${error.message}`);
        next(error);
      });
  },

  showView: (req, res) => {
    console.log("--- kifusController.showView");
    res.render("kifus/show");
  },

  edit: (req, res, next) => {
    console.log("--- kifusController.edit");
    let kifuId = req.params.id;
    Kifu.findById(kifuId)
      .then(kifu => {
        User.find()
          .then(users => {
            res.render("kifus/edit", {
              users: users,
              kifu: kifu
            });
          })
          .catch(error => {
            console.log(`Error fetching users: ${error.message}`);
          });
      })
      .catch(error => {
        console.log(`Error fetching kifu by ID: ${error.message}`);
        next(error);
      });
  },

  update: (req, res, next) => {
    console.log("--- kifusController.update");
    let kifuId = req.params.id,
        kifuParams = {
          title: req.body.title,
          description: req.body.description,
          firstPlayer: req.body.firstPlayer.split(",")[0],
          secondPlayer: req.body.secondPlayer.split(",")[0],
          users: [req.body.firstPlayer.split(",")[1], req.body.secondPlayer.split(",")[1]],
          items: [req.body.items.split(",")]
        };

    Kifu.findByIdAndUpdate(kifuId, {
      $set: kifuParams
    })
      .then(kifu => {
        res.locals.redirect = `/kifus/${kifuId}`;
        res.locals.kifu = kifu;
        next();
      })
      .catch(error => {
        console.log(`Error updating kifu by ID: ${error.message}`);
        next(error);
      });
  },

  delete: (req, res, next) => {
    console.log("--- kifusController.delete");
    let kifuId = req.params.id;
    Kifu.findByIdAndRemove(kifuId)
      .then(() => {
        res.locals.redirect = "/kifus";
        next();
      })
      .catch(error => {
        console.log(`Error deleting kifu by ID: ${error.message}`);
        next();
      });
  },

  redirectView: (req, res, next) => {
    console.log("--- kifusController.redirectView");
    let redirectPath = res.locals.redirect;
    if (redirectPath !== undefined) res.redirect(redirectPath);
    else next();
  },
  respondJSON: (req, res) => {
    console.log("--- kifusController.respondJSON");
    res.json({
      status: httpStatus.OK,
      data: res.locals
    });
  },
  errorJSON: (error, req, res, next) => {
    console.log("--- kifusController.errorJSON");
    let errorObject;
    if (error) {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message
      };
    } else {
      errorObject = {
        status: httpStatus.OK,
        message: "Unknown Error."
      };
    }
    res.json(errorObject);
  },
  join: (req, res, next) => {
    console.log("--- kifusController.join");
    // console.log(req.params);
    // console.log(req.params.id);
    // console.log(req.user); <--JWT on にするとreq.userはundefinedになる
    // console.log(res.locals.currentUser);
    // let kifuId = req.params.id,
    //   currentUser = req.user;
    let kifuId = req.params.id,
      currentUser = res.locals.currentUser;
    if (currentUser) {
      User.findByIdAndUpdate(currentUser, {
        $addToSet: {
          kifus: kifuId
        }
      })
        .then(() => {
          res.locals.success = true;
          next();
        })
        .catch(error => {
          next(error);
        });
    } else {
      next(new Error("User must log in."));
    }
  },
  filterUserKifus: (req, res, next) => {
    console.log("--- kifusController.filterUserKifus");
    // console.log(res.locals);
    console.log(res.locals.currentUser);
    let currentUser = res.locals.currentUser;
    if (currentUser) {
      let mappedKifus = res.locals.kifus.map(kifu => {
        let userJoined = currentUser.kifus.some(userKifu => {
          return userKifu.equals(kifu._id);
        });
        return Object.assign(kifu.toObject(), { joined: userJoined });
      });
      res.locals.kifus = mappedKifus;
      next();
    } else {
      next();
    }
  }
};
