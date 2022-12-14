import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { createNewSpot } from '../../store/spots'
import { createImageThunk } from '../../store/spots';
import './CreateSpotForm.css'

// Form for Creating New Spot
function CreateSpotForm({hideModal}) {

  // list of state variables
  const dispatch = useDispatch();
  const history = useHistory();

  const [inputErrors, setInputErrors] = useState([]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [url, setUrl] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false)

  // list of input functions
  const updateAddress = (e) => setAddress(e.target.value)
  const updateCity = (e) => setCity(e.target.value)
  const updateRegion = (e) => setRegion(e.target.value)
  const updateCountry = (e) => setCountry(e.target.value)
  const updateName = (e) => setName(e.target.value)
  const updateDescription = (e) => setDescription(e.target.value)
  const updatePrice = (e) => setPrice(e.target.value)
  const updateUrl = (e) => setUrl(e.target.value)

  // list of input errors
  useEffect(() => {
    let errors = []
    if (address.length <= 5) errors.push("Please provide a valid address")
    if (name.length <= 2) errors.push("Please provide a name for your listing")
    if (city.length <= 2) errors.push("Please provide a valid city")
    if (region.length <= 1) errors.push("Please provide at least 2 initials for your state")
    if (country.length <= 1) errors.push("Please provide at least 2 initials for your country")
    if (description.length <= 10) errors.push("Please provide at least a brief description of your listing (10 char min)")
    if (isNaN(price) || price <1 || price > 10000) errors.push("Please provide a valid price per night within the $1-10000 range")
    if (!url.length) errors.push("Please provide an image url to display as a preview image")
    setInputErrors(errors)
  }, [address, name, city, region, country, description, price, url])

  const handleSubmit = async (e) => {

    e.preventDefault();
    setFormSubmitted(true)

    if (inputErrors.length) return;

    const payload = {
      address,
      city,
      state: region,
      country,
      name,
      description,
      price
    }

    const imgPayload = {
      url,
      preview: true
    }

    // reset input errors
    setInputErrors([])

    // send new spot for validation check in backend
    const newSpot = await dispatch(createNewSpot(payload))
      .catch(async (response) => {

        const data = await response.json();

        // if new errors, return them
        if (data && data.errors) {
          setInputErrors(data.errors);
        }
      });

    //ok, now send the picture creation thunk
    dispatch(createImageThunk(imgPayload, newSpot.id));

    // 
    hideModal();
    history.push(`/user/profile`)
  }

  // Component JSX
  return (
    <div className="create-spot-form-container">
      <form className="create-spot-form">
        <div className="create-spot-form-greeting">
          Ready to join our growing family of hosts?
        </div>
        {formSubmitted && <div className="create-spot-errors">
          <div className="spot-errors-list">
            {inputErrors.map((error, idx) => (
              <li key={idx} className="error-list-item">
                {error}
              </li>
            ))}
          </div>
        </div>}
        <label>
          Address
          <input className="create-spot-form-input"
            type="text"
            required
            value={address}
            onChange={updateAddress} />
        </label>
        <label>
          City
          <input className="create-spot-form-input"
            type="text"
            required
            value={city}
            onChange={updateCity} />
        </label>
        <label>
          State
          <input className="create-spot-form-input"
            type="text"
            value={region}
            onChange={updateRegion} />
        </label>
        <label>
          Country
          <input className="create-spot-form-input"
            type="text"
            value={country}
            onChange={updateCountry} />
        </label>
        <label>
          Name
          <input className="create-spot-form-input"
            type="text"
            value={name}
            onChange={updateName} />
        </label>
        <label>
          Description
          <textarea className="create-spot-form-textarea"
            type="text"
            value={description}
            onChange={updateDescription} />
        </label>
        <label>
          Price
          <input className="create-spot-form-input"
            type="text"
            value={price}
            onChange={updatePrice} />
        </label>
        <label>
          Preview Image url
          <input className='create-spot-form-input'
            type='url'
            value={url}
            onChange={updateUrl} />
        </label>
        <button id="create-spot-submit-button"
          // disabled={!!inputErrors.length}
          onClick={handleSubmit}>Add your listing!</button>
      </form>
    </div>
  )
}

export default CreateSpotForm;
