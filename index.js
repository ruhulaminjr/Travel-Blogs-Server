const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdjvz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const userDb = client.db("travelBlog");
    const usersCollection = userDb.collection("users");
    const usersBlogs = userDb.collection("userBlog");
    app.post("/saveusers", async (req, res) => {
      const user = req.body;
      const savetodb = await usersCollection.insertOne(user);
      res.send(savetodb);
    });
    app.get("/getadmin/:email", async (req, res) => {
      const userEmail = req.params.email;
      const user = await usersCollection.findOne({ email: userEmail });
      if (user) {
        if (user.role === "admin") {
          res.send({ admin: true });
        }
      } else {
        res.send({ admin: false });
      }
    });
    app.post("/newblog", async (req, res) => {
      const data = req.body;
      const result = await usersBlogs.insertOne(data);
      res.send(result);
    });

    app.delete("/blogdelete/:id", async (req, res) => {
      const id = ObjectId(req.params.id);
      const deleted = await usersBlogs.deleteOne({ _id: id });
      res.send(deleted);
    });
    app.get("/getblog/:id", async (req, res) => {
      const id = ObjectId(req.params.id);
      const findBlog = await usersBlogs.findOne({ _id: id });
      res.send(findBlog);
    });
    app.get("/getblogs", async (req, res) => {
      const allcarts = await usersBlogs.find({}).toArray();
      res.send(allcarts);
    });
    app.put("/approveblog/:id", async (req, res) => {
      const id = ObjectId(req.params.id);
      const options = { upsert: true };
      // create a document that sets the plot of the movie
      const updateDoc = {
        $set: {
          status: "approved",
        },
      };
      const update = await usersBlogs.updateOne(
        { _id: id },
        updateDoc,
        options
      );
      res.send(update);
    });
  } finally {
  }
}

run().catch((error) => console.log(error));
app.get("/", (req, res) => {
  res.send("Server Running Succesfully");
});
app.listen(port, () => {
  console.log(`Server Running On http://localhost:${port}/`);
});
