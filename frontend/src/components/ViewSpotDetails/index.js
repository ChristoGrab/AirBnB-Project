import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getOneSpot } from '../../store/spots';
import './ViewSpotDetails.css';

function ViewSpotDetails() {
  const dispatch = useDispatch();
  const { spotId } = useParams();

  useEffect(() => {
    dispatch(getOneSpot(spotId))
  }, [dispatch, spotId])

  const mySpot = useSelector(state => state.spots.singleSpot);
  const currentUser = useSelector(state => state.session.user)

  let imageList = []
  
  // need to create a conditional for mapping images, otherwise
  // runs into a timing issue with dispatch.
  
  if (mySpot.SpotImages) {
    mySpot.SpotImages.forEach(img => imageList.push(img))
  }
  
  console.log(imageList)
  
  return (
    <div className="spot-details-container">
      <div className="spot-details-header">
        <div>{mySpot.name}</div>
        <div>{mySpot.avgRating}</div>
        <div>{mySpot.numReviews}</div>
        <div>{mySpot.city}, {mySpot.state}, {mySpot.country}</div>
      </div>
      <div className="spot-details-image-list">
        <ul>
          {imageList.map(img => (
            <img key ={img.id} src={img.url} alt={img.name}></img>
          ))}
        </ul>
      </div>
      <div className="spot-details-description">
        {mySpot.description}
      </div>
    </div>
  )
}

export default ViewSpotDetails;