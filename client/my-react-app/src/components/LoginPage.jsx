import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from 'react-router-dom'
import Header from "./Header"
import '../stylesheets/LoginPage.css'


function LoginPage({setLoggedIn, setUserKey, setUserName, setIsAdmin, setIsDisabled}) {
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
                    const errorData = await response.json();
                    alert(errorData.error || "Login was unsuccessful.");
                  }
                
                  const confirmation = await response.json()
                  console.log("Confirmation:", confirmation)

                  if (confirmation.isDisabled) {
                    alert("Your account has been disabled. Please contact support.")
                    setIsDisabled(true)
                    return; 
                  }

                  localStorage.setItem("jwtToken", confirmation.token);
                  
                  setUserKey(confirmation.userId)
                  setUserName(confirmation.name)
                  setLoggedIn(true)
                  setIsAdmin(confirmation.isAdmin)
                  navigate('/')
            }
            catch (error) {
                alert("Login was unsuccessful. Please try again.");
            }
        }
    }

    useEffect ( () => {
        login()
    }, [loginData])


    const submitLogin = () => {
        const email = emailInput.current.value.trim();
        const password = passInput.current.value.trim();

        if (!email) {
            alert("Please enter an email address.");
            return;
        }

        if (!validateEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!password) {
            alert("Please enter a password.");
            return;
        }

        setLoginData(prev => ({
            ...prev,
            email: emailInput.current.value || '', 
            password: passInput.current.value || ''
          })) 
    }

    const [newAccount, setNewAccount] = useState({
        nickname: "",
        email: "",
        password: "",
        disabled: false
    })

    const createName = useRef("")
    const createEmail = useRef("")
    const createPass = useRef("")

    const createAccount = async () => {
        const accountInfo = {...newAccount}

        if ( accountInfo.nickname !== ""){
            try{


                console.log("CREATE ACCOUNT FUNCTION useEffect called ")
                console.log(accountInfo.email)
                console.log(accountInfo.password)
    
                let response
                response = await fetch('/auth/user', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        },
                    body: JSON.stringify(accountInfo)
                })
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const confirmation = await response.json()
                console.log("Confirmation:", confirmation)
                alert("Account created. Please verify your email.");

            }
            catch (error) {
                console.error('A problem occurred when creating an account: ', error);
            }
        }
    }


    useEffect ( () => {
        createAccount()
    }, [newAccount])

    const submitAccount = () => {
        setNewAccount(prev => ({
            ...prev,
            nickname: createName.current.value || '',
            email: createEmail.current.value || '', 
            password: createPass.current.value || ''
          }))
    }

    const updatePassword = async (oldPassword, newPassword) => {
        try {
            if (!email || !oldPassword || !newPassword) {
              alert("Email, old password, and new password are required.");
              return;
            }
        
            const response = await fetch('/auth/user/password', {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, oldPassword, newPassword }),
            });
        
            if (!response.ok) {
              const errorData = await response.json();
              alert(errorData.error || "Failed to update password.");
              return;
            }
        
            alert("Password updated successfully.");
          } catch (error) {
            console.error("Error updating password:", error);
            alert("An error occurred while updating your password. Please try again.");
          }
      }
      
      const handlePasswordUpdate = () => {
        const oldPassword = prompt("Enter your old password:");
        const newPassword = prompt("Enter your new password:");
        if (oldPassword && newPassword) {
          updatePassword(oldPassword, newPassword);
        }
      }

      const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
                        <button className="enter" onClick={() => handlePasswordUpdate()}>Update Password</button>
                    </div>
                </div>
            </div>

            {showCreateAccountPopup && (
            <div className="popup-overlay">
                <div className="popup-card">

                <h2>Create Account</h2>
                <div className="popup-input">
                    <input className="input" id="createName" type="text" placeholder="Enter Name" maxLength="30" ref={(el) => createName.current = el}/>
                    <input className="input" id="createEmail" type="text" placeholder="Enter Email" maxLength="30" ref={(el) => createEmail.current = el}/>
                    <input className="input" id="createPassword" type="text" placeholder="Enter Password" ref={(el) => createPass.current = el}/>
                </div>

                <div className="popup-buttons">
                    <button className="enter"onClick={() => {submitAccount(); setShowCreateAccountPopup(false); }}>Submit</button>
                    <button className="cancel" onClick={() => setShowCreateAccountPopup(false)}> Cancel </button>
                </div>
            </div>
        </div>)}
        </>
    )
}

export default LoginPage