const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("api is up");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.judr2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    //DB CONNECTION--------------------------------
    await client.connect();
    console.log("connected to db");
    const db = client.db("go-trip");
    const eventCollection = db.collection("events");
    const userCollection = db.collection("users");
    const orderCollection = db.collection("orders");

    //---------APIs------------------------------------------------------------------------------
    //GET ALL EVENTS API
    app.get("/events", async (req, res) => {
      try {
        const cursor = eventCollection.find({});
        const events = await cursor.toArray();
        if (events) {
          res.json(events);
        } else {
          res.status(404).send("No Events Found");
        }
      } catch (err) {
        res.status(500).send("interna server error: ", err);
      }
    });

    // GET SINGLE EVENT API
    app.get("/events/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const event = await eventCollection.findOne({ _id: ObjectId(id) });

        if (event._id == id) {
          res.json(event);
        } else {
          res.status(404).send("No Event Found");
        }
      } catch (err) {
        res.status(500).send("interna server error: ", err);
      }
    });

    // GET SINGLE USER API
    app.get("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const user = await userCollection.findOne({ uid: id });

        if (user.uid == id) {
          res.json(user);
        } else {
          res.status(404).send("No Event Found");
        }
      } catch (err) {
        res.status(500).send("interna server error: ", err);
      }
    });

    // ADD USER API
    app.post("/users/addUser", async (req, res) => {
      try {
        const user = req.body;

        if (!user.email) {
          res.status(403).send("Invalid Input");
        }

        const result = await userCollection.insertOne(user);
        if (result.acknowledged) {
          res.json(user);
        } else {
          throw new Error("Could not add User");
        }
      } catch (err) {
        res.status(500).send("interna server error: ", err);
      }
    });

    // UPDATE USER API
    app.put("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const user = req.body;

        const filter = await userCollection.findOne({ uid: id });
        const options = { upsert: true };

        const updateDoc = {
          $set: {
            name: user.name,
            phone: user.phone,
            address: user.address,
          },
        };

        if (user.uid === filter.uid) {
          const result = await userCollection.updateOne(filter, updateDoc, options);

          res.json(user);
        } else {
          res.status(404).send("could not updated");
        }
      } catch (err) {
        res.status(500).send(`interna server error: ${err}`);
      }
    });

    // ADD ORDER/BOOKING API
    app.post("/orders/addOrder", async (req, res) => {
      try {
        const order = req.body;
        if (!order.uid) {
          res.status(403).send("Invalid Input");
        }

        const result = await orderCollection.insertOne(order);
        if (result.acknowledged) {
          res.json(order);
        } else {
          res.status(500).send("Internal Server Error");
        }
      } catch (err) {
        res.status(500).send(`interna server error: ${err}`);
      }
    });

    //--------------------------------------------------------------------------
  } catch (err) {
    console.log(err);
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log("Listening to port: ", port);
});
