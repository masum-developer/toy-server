const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app =express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.obrngag.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const toyCollection = client.db('toyDatabase').collection('toy');
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


    const indexKeys = {toyName:1}
    const indexOptions= {name:"titleSearch"};
    const result = await toyCollection.createIndex(indexKeys,indexOptions);


    app.get("/toy-name/:text", async (req, res) => {
        const text = req.params.text;
        const result = await toyCollection
          .find({
               toyName: { $regex: text, $options: "i" } 
          })
          .toArray();
        res.send(result);
      });
 
    app.get("/all-toy", async (req, res) => {

        
        const result= await toyCollection.find().limit(20).toArray();
        res.send(result);
      });


      app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const options = {
        projection: { toyName: 1, sellerName: 1, sellerEmail: 1, toyPicture: 1, price: 1,rating:1,quantity:1,detail:1 }
      }
      

      const result = await toyCollection.findOne(query, options);
      res.send(result);
    })

    app.get('/toy-gallery', async (req, res) => {
      
      const result= await toyCollection.find().limit(8).toArray();
      res.send(result);
    })

      app.get('/toy-edit/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const options = {
        projection: { price: 1,quantity:1,detail:1 }
      }

      const result = await toyCollection.findOne(query, options);
      res.send(result);
    })
    app.delete('/toy-delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    
    app.patch('/toy-update/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      console.log(updatedToy);
      const updateDoc = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          detail: updatedToy.detail,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc)
      res.send(result);

    })
      
    app.get("/all-toy/:cat", async (req, res) => {

        
        const result= await toyCollection.find({subCategory:req.params.cat}).toArray();
        res.send(result);
      });


      app.get("/my-toy/descending/:email", async(req,res)=>{
        const result= await toyCollection.find({sellerEmail:req.params.email}).sort({ price: -1 }).toArray();
        res.send(result);
      })
      app.get("/my-toy/ascending/:email", async(req,res)=>{
        const result= await toyCollection.find({sellerEmail:req.params.email}).sort({ price: 1 }).toArray();
        res.send(result);
      })

    app.post("/add-toy", async (req, res) => {
        const body = req.body;
  
        console.log(body);
        const result = await toyCollection.insertOne(body);
        
        res.send(result);
  
      });


  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('avenger is coming')
})

app.listen(port,()=>{
    console.log(`avenger is running on port:${port}`);
})