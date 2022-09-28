const express = require('express');
const router = express.Router()
const { Booking, Spot, User, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth')


// GET ALL OF THE CURRENT USER'S BOOKINGS

router.get('/current', requireAuth, async (req, res) => {
  const myBookings = await Booking.findAll({
    where: {
      userId: req.user.id
    },
    include: {
      model: Spot,
      attributes: {
        exclude: ['description', 'createdAt', 'updatedAt']
      },
      include: [
        {
          model: SpotImage,
          attributes: ['preview', 'url']
        }
      ]
    }
  })
  
  //TRYING TO SOLVE PREVIEWIMAGE
  
  // let bookingsList = []
  // myBookings.forEach(booking => {
  //   bookingsList.push(booking.toJSON())
  // })
  
  // let spotsList = []
  // bookingsList.forEach(booking => {
  //   spotsList.push(booking.Spot)
  //   })
    
  // let imageList = []
  // spotsList.forEach(spot => {
  //   imageList.push(spot.SpotImages)
  // })
  
  // console.log(imageList)
  // let imgUrl;
  
  // imageList[0].forEach(image => {
  //   if (image.preview === true) {
  //     imgUrl = image.url
  //   }
  // })
  
  // console.log(imgUrl);
  
  res.json({"Bookings": myBookings})
})

// DELETE A BOOKING

router.delete('/:bookingId', requireAuth, async (req, res) => {
  const booking = await Booking.findByPk(req.params.bookingId, {
    include: {
      model: Spot
    }
  });
  
  if (!booking) {
    res.status(404)
    return res.json({
      "message": "Booking couldn't be found",
      "statusCode": 404
    })
  }
  
  if (booking.userId !== req.user.id) {
    res.status(403)
    return res.json({
      "message": "Forbidden",
      "statusCode": 403
    })
  }
  
  await booking.destroy();
  res.json({
    "message": "Successfully deleted",
    "statusCode": 200
  })
})

module.exports = router;