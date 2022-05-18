"use strict";

const router = require("express").Router(),
      kifusController = require("../controllers/kifusController"),
      usersController = require("../controllers/usersController");

router.use(usersController.verifyJWT);
router.get("", kifusController.index, kifusController.indexView);
router.get("/new", kifusController.new);
router.post("/create", kifusController.create, kifusController.redirectView);
router.get("/:id/edit", kifusController.edit);
router.put("/:id/update", kifusController.update, kifusController.redirectView);
router.get("/:id", kifusController.show, kifusController.showView);
router.delete("/:id/delete", kifusController.delete, kifusController.redirectView);

module.exports = router;
