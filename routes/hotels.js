const express = require("express");
const Hotel = require("../models/Hotels");
const {createHotel, updateHotel, deleteHotel, getHotel, getHotels} = require("../controller/hotel");
const {verifyAdmin} = require("../utils/authUtils")

const router = express.Router();
//send
router.post("/", verifyAdmin, createHotel)
//update
router.put("/:id", verifyAdmin,updateHotel)
//delete
router.delete("/:id",verifyAdmin,deleteHotel)
//get specific hotel
router.get("/:id", getHotel)

//get all hotels
router.get("/", getHotels)

module.exports = router;