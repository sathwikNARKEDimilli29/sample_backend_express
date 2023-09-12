const mongoose = require("mongoose");
const mongoURI =
  "mongodb+srv://sathwiknarkedimilli29:root@cluster0.gyekfu2.mongodb.net/";

const connectToMongo = async () => {
  await mongoose.connect(mongoURI);
};
console.log("connected to mongo db");

module.exports = connectToMongo;
