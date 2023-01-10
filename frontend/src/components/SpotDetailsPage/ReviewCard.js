import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { deleteReviewThunk } from '../../store/reviews';
import UpdateReviewForm from '../UpdateReviewForm';

function ReviewCard( {review} ) {
  
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector(state => state.session.user)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  
  const updateReview = (e) => {
    e.preventDefault();

    setShowUpdateForm(true)
  }

  const handleDelete = async (e) => {
    e.preventDefault();

    dispatch(deleteReviewThunk(review.id))
  }
  
  let updateForm;
  if (showUpdateForm) updateForm = <UpdateReviewForm review={review} setShowUpdateForm={setShowUpdateForm}/>

  return (
  <div className="spot-review-details-box">
    <div className="spot-review-overview">
    <span><i className="fa-solid fa-circle-user"></i> {review.User.firstName}</span>
    <span className="spot-review-stars">★ {review.stars}</span>
    </div>
    <div className="spot-review-text">{review.review}</div>
    { user && user.id === review.User.id && (
      <div className="spot-review-buttons">
        <button className="review-delete-button" onClick={updateReview}>Update your Review</button>
        <button className="review-delete-button" onClick={handleDelete}>Delete your Review</button>
      </div>
    )}
    {updateForm}
  </div>
  )
}

export default ReviewCard;