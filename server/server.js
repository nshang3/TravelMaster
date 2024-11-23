const { connectToMongoDB } = require("./connection.js")
const { ObjectId } = require("mongodb")
const authRouter = require("./auth.js")


const express = require('express');
const {check, param, query, validationResult} = require('express-validator')
const app = express();
const port = 3000;

const router = express.Router()
let db

connectToMongoDB().then( (database) => {
    db = database
    app.use('/api', router)
    app.use('/auth', authRouter(db))
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
            visibility: req.body.visibility,
            date: req.body.date
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

}
const editList = async (req, res) => {
    let collection = await db.collection("custom_lists")
    let query = {listName: req.params.listName}

    const fieldsToUpdate = {}
    if (req.body.listName !== undefined) fieldsToUpdate.listName = req.body.listName
    if (req.body.destIDs !== undefined) fieldsToUpdate.destIDs = req.body.destIDs
    if (req.body.desc !== undefined) fieldsToUpdate.desc = req.body.desc
    if (req.body.visibility !== undefined) fieldsToUpdate.visibility = req.body.visibility
    if (req.body.date !== undefined) fieldsToUpdate.date = req.body.date
    
    const put = {$set: fieldsToUpdate}

    try{
        let result = await collection.updateOne(query, put)

        if (result.matchedCount == 0) {
            return res.status(404).json({ error: `Destination ${req.params.listName} was not found` })
        }

        res.send(result).status(200)
    }
    catch (error) {
        res.status(500).json({error: "An error occured while updating the list", details: error.message})
    }
}
const deleteList = async (req, res) => {
    try{
        const query = {listName: req.params.listName}
        const collection = await db.collection("custom_lists")

        let result = await collection.deleteOne(query)

        if (result.deletedCount == 0) {
            return res.status(404).json({ error: `Destination ${req.params.listName} was not found` })
        }

        res.send(result).status(200)
    }
    catch (error) {
        res.status(500).json({error: "An error occured while updating the list", detalis: error.message})
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
        editList
    )
    .delete(
        //authenticate
        [
            param('listName').isString().trim().withMessage("Provide a proper name"),
            handleValidationErrors
        ],
        deleteList
    )


const getReviewsFromName = async (req, res) => {
    let collection = await db.collection("reviews")
    let query ={listName: req.params.listName}
    let result = await collection.find(query).toArray()

    if (result.length==0) {
        return res.status(404).json({ error: `Destination ${req.params.listName} and its reviews not found` })
    }
    else{
        res.send(result)
    }
}
const postReviewFromName = async (req, res) => {

    try{
        let newDocument = {
            listName: req.params.listName,
            rating: req.body.rating,
            reviewDesc: req.body.reviewDesc,
            visibility: req.body.visibility,
        }

        let collection = await db.collection("reviews")
        let result = await collection.insertOne(newDocument)
        res.send(result).status(204)

    }
    catch (error) {
        return res.status(400).json({ error: 'Could not add review' })
    }
}
const deleteReview = async (req, res) => {
    try{
        const query = {_id: new ObjectId(req.query.id)}
        const collection = await db.collection("reviews")

        let result = await collection.deleteOne(query)

        if (result.deletedCount == 0) {
            return res.status(404).json({ error: `Review ${req.params.listName} was not found` })
        }

        res.send(result).status(200)
    }
    catch (error) {
        res.status(500).json({error: "An error occured while deleting a review", detalis: error.message})
    }
}

router.route('/secure/destinations/lists/:listName/reviews')
    .get(
        [
            param('listName').isString().trim().withMessage("Provide a proper name"),
            handleValidationErrors
        ],
        getReviewsFromName
    )
    .post(
        param('listName').isString().trim().withMessage("Provide a proper name"),
        postReviewFromName
    )
    .delete(
        deleteReview
    )

// const authenticate = (req, res) => {
    
// }
