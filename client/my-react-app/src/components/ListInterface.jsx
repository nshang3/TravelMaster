import '../stylesheets/App.css'

function ListInterface () {
    
    return (
        <>
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

            <div className="user-list-container">
                <h3>My Displayed Lists</h3>
                <button className="list-button">Summer List</button>
            </div>

        </>
    )
}