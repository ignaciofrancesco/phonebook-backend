const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

/* MIDDLEWARE */

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
// Custom middleware
app.use((request, response, next) => {
  request.timeReceived = new Date();
  next();
});
app.use(
  morgan(function (tokens, req, res) {
    const bodyJSON = JSON.stringify(req.body);

    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.req(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      bodyJSON,
    ].join(" ");
  })
);

/* DATA */

/* ENDPOINTS */

app.get("/api/persons", (request, response) => {
  Person.find({}).then((result) => {
    response.json(result);
  });
});

app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people.</p><p>${request.timeReceived}</p>`
    );
  });
});

app.get("/api/persons/:id", (request, response) => {
  // Look for the person
  const personId = request.params.id;

  Person.findById(personId).then((person) => {
    response.json(person);
  });
});

app.delete("/api/persons/:id", (request, response) => {
  // Get the id
  const personId = request.params.id;

  // Filter out the person
  persons = persons.filter((p) => {
    return p.id !== personId;
  });

  // Produce response
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  // Get the person from the body
  const data = request.body;

  /* Validations */

  // Validate existence of properties
  if (!data.name || !data.number) {
    return response
      .status(400)
      .json({ error: `The name or the number are missing.` });
  }

  // Validate no duplicates
  /* const personDuplicate = persons.find((p) => {
    return p.name.trim().toUpperCase() === data.name.trim().toUpperCase();
  });
 
  if (personDuplicate) {
    return response.status(409).json({
      error: `The person ${data.name} already exists in the phonebook.`,
    });
  }
*/

  // Create new person
  const newPerson = new Person({
    name: data.name,
    number: data.number,
  });

  // Save de person
  newPerson.save().then((result) => {
    console.log(`Person ${data.name} saved to the DB.`);
    response.json(result);
  });
});

/* PRIVATE FUNCTIONS */

const generateId = () => {
  let newId = Math.ceil(Math.random() * 10000000000);

  // Tries to find a person with that id
  while (
    persons.find((p) => {
      return Number(p.id) === newId;
    })
  ) {
    newId = Math.ceil(Math.random() * 10000000000);
  }

  return newId;
};

/* APP CONFIG */

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});
