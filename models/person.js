require("dotenv").config();
const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

console.log("Connecting to Mongo...");

mongoose
  .connect(url)
  .then((result) => {
    console.log("Connected to MongDB.");
  })
  .catch((error) => {
    console.log("Connection failed.", error);
  });

const personSchema = mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
