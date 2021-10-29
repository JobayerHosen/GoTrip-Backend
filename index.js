const express = require("express");
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
    await client.connect();
    console.log("connected to db");
    const db = client.db("go-trip");
    const eventCollection = db.collection("events");

    app.get("/events", async (req, res) => {
      const cursor = eventCollection.find({});
      const events = await cursor.toArray();
      console.log(events);
      if (events) {
        res.json(events);
      } else {
        res.status(404).send("No Events Found");
      }
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log("Listening to port: ", port);
});
