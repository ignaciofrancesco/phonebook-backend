const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

/* MIDDLEWARE */

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

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

/* ENDPOINTS */

app.get("/", (request, response) => {
  response.send("<h1>Phonebook</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people.</p><p>${request.timeReceived}</p>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  // Look for the person
  const personId = request.params.id;
  const person = persons.find((p) => {
    return p.id === personId;
  });

  // If the person doesn't exist, return error
  if (!person) {
    return response.status(404).json({ error: "The person cannot be found." });
  }

  // Else, return data
  response.json(person);
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
  const personDuplicate = persons.find((p) => {
    return p.name.trim().toUpperCase() === data.name.trim().toUpperCase();
  });

  if (personDuplicate) {
    return response.status(409).json({
      error: `The person ${data.name} already exists in the phonebook.`,
    });
  }

  // Generate new id
  const newId = generateId();

  // Create new person
  const newPerson = {
    id: String(newId),
    name: data.name,
    number: data.number,
  };

  // Save new person
  persons = [...persons, newPerson];

  // Produce response
  response.json(newPerson);
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

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});
