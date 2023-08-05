const express = require("express");
const { updateUser, deleteUser, getUser, getUsers } = require("../controller/user");
const {verifyToken,verifyUser, verifyAdmin} = require("../utils/authUtils");
const router = express.Router();
//update 
router.put("/:id", verifyUser,updateUser)
//delete
router.delete("/:id", verifyUser,deleteUser)
//get specific hotel
router.get("/:id", verifyUser, getUser)

//get all hotels
router.get("/", verifyAdmin,getUsers)
module.exports = router;