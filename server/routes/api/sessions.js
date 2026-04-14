const express = require("express");
const mongodb = require("mongodb");

const router = express.Router();

async function loadSessionsCollection() {
  const client = await mongodb.MongoClient.connect(process.env.MONGODB_URI);
  return client.db("study_tracker").collection("sessions");
}

router.get("/", async (req, res) => {
  try {
    const sessions = await loadSessionsCollection();
    const allSessions = await sessions.find({}).toArray();
    res.send(allSessions);
  } catch (err) {
    console.error("GET /api/sessions error:", err);
    res.status(500).send({ error: "Failed to fetch sessions" });
  }
});

router.post("/", async (req, res) => {
  try {
    const sessions = await loadSessionsCollection();
    await sessions.insertOne({
      course: req.body.course,
      duration: req.body.duration,
      note: req.body.note,
      createdAt: new Date(),
    });

    res.status(201).send();
  } catch (err) {
    console.error("POST /api/sessions error:", err);
    res.status(500).send({ error: "Failed to add session" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const sessions = await loadSessionsCollection();
    await sessions.updateOne(
      { _id: new mongodb.ObjectId(req.params.id) },
      {
        $set: {
          course: req.body.course,
          duration: req.body.duration,
          note: req.body.note,
        },
      }
    );

    res.status(200).send();
  } catch (err) {
    console.error("PUT /api/sessions error:", err);
    res.status(500).send({ error: "Failed to update session" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const sessions = await loadSessionsCollection();
    await sessions.deleteOne({
      _id: new mongodb.ObjectId(req.params.id),
    });

    res.status(200).send();
  } catch (err) {
    console.error("DELETE /api/sessions error:", err);
    res.status(500).send({ error: "Failed to delete session" });
  }
});

module.exports = router;