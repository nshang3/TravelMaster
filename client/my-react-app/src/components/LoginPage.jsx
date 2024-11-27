import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from 'react-router-dom'
import Header from "./Header"
import '../stylesheets/LoginPage.css'


function LoginPage({setLoggedIn}) {
    const [showCreateAccountPopup, setShowCreateAccountPopup] = useState(false)
    const emailInput = useRef("")
    const passInput = useRef("")
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    })

    const navigate = useNavigate()
    const login = async () => {
        const loginInfo = {...loginData}

        if ( loginData.email !== ""){
            try{


                console.log("LOGIN FUNCTION useeffect called ")
                console.log(loginInfo.email)
                console.log(loginInfo.password)

                let response
                response = await fetch('/auth/login', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        },
                    body: JSON.stringify(loginInfo)
                })
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                
                  const confirmation = await response.json()
                  console.log("Confirmation:", confirmation)
                  setLoggedIn(true)
                  navigate('/')
            }
            catch (error) {
                console.error('A problem occurred when logging in: ', error);
            }
        }
    }

    useEffect ( () => {
        login()
    }, [loginData])


    const submitLogin = () => {

        setLoginData(prev => ({
            ...prev,
            email: emailInput.current.value || '', 
            password: passInput.current.value || ''
          })) 
    }
    return (
        <>
            <Header />
            <h1 className="login">Login</h1>
            <div className="login-container">
                <div className="login-card">
                    
                    <div className="login-controls">
                        <input className="input" ref={(el) => emailInput.current = el}type="text" placeholder="Enter Email" maxLength="30" />
                        <input className="input" ref={(el) => passInput.current = el} type="text" placeholder="Enter Password" maxLength="30" />
                        <button className="enter" onClick={() => submitLogin()}>Enter</button>
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