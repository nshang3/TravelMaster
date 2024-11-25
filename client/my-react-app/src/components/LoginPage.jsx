import React, { useState, useEffect } from "react";
import Header from "./Header";
import '../stylesheets/LoginPage.css'


function LoginPage() {
    const [showCreateAccountPopup, setShowCreateAccountPopup] = useState(false)

    return (
        <>
            <Header />
            <h1 className="login">Login</h1>
            <div className="login-container">
                <div className="login-card">
                    
                    <div className="login-controls">
                        <input className="input" id="email" type="text" placeholder="Enter Email" maxLength="30" />
                        <input className="input" id="password" type="text" placeholder="Enter Password" maxLength="30" />
                        <button className="enter">Enter</button>
                        <button className="create-account-button" onClick={() => setShowCreateAccountPopup(true)}> Create Account </button>
                    </div>
                </div>
            </div>

            {showCreateAccountPopup && (
            <div className="popup-overlay">
                <div className="popup-card">

                <h2>Create Account</h2>
                <div className="popup-input">
                    <input className="input" id="createName" type="text" placeholder="Enter Name" maxLength="30"/>
                    <input className="input" id="createEmail" type="text" placeholder="Enter Email" maxLength="30"/>
                    <input className="input" id="createPassword" type="text" placeholder="Enter Password" maxLength="30"/>
                </div>

                <div className="popup-buttons">
                    <button className="enter"onClick={() => {alert("Account Created!"); setShowCreateAccountPopup(false)}}>Submit</button>
                    <button className="cancel" onClick={() => setShowCreateAccountPopup(false)}> Cancel </button>
                </div>
            </div>
        </div>)}
        </>
    )
}

export default LoginPage