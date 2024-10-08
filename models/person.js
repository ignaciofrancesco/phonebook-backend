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
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 9,
    validate: {
      validator: function (v) {
        return /\d{2,3}-\d{5,}/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number.`,
    },
    required: true,
  },
});

// Set the toJSON method to perform some transformation necessary to deal with data at the app level
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
