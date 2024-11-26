import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'

function Markers ({allCoords, currentPage, destPerPage}){
    const startOfRange = (currentPage - 1) * destPerPage
    const endOfRange = startOfRange + destPerPage
    const currentCoords = allCoords.slice(startOfRange, endOfRange)
    const coordsArray = currentCoords.map(loca => [parseFloat(loca.latitude), parseFloat(loca.longitude)])
    return(
        <>
        {coordsArray.map( (value) => 
            <Marker position={value}></Marker>)}
        </>
    )
}

export default Markers