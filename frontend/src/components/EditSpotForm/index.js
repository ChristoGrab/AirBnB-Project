import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateSpot } from '../../store/spots'

function EditSpotForm() {
  
  const dispatch = useDispatch();
  const history = useHistory();
  const { spotId } = useParams();
  
  // list of state variables
  const [inputErrors, setInputErrors] = useState([]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  
  const updateAddress = (e) => setAddress(e.target.value)
  const updateCity = (e) => setCity(e.target.value)
  const updateRegion = (e) => setRegion(e.target.value)
  const updateCountry = (e) => setCountry(e.target.value)
  const updateName = (e) => setName(e.target.value)
  const updateDescription = (e) => setDescription(e.target.value)
  const updatePrice = (e) => setPrice(e.target.value)
  
  useEffect(() => {
    let errors = []
    if (address.length <= 5) errors.push("Please provide a valid address")
    if (name.length <= 2) errors.push("Please provide a valid name")
    if (city.length <= 2) errors.push("Please provide a valid city")
    if (region.length <= 1) errors.push("Please provide a valid state")
    if (country.length <= 1) errors.push("Please provide a valid country")
    if (description.length <= 12) errors.push("Please provide a brief description of your listing that is at least 12 characters long")
    if (price <= 1 || price >= 10000) errors.push("Please provide a $ price per night between 1 and 10000")
    setInputErrors(errors)
  }, [address, name, city, region, country, description, price])

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      address,
      city,
      state: region,
      country,
      name,
      description,
      price
    }

    dispatch(updateSpot(payload, spotId))
    history.push(`/spots/${spotId}`)
  }

  return (
    <div>
      <form>
        <div>
          Want to make some edits to your listing info? You're in the right place
        </div>
        <div className="edit-spot-errors">
          <ul>
            {inputErrors.map((error) => (
              <li>
                {error}
              </li>
            ))}
          </ul>
        </div>
        <label>
          Address
          <input
            type="text"
            required
            value={address}
            onChange={updateAddress}/>
        </label>
        <label>
          City
          <input
            type="text"
            required
            value={city}
            onChange={updateCity}/>
        </label>
        <label>
          State
          <input
            type="text"
            value={region}
            onChange={updateRegion}/>
        </label>
        <label>
          Country
          <input
            type="text"
            value={country}
            onChange={updateCountry}/>
        </label>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={updateName}/>
        </label>
        <label>
          Description
          <textarea
            type="text"
            value={description}
            onChange={updateDescription}/>
        </label>
        <label>
          Price
          <input
            type="text"
            value={price}
            onChange={updatePrice}/>
        </label>
        <button 
        // disabled={!!inputErrors.length}
        onClick={handleSubmit}>Add your listing!</button>
      </form>
    </div>
  )
}

export default EditSpotForm;