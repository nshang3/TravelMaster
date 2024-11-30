import React, { useState } from "react";
import "../stylesheets/App.css";
function Review () {
    return(
        <div className="review-container">
        <ul>
           <li className="tblRow">
                <div className="tblCol">Description</div>
                <div className="desc">Dogshit list</div>
           </li>
           <li className="tblRow">
                <div className="tblCol">Rating</div>
                <div className="desc">0/5</div> 
           </li>
           <li className="tblRow">
                <div className="tblCol">Bob</div>
                <div className="desc">Nov 29</div> 
           </li>  
        </ul>
    </div>
    )
}

export default Review