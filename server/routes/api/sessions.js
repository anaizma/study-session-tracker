const express = require("express");
const mongodb = require("mongodb");

const router = express.Router();

async function loadSessionsCollection() {
  const client = await mongodb.MongoClient.connect(
    "mongodb+srv://anauser:panipuri@cluster0.rksurxm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  );

  return client.db("study_tracker").collection("sessions");
}

router.get("/", async (req, res) => {
  const sessions = await loadSessionsCollection();
  const allSessions = await sessions.find({}).toArray();
  res.send(allSessions);
});

router.post("/", async (req, res) => {
  const sessions = await loadSessionsCollection();
  await sessions.insertOne({
    course: req.body.course,
    duration: req.body.duration,
    note: req.body.note,
    createdAt: new Date()
  });

  res.status(201).send();
});

router.put("/:id", async (req, res) => {
  const sessions = await loadSessionsCollection();
  await sessions.updateOne(
    { _id: new mongodb.ObjectId(req.params.id) },
    {
      $set: {
        course: req.body.course,
        duration: req.body.duration,
        note: req.body.note
      }
    }
  );

  res.status(200).send();
});

router.delete("/:id", async (req, res) => {
  const sessions = await loadSessionsCollection();
  await sessions.deleteOne({
    _id: new mongodb.ObjectId(req.params.id)
  });

  res.status(200).send();
});

module.exports = router;