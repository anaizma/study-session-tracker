const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const sessions = require("./routes/api/sessions");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/api/sessions", sessions);

const port = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});