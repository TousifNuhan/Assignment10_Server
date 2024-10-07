const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_PASS}@cluster0.l6latif.mongodb.net/?appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const tourismCollection=client.db("TourismDb").collection("TouristCollection")

        app.get('/spot',async(req,res)=>{
            const cursor=tourismCollection.find()
            const result=await cursor.toArray()
            res.send(result)
        })

        app.post('/spot', async(req,res)=>{
            const spot=req.body
            const result=await tourismCollection.insertOne(spot)
            req.send(result)
        })
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Working')
})

app.listen(port, () => {
    console.log(`Port is working on: ${port}`)
})