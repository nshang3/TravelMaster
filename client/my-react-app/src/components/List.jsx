import React, { useState, useEffect } from "react";
import "../stylesheets/App.css";
import "../stylesheets/ReviewPopUp.css"
import Review from "./Review"
function List({ list_name, desc, destinationNames, destinationCountries, userKey, username }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState(false)
  const [listRating, setRating] = useState("")
  const [comment, setComment] = useState("")
  const [review, setReview] = useState({
    listName: "",
    rating: 0,
    reviewDesc: "",
    visibility: true
  })

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const toggleReviewPopup = () => {
    setIsReviewPopupOpen(!isReviewPopupOpen)
  }

  const handleSaveReview = () => {
    if (listRating && comment) {
      console.log("Saved Review:", { listRating, comment, list_name })
      
      setReview(prev => ({...prev,
        listName: list_name,
        rating: listRating,
        reviewDesc: comment,
        visibility: true
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
  return (
    <>
      <div className="user-list">
        <div className="list-header" onClick={toggleDropdown}>
          <h4>{list_name}</h4>
        </div>
        <div className={`list-details ${isOpen ? "open" : ""}`}>
          <p><strong>Description:</strong> {desc}</p>
          <ul>
            {destinationNames.map((name, index) => (
              <li key={index}>
                <span>{name}</span> - <span>{destinationCountries[index]}</span>
              </li>
            ))}
          </ul>
          <h3>Reviews</h3>
          {userKey && <button className="addReview" onClick={toggleReviewPopup}>Add Review</button>}
          <Review />
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
