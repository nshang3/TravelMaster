import React, { useState } from "react";
import "../stylesheets/App.css";
import "../stylesheets/ReviewPopUp.css"
import Review from "./Review"
function List({ listName, desc, destinationNames, destinationCountries }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState(false)
  const [rating, setRating] = useState("")
  const [comment, setComment] = useState("")

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const toggleReviewPopup = () => {
    setIsReviewPopupOpen(!isReviewPopupOpen)
  }

  const handleSaveReview = () => {
    if (rating && comment) {
      console.log("Saved Review:", { rating, comment });
      setRating("")
      setComment("")
      setIsReviewPopupOpen(false)
    } else {
      alert("Please fill out both fields.");
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
          <h4>{listName}</h4>
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
          <button className="addReview" onClick={toggleReviewPopup}>Add Review</button>
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
                value={rating}
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
