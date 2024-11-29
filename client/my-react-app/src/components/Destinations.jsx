import React, { useState, useEffect } from "react";


function Destinations ( {allDestinations, currentPage, destPerPage, isAdd, addInfo}) {
    const startOfChunk = (currentPage - 1) * destPerPage
    const endOfChunk = startOfChunk + destPerPage
    const currentDests = allDestinations.slice(startOfChunk, endOfChunk)
    const titles = [
        "Destination",
        "Region",
        "Country",
        "Category",
        "Latitude",
        "Longitude",
        "Approximate Annual Tourists",
        "Currency",
        "Majority Religion",
        "Famous Foods",
        "Language",
        "Best Time to Visit",
        "Cost of Living",
        "Safety",
        "Cultural Significance",
        "Description",
      ]

    return (
        <>
        {currentDests.map( (dest, index) => (
            <div key={index} className="destination" id={`tbl${index}`}>
                <ul className="countryTbl">
                    {isAdd && (<button onClick={()=>addInfo(dest.Destination, dest.Country)}>Add to list</button>)}
                    {Object.values(dest).map((value, index) => (
                        <li className="tblRow" key={index}>
                            <div className="tblCol">{titles[index]}</div>
                            <div className="desc">{value}</div>
                        </li>
                    ))}
                </ul>
            </div>
        ))}
        </>
    )
}

export default Destinations