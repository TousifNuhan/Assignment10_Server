const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const userCollection=client.db("TourismDb").collection("user")

        app.get('/spot',async(req,res)=>{
            const cursor=tourismCollection.find()
            const result=await cursor.toArray()
            res.send(result)
        })

        app.post('/spot', async(req,res)=>{
            const spot=req.body
          
            const result=await tourismCollection.insertOne(spot)
            res.send(result)
        })

        //user

        app.post('/user', async(req,res)=>{
            const user=req.body
            console.log(user)
            const result=await userCollection.insertOne(user)
            console.log(result)
            res.send(result)
        })

        //lookup
        app.get('/user',async(req,res)=>{
           
            const result = await userCollection.aggregate([
                {
                    $lookup: {
                        from: "TouristCollection",
                        localField: "email",
                        foreignField: "email",
                        as: "touristSpots"
                    }
                },
               
            ]).toArray();
            console.log(result)
            res.send(result)
        })

        app.get('/user/:id',async(req,res)=>{
            const id=req.params.id
            console.log(id)
            const query={_id: new ObjectId(id)}
            const result=await tourismCollection.findOne(query)
            res.send(result)
        })

        app.put('/user/:id',async(req,res)=>{
            const id=req.params.id
            const updatedUserInfo=req.body
            const filter={_id : new ObjectId(id)}
            const options={upsert:true}
            const userInfo={
                $set:{
                    userName:updatedUserInfo.userName,
                     email:updatedUserInfo.email,
                     countryName:updatedUserInfo.countryName,
                     spotName:updatedUserInfo.spotName,
                     location:updatedUserInfo.location,
                     photoURL:updatedUserInfo.photoURL,
                     averageCost:updatedUserInfo.averageCost,
                     seasonality:updatedUserInfo.seasonality,
                     travelTime:updatedUserInfo.travelTime,
                     totalVisitors:updatedUserInfo.totalVisitors,
                     description:updatedUserInfo.description

                }
            }
            const result=await tourismCollection.updateOne(filter,userInfo,options)
            // console.log(result.modifiedCount)
            if(result.modifiedCount === 1){
                const updateInfo=await userCollection.updateMany(
                    {"touristSpots._id": new ObjectId(id)},
                    {
                        $set:{
                            "touristSpots.$.userName":updatedUserInfo.userName,
                            "touristSpots.$.email":updatedUserInfo.email,
                            "touristSpots.$.countryName":updatedUserInfo.countryName,
                            "touristSpots.$.spotName":updatedUserInfo.spotName,
                            "touristSpots.$.location":updatedUserInfo.location,
                            "touristSpots.$.photoURL":updatedUserInfo.photoURL,
                            "touristSpots.$.averageCost":updatedUserInfo.averageCost,
                            "touristSpots.$.seasonality":updatedUserInfo.seasonality,
                            "touristSpots.$.travelTime":updatedUserInfo.travelTime,
                            "touristSpots.$.totalVisitors":updatedUserInfo.totalVisitors,
                            "touristSpots.$.description":updatedUserInfo.description,
                        }
                    }
                )
                res.send(updateInfo)
                console.log(updateInfo)
            }
            // res.send(result)
        })

        app.delete('/user/:id',async(req,res)=>{
            const id=req.params.id
            console.log( 'deleted',id)
            const query={_id: new ObjectId(id)}
            const result=await tourismCollection.deleteOne(query)
            if(result.deletedCount === 1){
                const updateResult=await userCollection.updateMany(
                    {"touristSpots._id": new ObjectId(id)},
                    {$pull: { touristSpots: { _id: new ObjectId(id) } }}
            )
            console.log(updateResult)
            res.send(updateResult)
            }
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