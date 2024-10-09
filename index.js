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

/* ENDPOINTS */

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.send(
        `<p>Phonebook has info for ${persons.length} people.</p><p>${request.timeReceived}</p>`
      );
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  // Look for the person
  const personId = request.params.id;

  Person.findById(personId)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  // Get the id
  const personId = request.params.id;

  console.log(personId);

  Person.findByIdAndDelete(personId)
    .then((result) => {
      console.log(result);
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  // Get the person from the body
  const data = request.body;

  /* Validations */

  // Validate existence of properties
  if (!data.name || !data.number) {
    return response
      .status(400)
      .json({ error: "The name or the number are missing." });
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
  newPerson
    .save()
    .then((result) => {
      console.log(`Person ${data.name} saved to the DB.`);
      response.json(result);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const personId = request.params.id;
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(personId, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      console.log(updatedPerson);
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

/* MIDDLEWARE 2 */

const errorHandler = (error, request, response, next) => {
  console.log("JUST A TEST FOR ERRORS.");

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformed id." });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  // For other errors, forward to default express error handler
  next(error);
};
app.use(errorHandler);

/* APP CONFIG */

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});
