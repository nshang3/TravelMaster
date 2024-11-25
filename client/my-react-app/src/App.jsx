import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"
import { useState, useEffect} from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import Header from "./components/Header"
import LoginPage from "./components/LoginPage"


function Nav() {
  const navigate = useNavigate(); // Initialize navigation

  const handleLoginClick = () => {
    navigate("/auth/login"); // Redirect to the login route
  }

  return (
    <div className="logbtn">
      <button onClick={handleLoginClick}>Log In</button>
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (

    <Router>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/" element={
          <>
              <Header />
              <Nav />
              <div className="container">
                <div className="search-section">
                  <h2>Search For Destinations</h2>
                  <div className="search-controls">
                    <input id="pattern" type="text" placeholder="Search" maxLength="30" />
                    <select id="field">
                      <option></option>
                      <option value="Destination">Destination</option>
                      <option value="Region">Region</option>
                      <option value="Country">Country</option>
                    </select>
                    <button id="get-destinations">Search</button>
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
                      <Marker position={[51.505, -0.09]}></Marker>
                    </MapContainer>
                  </div>

                  <label htmlFor="occur">Destinations/Page</label>
                  <select id="occur">
                    <option></option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>

                <div id="display-countries"></div>

                <div className="page-actions">
                  <button id="prev">Previous</button>
                  <button id="next">Next</button>
                </div>

                <div>
                  <h3 id="pageNumbers">0 of 0</h3>
                </div>

                <div className="grid-container"></div>
              </div>
        </>}/>
      </Routes>
    </Router>
  )
}

export default App
