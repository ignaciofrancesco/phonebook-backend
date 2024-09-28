const mongoose = require("mongoose");

// Listing all of the contacts
if (process.argv.length == 3) {
  const password = process.argv[2];
  const url = `mongodb+srv://ignaciofrancesco:${password}@cluster0.rwj6k.mongodb.net/PhonebookApp?retryWrites=true&w=majority&appName=Cluster0`;

  // Open connection
  mongoose.connect(url);

  // Create Schema for person
  const personSchema = mongoose.Schema({
    name: String,
    number: String,
  });

  // Create Model for person
  const Person = mongoose.model("Person", personSchema);

  // Query for all persons
  Person.find({}).then((result) => {
    console.log("Phonebook:");

    result.forEach((p) => {
      console.log(`${p.name} ${p.number}`);
    });

    mongoose.connection.close();
  });

  // Add entries to the phonebook
} else if (process.argv.length == 5) {
  const password = process.argv[2];
  const newName = process.argv[3];
  const newNumber = process.argv[4];
  const url = `mongodb+srv://ignaciofrancesco:${password}@cluster0.rwj6k.mongodb.net/PhonebookApp?retryWrites=true&w=majority&appName=Cluster0`;

  // Open connection
  mongoose.connect(url);

  // Create Schema for person
  const personSchema = mongoose.Schema({
    name: String,
    number: String,
  });

  // Create Model for person
  const Person = mongoose.model("Person", personSchema);

  const newPerson = new Person({
    name: newName,
    number: newNumber,
  });

  newPerson.save().then((result) => {
    console.log(`Added ${newName} number ${newNumber} to phonebook.`);
    mongoose.connection.close();
  });
} else {
  console.log("The program only accepts 1 or 3 arguments.");
}
