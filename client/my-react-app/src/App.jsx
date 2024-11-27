import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef} from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Header from "./components/Header"
import LoginPage from "./components/LoginPage"
import Destinations from "./components/Destinations"
import Markers from "./components/Markers"
import "./stylesheets/App.css"
function Nav() {
  const navigate = useNavigate(); // Initialize navigation

  const handleLoginClick = () => {
    navigate("/login"); // Redirect to the login route
  }

  return (
    <div className="logbtn">
      <button onClick={handleLoginClick}>Log In</button>
    </div>
  )
}

function App() {
  const [isSearch, setIsSearch] = useState(false)
  const [searchIDs, setSearchIDs] = useState([])
  const [destinations, setDestinations] = useState([])
  const [coords, setCoords] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const searchInputs = useRef(Array(3).fill(null))
  const [destsPerPage, setDestsPerPage] = useState(5)
  const [isLoggedIn, setLoggedIn] = useState(false)
  useEffect ( () => {
    console.log("useEffect for fetching ids called ")
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
    console.log("useEffect for fetching searches called ")
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
  return (

    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setLoggedIn={setLoggedIn} />} />
        <Route path="/" element={
          <>
              <Header />
              <Nav />
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
                  <select id="occur" onChange={(e) => setDestsPerPage(Number(e.target.value))}>
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
                  <Destinations allDestinations={destinations} currentPage={currentPage} destPerPage={destsPerPage} />
                </div>
              
                {isLoggedIn && (
                  <div className="favorites-section">
                    <h2>My Travel Lists</h2>
                    <div className="list-controls">
                      <input id="list-name" type="text" placeholder="Enter list name..." />
                      <input id="destinations" type="text" placeholder="Enter destinations separated by commas" />
                      <button id="create-list">Create List</button>
                    </div>
                    <div className="list-container">
                      <ul id="custom-lists"></ul>
                    </div>
                    <div className="list-actions">
                      <button id="load-list">Load List</button>
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
                )}
              </div>
        </>}/>
      </Routes>
    </Router>
  )
}

export default App
