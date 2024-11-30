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

      const [openStates, setOpenStates] = useState(Array(currentDests.length).fill(false));

        const toggleDropdown = (index) => {
        setOpenStates((prev) => {
        const newStates = [...prev];
        newStates[index] = !newStates[index];
        return newStates;
        })
        }
    return (
    <>
        {currentDests.map((dest, destIndex) => (
            <div key={destIndex} className="destination" id={`tbl${destIndex}`}>
                <ul className="countryTbl">
                {isAdd && (
                    <button onClick={() => addInfo(dest.Destination, dest.Country)}>
                    Add to list
                    </button>
                )}

                {/* Display "Destination" and "Country" */}
                <li className="tblRow">
                    <div className="tblCol">Destination</div>
                    <div className="desc">{dest.Destination}</div>
                </li>
                <li className="tblRow">
                    <div className="tblCol">Country</div>
                    <div className="desc">{dest.Country}</div>
                </li>

                {/* Toggle details */}
                <button onClick={() => toggleDropdown(destIndex)}>
                    {openStates[destIndex] ? "Hide Details" : "Show Details"}
                </button>

                {/* Conditionally render additional rows */}
                {openStates[destIndex] &&
                    Object.keys(dest)
                    .filter((key) => key !== "Destination" && key !== "Country")
                    .map((key, index) => (
                        <li className="tblRow" key={index}>
                        <div className="tblCol">{key}</div>
                        <div className="desc">{dest[key]}</div>
                        </li>
                    ))}
                </ul>
            </div>
        ))}
    </>)
}

export default Destinations