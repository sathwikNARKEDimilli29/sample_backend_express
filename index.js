// mongodb+srv://sathwiknarkedimilli29:root@cluster0.gyekfu2.mongodb.net/
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");

connectToMongo();

const app = express();
app.use(express.json());
app.use(cors());
const port = 5000;

// available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
