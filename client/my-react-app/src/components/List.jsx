import React, { useState, useEffect } from "react";
import "../stylesheets/App.css";
import "../stylesheets/ReviewPopUp.css"
import Review from "./Review"
function List({ list_name, desc, destinationNames, destinationCountries, userKey, username, date, loggedInUserName }) {
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

  // useEffect(() => {
  //   console.log("Received userKey in List:", userKey)
  // }, [userKey])
  console.log(loggedInUserName)

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
        </div>
        <div className={`list-details ${isOpen ? "open" : ""}`}>
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
          <h3>Reviews</h3>
          {userKey && <button className="addReview" onClick={toggleReviewPopup}>Add Review</button>}
          {displayReviews.map((review) => (
                    <Review
                      key={review._id}
                      rating={review.rating}
                      desc={review.reviewDesc}
                      visibility={review.visibility}
                      username={review.username}
                      date={review.date}/>
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
