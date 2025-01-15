import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import { HotelType } from "../shared/types";

const router = express.Router();

// /api/my-bookings
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({
      bookings: { $elemMatch: { userId: req.userId } },
    });

    const results = hotels.map((hotel) => {
      const userBookings = hotel.bookings.filter(
        (booking) => booking.userId === req.userId
      );

      const hotelWithUserBookings: HotelType = {
        ...hotel.toObject(),
        bookings: userBookings,
      };

      return hotelWithUserBookings;
    });

    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});


router.post("/booking", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const {firstName , lastName , email , roomCount , checkIn , checkOut , hotelId , totalCost} = req.body;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    const booking = {
      firstName,
      lastName,
      email,
      roomCount,
      checkIn,
      checkOut,
      userId,
      totalCost,
    
    };

    hotel.bookings.push(booking);
    const data = await hotel.save();
    // @ts-ignore
    res.status(200).json({ success: true, data: data.bookings });

    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to create booking" });
  }
});

export default router;
