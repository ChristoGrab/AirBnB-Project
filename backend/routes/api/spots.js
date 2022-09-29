const express = require('express')
const { Spot, Review, SpotImage, User, ReviewImage, sequelize } = require('../../db/models');
const { requireAuth } = require('../../utils/auth')
const router = express.Router();
const { Op } = require('sequelize');
const { validateReview } = require('../../utils/errors');


// CREATE IMAGE FOR SPOT //
router.post('/:spotId/images', requireAuth, async (req, res) => {

  const spot = await Spot.findByPk(req.params.spotId)

  if (!spot) {
    return res.json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }

  const { url, preview } = req.body;

  const newImage = await SpotImage.create({
    spotId: req.params.spotId,
    url,
    preview
  })

  return res.json({
    id: newImage.id,
    url,
    preview
  })

})


// GET ALL REVIEWS BY A SPOT'S ID //
router.get('/:spotId/reviews', async (req, res) => {
  const spotReviews = await Review.findAll({
    where: {
      spotId: req.params.spotId
    },
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: ReviewImage,
        attributes: ['id', 'url']
      }
    ]
  })

  // An empty array is still a truthy value, so we need to check for length if there are no spots
  if (!spotReviews.length) {
    res.status(404)
    return res.json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }

  return res.json({ "Reviews": spotReviews })

})

// GET SPOTS OWNED BY CURRENT USER //
router.get('/current', requireAuth, async (req, res) => {

  const mySpots = await Spot.findAll({
    where: {
      ownerId: req.user.id
    },
    attributes: {
      include: [
        [sequelize.fn('round', sequelize.fn('avg', sequelize.col('stars')), 1), 'avgRating']
      ]
    },
    group: ['Spot.id', "SpotImages.id"],

    include: [
      {
        model: User,
        as: "Owner",
        attributes: []
      },
      {
        model: SpotImage
      },
      {
        model: Review,
        attributes: []
      }
    ]
  })

  const spotsList = []
  mySpots.forEach(spot => {
    spotsList.push(spot.toJSON())
  })

  spotsList.forEach(spot => {
    spot.SpotImages.forEach(image => {
      if (image.preview === true) {
        spot.previewImage = image.url
      }
    })
  })

  // Delete the nested array of images
  spotsList.forEach(spot => {
    delete spot.SpotImages
  })

  res.json({ "Spots": spotsList })
})

// GET SPOT BY ID //

router.get('/:spotId', async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId, {
    attributes: {

      include: [
        [sequelize.fn('count', sequelize.col('review')), 'numReviews'],
        [sequelize.fn('round', sequelize.fn('avg', sequelize.col('stars')), 1), 'avgRating']
      ]
    },

    group: ["Spot.id", "SpotImages.id", "Owner.id"],

    include: [
      {
        model: SpotImage,
        attributes: ["id", "url", "preview"]
      },
      {
        model: User,
        as: "Owner",
        attributes: ["id", "firstName", "lastName"]
      },
      {
        model: Review,
        attributes: []
      }
    ]
  })

  if (!spot) {
    res.status(404)
    return res.json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }

  res.json(spot)
})

// GET ALL SPOTS //

router.get('/', async (req, res) => {

  // Include average rating for each Spot from its associated Reviews
  const allSpots = await Spot.findAll({
    attributes: {
      include: [
        [sequelize.fn('round', sequelize.fn('avg', sequelize.col('stars')), 1), 'avgRating']
      ]
    },
    // Have to include SpotImages for PostrGres
    group: ["Spot.id", "SpotImages.id"],
    include: [
      { model: SpotImage },
      {
        model: Review,
        attributes: []
      }
    ]
  });

  // Create an array of each spot by converting each to JSON
  let spotsList = [];
  allSpots.forEach(spot => {
    spotsList.push(spot.toJSON())
  })

  // Iterate through each spot, finding the associated SpotImage with preview set to true
  spotsList.forEach(spot => {
    spot.SpotImages.forEach(image => {
      if (image.preview === true) {
        spot.previewImage = image.url
      }
    })

    // Message if no images are marked as preview
    if (!spot.previewImage) {
      spot.previewImage = "This spot doesn't have a preview image"
    }
  })

  // Delete the nested array of images
  spotsList.forEach(spot => {
    delete spot.SpotImages
  })

  res.json({ "Spots": spotsList });
})

// CREATE REVIEW FOR A SPOT BASED ON THE SPOT'S ID //
router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId, {
    include: [
      {
        model: Review,
      }
    ]
  })

  if (!spot) {
    res.status(404)
    return res.json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }

  // Turn the Spot into a JSON
  let hasReview = false;
  const spotToJSON = spot.toJSON();

  spotToJSON.Reviews.forEach(review => {
    if (review.userId === req.user.id) {
      hasReview = true;
    }
  })

  if (hasReview === true) {
    res.status(403);
    return res.json({
      "message": "User already has a review for this spot",
      "statusCode": 403
    })
  }

  const { review, stars } = req.body;

  const newReview = await Review.create({
    userId: req.user.id,
    spotId: spot.id,
    review,
    stars
  })

  res.status(201);
  return res.json(newReview);
})


// CREATE A NEW SPOT //
router.post('/', requireAuth, async (req, res) => {

  // Deconstruct request body for fields
  const {
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price
  } = req.body

  // Set ownerId to current User id with nifty req.user
  const newSpot = await Spot.create({
    ownerId: req.user.id,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price
  })

  res.status(201);
  res.json(newSpot)

})

// EDIT A SPOT //

router.put('/:spotId', requireAuth, async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId)

  if (!spot) {
    res.status(404)
    return res.json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }

  if (spot.ownerId !== req.user.id) {
    res.status(403);
    return res.json({
      "message": "Forbidden",
      "statusCode": 403
    })
  }

  const {
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price
  } = req.body

  const updatedSpot = await spot.update({
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price
  })

  res.json(updatedSpot)
})

// DELETE A SPOT //

router.delete('/:spotId', requireAuth, async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId)

  if (!spot) {
    res.status(404)
    return res.json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }

  if (spot.ownerId !== req.user.id) {
    res.status(403)
    return res.json({
      "message": "Forbidden",
      "statusCode": 403
    })
  }

  await spot.destroy()

  res.json({
    "message": "Successfuly deleted",
    "statusCode": 200
  })
})

module.exports = router;