import React, { useState } from "react";
import "../stylesheets/App.css";
function Review ({confirmCode, rating, desc, visibility, username, date}) {
     //console.log(visibility)
    return(
        <div className="review-container">
        <ul>
           <li className="tblRow">
                <div className="tblCol">Description</div>
                <div className="desc">{desc}</div>
           </li>
           <li className="tblRow">
                <div className="tblCol">Rating</div>
                <div className="desc">{rating}/5</div> 
           </li>
           <li className="tblRow">
                <div className="tblCol">{username}</div>
                <div className="desc">{date}</div> 
           </li>
           <li className="tblRow">
                <div className="tblCol">Confirmation</div>
                <div className="desc">{confirmCode}</div> 
           </li>    
        </ul>
    </div>
    )
}

export default Review