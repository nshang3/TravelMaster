import React, { useState } from "react";
import "../stylesheets/App.css";

function List({ listName, desc, destinationNames, destinationCountries }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen); // Toggle the dropdown
  };

  return (
    <div className="user-list">
      <div className="list-header" onClick={toggleDropdown}>
        <h4>{listName}</h4>
      </div>
      <div className={`list-details ${isOpen ? "open" : ""}`}>
        <p><strong>Description:</strong> {desc}</p>
        <ul>
          {destinationNames.map((name, index) => (
            <li key={index}>
              <span>{name}</span> - <span>{destinationCountries[index]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default List;
