const { connectToMongoDB } = require("./connection.js")


const express = require('express');
const {check, param, query, validationResult} = require('express-validator')
const app = express();
const port = 3000;

const router = express.Router()
let db

connectToMongoDB().then( (database) => {
    db = database

    app.use('/api', router)

    app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
    })
}).catch( (err) => {
    console.error("Failed to connect to MongoDB. Server not started:", err)
})

const csv = require('csv-parser')
const fs = require('fs')

app.use('/', express.static('../client'))
router.use(express.json())

const destinations = []
const customLists = []

fs.createReadStream('./data/europe-destinations.csv')
    .pipe(csv())//will format the csv into rows where each row has key value pairs. 
    .on("data", (obj) => //data is already a javascript object that has properties 
    {
        
         const validObj = {};
         for (let key in obj) {
           // Remove hidden characters, pipes, and trim whitespace
           validObj[key.trim()] = obj[key]
             .replace(/[^\x20-\x7E\u00C0-\u017F]/g, "") // Allow accented characters
             .trim();
            
        }
        destinations.push(validObj) 
    }
)
    .on("end", () => {
        console.log("CSV data parsed")

    })

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


const getDestinations = (req, res) => {

    const {
        // allCountries,
        search,
        search_name = "",
        search_region = "",
        search_country = ""
    } = req.query;
    

        

        // if(allCountries){
        //     let resultC = [...new Set(destinations.map(dest => dest.Country))]
        //     return res.send(resultC)
        // }
        if(search){
            let filteredIndices = destinations.reduce((acc, dest, index) => {
            //console.log("Destination Value:", JSON.stringify(dest["Destination"]), "Search Value:", JSON.stringify(search_name.toLowerCase()));
            
            
            if (
                ( (dest["Destination"].toLowerCase().startsWith(search_name.toLowerCase())) || !search_name) &&
                ( (dest["Region"].toLowerCase().startsWith(search_region.toLowerCase())) ||  !search_region) && 
                ( (dest["Country"].toLowerCase().startsWith(search_country.toLowerCase())) ||  !search_country) ) {
                
                    console.log(dest["Destination"].toLowerCase().startsWith(search_name.toLowerCase()))
                    acc.push(index); // Add the index to the accumulator if it matches
            }
            return acc;
            }, []);

            if (filteredIndices.length == 0) {
                // res.status(404).send(`Destinations from provided query not found`)
                return res.status(404).json({ error: 'Destinations from provided query not found' })
            }
            else{
                return res.send(filteredIndices)
            }
        }
        else{
            return res.send(destinations)
        }
}

const getDestinationsFromID = (req, res) => {
    const index = req.params.dest_id
    const dest = destinations[index]
    
    if (!dest) {
        return res.status(404).json({ error: `Destination ${req.params.dest_id} was not found` })
        //return res.status(404).send(`Destination ${req.params.dest_id} was not found`);
    }
    
    if (dest){
        
        if (req.query.latlong) {
            res.send({
                latitude: dest.Latitude,
                longitude: dest.Longitude
            })
        }
        else{
            res.send(dest)
        }
    }
}

router.route('/open/destinations')//do for countries a query parameter i.e. ?all=true and ?countryName=...
    .get( 
        [
            query('allCountries').optional().isBoolean().withMessage('allCountries must be a boolean value').toBoolean(), 
            query('search').optional().isBoolean().withMessage('search must be a boolean value').toBoolean(), 
            query('search_name').optional().isString().trim().matches(/^[\p{L}\s]+$/u).withMessage('input must contain only letters and spaces'),
            query('search_region').optional().isString().trim().matches(/^[\p{L}\s]+$/u).withMessage('input contain only letters and spaces'),
            query('search_country').optional().isString().trim().matches(/^[\p{L}\s]+$/u).withMessage('input contain only letters and spaces'),
            handleValidationErrors
        ],
        getDestinations
    )   

router.route('/open/destinations/:dest_id')
    .get( 
    [
        param('dest_id').isInt().toInt(), 
        query('latlong').optional().isBoolean().toBoolean(),
        handleValidationErrors
    ],
    getDestinationsFromID 
    )




const getList = async (req, res) => {
    let collection = await db.collection("custom_lists")
    let results = await collection.find({}).toArray()
    res.send(results).status(200)
}
const postList = async (req, res) => {
    try{
        let newDocument = {
            listName: req.body.listName,
            destIDs: req.body.destIDs,
            desc: req.body.desc,
            visibility: req.body.visibility
        }

        let collection = await db.collection("custom_lists")
        //console.log("Im here ", collection)
        let result = await collection.insertOne(newDocument)
        res.send(result).status(204)

    }
    catch (error) {
        return res.status(400).json({ error: 'List name already exists' })
    }

}

router.route('/secure/destinations/lists')
    .get(
        // authenticate
        getList
        )
    .post(
        // authenticate, 
        [
            check('listName').notEmpty().withMessage("List name is required"),
            check('destIDs').isArray().withMessage("destIDs must be an array"),
            handleValidationErrors
        ],
        postList
    )


const getListFromName = async (req, res) => {
    
    let collection = await db.collection("custom_lists")
    let query ={listName: req.params.listName}
    let result = await collection.findOne(query)

    if (!result) {
        return res.status(404).json({ error: `Destination ${req.params.listName} was not found` })
    }

    if (req.query.ids){
        res.send(result.destIDs).status(200)
    }
    else{
        const list = result.destIDs.map(index => destinations[index])
        res.send(list)
    }

    
    // const found = customLists.find(list => list.listName.trim().toLowerCase() === req.params.listName.trim().toLowerCase())

    //     if (!found){
    //         return res.status(404).json({ error: `Destination ${req.params.listName} was not found` })
    //         //return res.status(404).send(`Destination ${req.params.listName} was not found`);
    //     }

    //     if (req.query.ids){
    //         res.send(found.destIDs)
    //     }
    //     else{
    //         const list = found.destIDs.map(index => destinations[index])
    //         res.send(list)
    //     }
}
const putDestinationsInList = (req, res) => {
    const found = customLists.find(list => list.listName.trim().toLowerCase() === req.params.listName.trim().toLowerCase())

    if (!found){
        return res.status(404).json({ error: `Destination ${req.params.listName} was not found` })
        //return res.status(404).send(`Destination ${req.params.listName} was not found`);
    }

    const newIDs = req.body.destIDs
    found.destIDs = newIDs
    res.send(found)
}
const deleteList = (req, res) => {
    (req, res) => {
        const index = customLists.findIndex(list => list.listName.trim().toLowerCase() === req.params.listName.trim().toLowerCase())

        if (index === -1){
            return res.status(404).json({ error: `Destination ${req.params.listName} was not found` })
            //return res.status(404).send(`Destination ${req.params.listName} was not found`);
        }

        customLists.splice(index, 1)
        res.send(customLists)
    }
}
router.route('/secure/destinations/lists/:listName')
    .get(
        //authenticate
        [
            query('ids').optional().isBoolean().toBoolean(),
            param('listName').isString().trim().withMessage("Provide a proper name"),
            handleValidationErrors
        ],
        getListFromName
    )
    .put(
        //authenticate
        [
            param('listName').isString().trim().withMessage("Provide a proper name"),
            handleValidationErrors
        ],
        putDestinationsInList
    )
    .delete(
        //authenticate
        [
            param('listName').isString().trim().withMessage("Provide a proper name"),
            handleValidationErrors
        ],
        deleteList
    )

// const authenticate = (req, res) => {
    
// }
