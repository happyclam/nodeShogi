"use strict";

const router = require("express").Router(),
      homeController = require("../controllers/homeController"),
      kifusController = require("../controllers/kifusController"),
      subscribersController = require("../controllers/kifusController"),
      usersController = require("../controllers/usersController");

router.post("/login", usersController.apiAuthenticate);
router.use(usersController.verifyJWT);
//ログインユーザー一覧表示
router.get(
  "/users/loggedin",
  usersController.filterUserLoggedIn,
  usersController.respondJSON
);
router.get(
  "/kifus",
  kifusController.index,
  kifusController.filterUserKifus,
  kifusController.respondJSON
);
router.get("/logout", usersController.logout, usersController.respondJSON);
router.get("/kifus/:id/join", kifusController.join, kifusController.respondJSON);
//対戦申し込み
router.post(
  "/apply",
  homeController.apply
);
//test
router.get(
  "/subscribers",
  subscribersController.index,
  subscribersController.respondJSON
);

router.use(kifusController.errorJSON);

module.exports = router;
