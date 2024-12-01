import React, { useState, useEffect } from "react";
import "../stylesheets/App.css";
import "../stylesheets/ReviewPopUp.css"
import Review from "./Review"
function List({ list_name, desc, destinationNames, destinationCountries, userKey, username, authorKey, date, loggedInUserName, reloadPublicList, reloadUserList }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState(false)
  const [listRating, setRating] = useState("")
  const [comment, setComment] = useState("")
  const [displayReviews, setDisplayReviews] = useState([])
  const [review, setReview] = useState({
    listName: "",
    rating: 0,
    reviewDesc: "",
    visibility: true,
    username: "",
    date: ""
  })
  const [reloadReviews, setReloadReviews] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [editListName, setEditListName] = useState(list_name)
  const [editDescription, setEditDescription] = useState(desc)
  const [destinations, setDestinations] = useState(destinationNames.map((name, index) => ({ name, country: destinationCountries[index] })))
  // console.log("the logged in user is", userKey)
  // console.log("the author of the list is", authorKey)
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  }
  const handleAddDestination = () => {
    setDestinations([...destinations, { name: "", country: "" }])
  }
  const handleRemoveDestination = (index) => {
    const newDestinations = destinations.filter((_, i) => i !== index)
    setDestinations(newDestinations)
  }
  const handleDestinationChange = (index, field, value) => {
    const updatedDestinations = [...destinations]
    updatedDestinations[index][field] = value
    setDestinations(updatedDestinations)
  }
  const handleSaveEdit = async () => {
    const fieldsToUpdate = {}

    console.log('Updating with:', fieldsToUpdate)
    if (editListName !== list_name) {
      fieldsToUpdate.listName = editListName
    }
    if (editDescription !== desc) {
      fieldsToUpdate.desc = editDescription
    }
    if (JSON.stringify(destinations) !== JSON.stringify(destinationNames)) {
      fieldsToUpdate.destIDs = destinations // assuming 'destinations' is an array with updated destinations
    }
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(`/api/secure/destinations/lists/${list_name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fieldsToUpdate),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log("List updated successfully!")
      setIsEditing(false) 
      reloadUserList(prev => !prev)
      reloadPublicList(prev => !prev)
    } catch (error) {
      console.error("An error occurred while saving the list: ", error)
    }
  }


  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const toggleReviewPopup = () => {
    setIsReviewPopupOpen(!isReviewPopupOpen)
  }

  const handleSaveReview = () => {
    if (listRating && comment) {
      console.log("Saved Review:", { listRating, comment, list_name })
      
      const currentEasternTime = new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      })

      setReview(prev => ({...prev,
        listName: list_name,
        rating: listRating,
        reviewDesc: comment,
        visibility: true,
        username: loggedInUserName,
        date: currentEasternTime
      }) )
      
      setRating("")
      setComment("")
      setIsReviewPopupOpen(false)
    } else {
      alert("Please fill out both fields.")
    }
  }

  useEffect( () => {
    if(review.listName !== "") {
      createReview()
    }
  },[review])

  const createReview = async () => {
    const reviewInfo = {...review}
    try{
      const token = localStorage.getItem("jwtToken")
      let response
      response = await fetch(`/api/secure/destinations/lists/${reviewInfo.listName}/reviews`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
              },
          body: JSON.stringify(reviewInfo)
      })

      console.log("Payload:", JSON.stringify(reviewInfo))
      console.log("Response status:", response.status)
      console.log("Response headers:", [...response.headers])
      setReloadReviews(true)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }


    }
    catch (error) {
      console.error('A problem occurred when adding the review ', error)
    }
  }

  const closeReviewPopup = () => {
    setIsReviewPopupOpen(false)
    setRating("")
    setComment("")
  }

  const getReviews = async () => {
    try{
      //console.log("getReviews is called ")
      // const token = localStorage.getItem("jwtToken");
      // console.log("The stupid fucking token is ", token)
      let response
      response = await fetch(`/api/open/destinations/lists/${list_name}/reviews`)


      if (response.status === 404) {
        console.log(`No reviews found for the list: ${list_name}`);
        setDisplayReviews([])
        return;
      }
  
      if (!response.ok) {
        // Handle other errors
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const confirmation = await response.json()
      // console.log("Confirmation:", confirmation)
      
      setDisplayReviews(confirmation)

  }
  catch (error) {
      console.error('A problem occurred when add the list: ', error)
  }

  }


  useEffect( () => {
    getReviews()
  },[])

  useEffect( () => {
    getReviews()
  },[reloadReviews])


  return (
  
    <>
    <div className="user-list">
      <div className="list-header" onClick={toggleDropdown}>
        <h4>{list_name}</h4>
        {userKey === authorKey && (
          <button className="addReview" onClick={toggleEdit}>
            {isEditing ? "Cancel Edit" : "Edit List"}
          </button>
        )}
      </div>

      <div className={`list-details ${isOpen ? "open" : ""}`}>
        {isEditing ? (
          <div>
            <div className="edit-field">
              <label>List Name:</label>
              <input
                type="text"
                value={editListName}
                onChange={(e) => setEditListName(e.target.value)}
              />
            </div>
            <div className="edit-field">
              <label>Description:</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="edit-destinations">
              <h4>Destinations</h4>
              {destinations.map((dest, index) => (
                <div key={index} className="destination-item">
                  <input
                    type="text"
                    placeholder="Destination Name"
                    value={dest.name}
                    onChange={(e) => handleDestinationChange(index, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={dest.country}
                    onChange={(e) => handleDestinationChange(index, "country", e.target.value)}
                  />
                  <button onClick={() => handleRemoveDestination(index)}>Remove</button>
                </div>
              ))}
              <button onClick={handleAddDestination}>Add Destination</button>
            </div>
            <button className="save-edit" onClick={handleSaveEdit}>Save Changes</button>
          </div>
        ) : (
          <>
            <p><strong>Description:</strong> {desc}</p>
            <p><strong>Made by:</strong> {username}</p>
            <p><strong>Last Updated:</strong>{date}</p>
            <ul>
              {destinationNames.map((name, index) => (
                <li key={index}>
                  <span>{name}</span> - <span>{destinationCountries[index]}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <h3>Reviews</h3>
        {userKey && <button className="addReview" onClick={toggleReviewPopup}>Add Review</button>}
        {displayReviews.map((review) => (
          <Review
            key={review._id}
            rating={review.rating}
            desc={review.reviewDesc}
            visibility={review.visibility}
            username={review.username}
            date={review.date}
          />
        ))}
      </div>
    </div>

    {isReviewPopupOpen && (
        <div className="overlay">
          <div className="review-popup">
            <h4>Add a Review</h4>
            <div className="popup-field">
              <label>Rating:</label>
              <input
                type="number"
                min="1"
                max="5"
                value={listRating}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
            <div className="popup-field">
              <label>Comment:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>
            <div className="popup-buttons">
              <button onClick={handleSaveReview}>Save</button>
              <button onClick={closeReviewPopup}>Cancel</button>
            </div>
          </div>
        </div>
      )}
        
  </>

  )
}

export default List;
