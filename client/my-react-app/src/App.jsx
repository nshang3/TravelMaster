import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from "react-router-dom"
import { useState, useEffect, useRef} from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Header from "./components/Header"
import LoginPage from "./components/LoginPage"
import Destinations from "./components/Destinations"
import Markers from "./components/Markers"
import List from "./components/List"
import DMCA from "./components/DMCA"
import AUP from "./components/AUP"
import Security from "./components/Security"
import "./stylesheets/App.css"


function App() {
  const [isSearch, setIsSearch] = useState(false)
  const [searchIDs, setSearchIDs] = useState([])
  const [destinations, setDestinations] = useState([])
  const [coords, setCoords] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const searchInputs = useRef(Array(3).fill(null))
  const [destsPerPage, setDestsPerPage] = useState(5)
  const [isLoggedIn, setLoggedIn] = useState(false)
  const [userKey, setUserKey] = useState('')
  const [user_name, setUserName] = useState('')
  const [publicLists, setPublicLists] = useState([])
  const [reloadPublicLists, setReloadPublicLists] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [users, setUsers] = useState([])

  console.log("The user key is", userKey)
  useEffect ( () => {
    //console.log("useEffect for fetching ids called ")
    async function getSearchIDs(){

      const dest = searchInputs.current[0]?.value || '';
      const region = searchInputs.current[1]?.value || '';
      const country = searchInputs.current[2]?.value || '';

      //console.log("The destination is ",dest)
      const response = await fetch(`/api/open/destinations/?search=true&search_name=${dest}&search_region=${region}&search_country=${country}`)
      
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.log(message);
        setIsSearch(false)
        return;
      }
  
      const searchIds = await response.json()
      setSearchIDs(searchIds)
      console.log("The search ids are ", searchIds)
      setIsSearch(false)
    }
    getSearchIDs()
    return
  },[isSearch])

  useEffect ( () => {
    //console.log("useEffect for fetching searches called ")
    async function getDestinations() {
      const destinationResponse = searchIDs.map( (id) =>
        fetch(`/api/open/destinations/${id}`).then( (res) => res.json())
      )
      const coordinateResponse = searchIDs.map( (id) =>
        fetch(`/api/open/destinations/${id}?latlong=true`).then( (res) => res.json())
      )
      const dests = await Promise.all(destinationResponse)
      const coords = await Promise.all(coordinateResponse)
      
      setDestinations(dests)
      setCoords(coords)
      setCurrentPage(1)
      // console.log("The destinations are", dests)
      // console.log("The destinations are", coords)
    }
    getDestinations()
    return
  },[searchIDs])

  const prevPage = () =>{
    if (currentPage > 1){
      setCurrentPage(currentPage - 1)
    }
 
  }
  const nextPage = () =>{
    if (currentPage * destsPerPage < destinations.length )
    setCurrentPage(currentPage + 1)
  }

  const handleDestPerPage = (event) => {
    const selectedValue = Number(event.target.value)
    if (selectedValue) {
      setDestsPerPage(selectedValue)
      setCurrentPage(1)
    }
  }

  const getPublicLists = async () => {
    try{
      console.log("getPublicLists is called ")

      let response
      response = await fetch('/api/open/publiclists')

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const confirmation = await response.json()
      console.log("Confirmation:", confirmation)
      
      setPublicLists(confirmation)

    }
    catch (error) {
        console.error('A problem occurred when add the list: ', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("jwtToken")
    setLoggedIn(false)
    setUserKey("")
    setUserName("")
    setIsAdmin(false)
    console.log("User has logged out. userKey reset to:", userKey)
  }

  useEffect(() => {
    getPublicLists()
  }, [])
  
  useEffect( () => {
    getPublicLists()
  },[reloadPublicLists])



  const [selected, setSelected] = useState(false); // Tracks the currently selected button
  const [list, setList] = useState({
    listName: "",
    destinationNames: [],
    destinationCountries: [],
    desc:"",
    visibility: false,
    userKey: userKey,
    userName: user_name,
    date: ""
  })
  const [isAddToList, setIsAddToList] = useState(false)
  const [userLists, displayUserLists] = useState([])
  const [userDests, setUserDests] = useState([])
  const [userCountries, setUserCountries] = useState([])
  const [reloadLists, setReloadLists] = useState(false)
  const listName = useRef('')
  const listDesc = useRef('')

  const handleToggle = () => {
    setSelected((prevSelected) => {
      const newSelected = !prevSelected; 
      setList((prevList) => ({
        ...prevList,
        visibility: newSelected, 
      }))
      return newSelected
    })
  }

  
  const createList = async () => {
    const listInfo = {...list}
    //console.log(list.listName)
    
    if (listInfo.listName !== "") {
      try{


        //console.log("CREATE LIST FUNCTION called ")
        const token = localStorage.getItem("jwtToken")
        console.log("The stupid fucking token is ", token)
        let response
        response = await fetch('/api/secure/destinations/lists', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
                },
            body: JSON.stringify(listInfo)
        })

        console.log("Payload:", JSON.stringify(listInfo))
        console.log("Response status:", response.status)
        console.log("Response headers:", [...response.headers])

        // const easternTime = new Date(response.headers.get("date")).toLocaleString("en-US", {
        //   timeZone: "America/New_York",
        // })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const confirmation = await response.json()
        console.log("Confirmation:", confirmation)
        
        setUserDests([])
        setUserCountries([])
        setReloadLists((prev) => !prev)

        if (listInfo.visibility == true) {
          setReloadPublicLists((prev) => !prev)
        }
        }
        catch (error) {
            console.error('A problem occurred when add the list: ', error)
        }
    }

  }

  useEffect( () => {
    console.log("useeffect for creating lists called")
    createList()
  }, [list])

  const populateList = () => {
    if (listName.current.value == "") {
      alert("Dumb fuck cant have empty list name")
    }

    const currentEasternTime = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    })
    setList(prev => ({
      ...prev,
      listName: listName.current.value || '', 
      destinationNames: userDests || [],
      destinationCountries: userCountries || [],
      desc: listDesc.current.value || '',
      visibility: selected,
      userKey: userKey,
      userName: user_name,
      date: currentEasternTime
    }))
    
  }

  const toggleAddDestinations = () => {
    setIsAddToList((prev) => !prev)
  
    // if (isAddToList) {
    //   // console.log("Done adding destinations:");
    //   // console.log("Destination Names:", destNames);
    //   // console.log("Destination Countries:", destCountries);
    // }
  }

  const addDestinationInfo = (destName, destCountry) => {
    if (destName && destCountry) {
      setUserDests((prev) => [...prev, destName])
      setUserCountries((prev) => [...prev, destCountry])
    }
  }

  const getUserLists = async () => {

    try{
      console.log("getUserLists is called ")
      const token = localStorage.getItem("jwtToken");
      // console.log("The stupid fucking token is ", token)
      let response
      response = await fetch(`/api/secure/destinations/lists/?userKey=${userKey}`, {
        headers: {
            Authorization: `Bearer ${token}`
          }
    
        })

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const confirmation = await response.json()
      // console.log("Confirmation:", confirmation)
      
      displayUserLists(confirmation)

  }
  catch (error) {
      console.error('A problem occurred when add the list: ', error)
  }

  }

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    console.log("Token to run getUserLists", token)
    if (isLoggedIn && token) {
      getUserLists()
    } else {
      console.log("Token not found, skipping getUserLists call")
    }
  }, [reloadLists, userKey])

  
  const fetchUsers = async () => {
    try {
      const response = await fetch('/auth/users')
 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const users = await response.json()
      setUsers(users)

    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  useEffect(() => {
    if (showModal) {
      fetchUsers()
    }
  }, [showModal])


  const handleDisableUser = (event, userId) => {

  }
  return (

    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setLoggedIn={setLoggedIn} setUserKey={setUserKey} setUserName={setUserName} setIsAdmin={setIsAdmin}/>} />
        <Route path="/DMCA" element={<DMCA />}/>
        <Route path="/AUP" element={<AUP />}/>
        <Route path="/Security" element={<Security/>}/>
        <Route path="/" element={
          <>
              <Header />
              <ul>
                <li><Link to="/DMCA">DMCA Policy</Link></li>
                <li><Link to="/AUP">Acceptable Use Policy</Link></li>
                <li><Link to="/Security">Security & Privacy Policy</Link></li>
              </ul>
              <Nav isLoggedIn={isLoggedIn} handleLogout={handleLogout}/>
              {isAdmin && <button className="admin-button" onClick={() => setShowModal(true)}>Admin Panel</button>}
              {showModal && (
                  <div className="modal">
                    <div className="modal-content">
                      <button className="close" onClick={() => setShowModal(false)}>&times;</button>
                      <h2>Users List</h2>
                      <table>
                        <thead>
                          <tr>
                            <th>User ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Admin</th>
                            <th>Make Admin</th>
                            <th>Disable user</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user._id}>
                              <td>{user._id}</td>
                              <td>{user.nickname}</td>
                              <td>{user.email}</td>
                              <td>{user.isAdmin.toString()}</td>
                              <td>
                                <input
                                  id={`check-${user._id}`}
                                  type="checkbox"
                                  name={"ChangeToAdmin"}
                                  className="checkbox-input"
                                />
                              </td>
                              <td>
                                <input
                                  id={`disable-${user._id}`}
                                  type="checkbox"
                                  className="checkbox-input"
                                  onChange={(e) => handleDisableUser(e, user._id)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
              )}
              <div className="container">
                <div className="search-section">
                  <h2>Search For Destinations</h2>
                  <div className="search-controls">
                    <input ref={(el) => (searchInputs.current[0] = el)} type="text" placeholder="Search Destination" maxLength="30" className="searchInput" />
                    <input ref={(el) => (searchInputs.current[1] = el)} type="text" placeholder="Search Region" maxLength="30" className="searchInput"/>
                    <input ref={(el) => (searchInputs.current[2] = el)} type="text" placeholder="Search Country" maxLength="30" className="searchInput"/>
                    <button id="get-destinations" onClick={() => {setIsSearch(true); }}>Search</button>
                  </div>

                  <div id="map-section">
                    <MapContainer
                      className="map-container"
                      center={[51.505, -0.09]}
                      zoom={13}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Markers allCoords={coords} currentPage={currentPage} destPerPage={destsPerPage}/>
                    </MapContainer>
                  </div>

                  <label htmlFor="occur">Destinations/Page</label>
                  <select id="occur" onChange={(e) => handleDestPerPage(e)}>
                    <option></option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>

                <div id="display-countries"></div>

                <div className="page-actions">
                  <button id="prev" onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                  <button id="next" onClick={nextPage} disabled={currentPage * destsPerPage >= destinations.length}>Next</button>
                </div>

                <div>
                  <h3 id="pageNumbers">{currentPage} of {Math.ceil(destinations.length / destsPerPage)}</h3>
                </div>

                <div className="grid-container">
                  <Destinations allDestinations={destinations} currentPage={currentPage} destPerPage={destsPerPage} isAdd={isAddToList} addInfo={addDestinationInfo}/>
                </div>

                <h3>Public Lists</h3>
                <div className="grid-container">
                  {publicLists.map((list) => (
                    <List
                      key={list._id}
                      list_name={list.listName}
                      desc={list.desc}
                      destinationNames={list.destinationNames}
                      destinationCountries={list.destinationCountries}
                      userKey={isLoggedIn ? userKey : undefined}
                      username={list.userName}
                      authorKey={list.userKey}
                      date={list.date}
                      loggedInUserName={user_name}
                      reloadPublicList={setReloadLists}
                      reloadUserList={setReloadPublicLists}/>))}
                </div>
                
                
                
                
                {isLoggedIn && (
                  <>
                    <div className="favorites-section">
                      <h2>My Travel Lists</h2>
                      <div className="list-controls">
                        <div className="list-inputs">
                          <input ref={(el) => (listName.current = el)} type="text" placeholder="Enter list name..." />
                          <textarea ref={(el) => (listDesc.current = el)} placeholder="Enter description"></textarea>
                        </div>
                        <div className="list-actions">
                          <button onClick={toggleAddDestinations}>{isAddToList ? "Stop Adding Destinations" : "Add Destinations"}</button>
                          <label htmlFor="radio" className="radio-label">
                            <input id="radio" type="radio" name="visibility" className="radio-input" onChange={handleToggle} checked={selected} />
                            Publicly Visible
                          </label>
                          <button onClick={() => populateList()}>Create List</button>
                        </div>
                      </div>
                      <div className="list-actions">
                        <button id="delete-list">Delete List</button>
                        <input id="searchCustom" type="text" placeholder="Search" />
                        <select id="sort-option">
                          <option></option>
                          <option value="Destination">Name</option>
                          <option value="Region">Region</option>
                          <option value="Country">Country</option>
                        </select>
                        <button id="sort-customLists">Sort</button>
                        <button id="get-countries">Get Countries</button>
                      </div>
                    </div>

                    <h3>My Lists</h3>
                    <div className="user-lists-container">
                    {userLists.map((list) => (
                          <List
                            key={list._id}
                            list_name={list.listName}
                            desc={list.desc}
                            destinationNames={list.destinationNames}
                            destinationCountries={list.destinationCountries}
                            userKey={isLoggedIn ? userKey : undefined}
                            username={list.userName}
                            authorKey={list.userKey}
                            date={list.date}
                            loggedInUserName={user_name}
                            reloadPublicList={setReloadLists}
                            reloadUserList={setReloadPublicLists}/>))}
                    </div>

                  </>
                )}
              </div>
        </>}
        />
      </Routes>
    </Router>
  )
}

function Nav({isLoggedIn, handleLogout}) {
  const navigate = useNavigate() // Initialize navigation

  const handleLoginClick = () => {
    if (isLoggedIn) {
      handleLogout()
    } else {
      navigate("/login")
    }
  }

  return (
    <div className="logbtn">
      <button onClick={handleLoginClick}>{isLoggedIn ? "Logout" : "Login"}</button>
    </div>
  )
}

export default App
