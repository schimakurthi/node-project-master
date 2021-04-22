const express = require("express");
const user_controller = require("../controllers/user.controller");
var VerifyToken = require("./verifyToken");

const router = express.Router();
router.post("/register", user_controller.register);
router.post("/login", user_controller.login);
router.post("/update",VerifyToken, user_controller.updateUser);
module.exports = router ;
