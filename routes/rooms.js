const express = require("express");
const{verifyAdmin} = require("../utils/authUtils")
const { createRoom, updateHotelRoom, deleteRoom, getRoom, getRooms } = require("../controller/room");

const router = express.Router();

router.post("/:hotelid", verifyAdmin, createRoom)
//update
router.put("/:id", verifyAdmin,updateHotelRoom)
//delete
router.delete("/:id/:hotelid ",verifyAdmin,deleteRoom)
//get specific hotel
router.get("/:id", getRoom)

//get all hotels
router.get("/", getRooms)
module.exports = router;