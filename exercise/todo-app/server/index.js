const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors());

// Middleware
app.use(express.json());

// Sample in-memory todos (replace with Redis and PostgreSQL integration)
let todos = [
  { id: 1, title: "Buy groceries", completed: false },
  { id: 2, title: "Walk the dog", completed: true },
];

// Routes
app.get("/api/todos", (req, res) => {
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const newTodo = {
    id: todos.length + 1,
    title: req.body.title,
    completed: false,
  };
  todos.push(newTodo);
  res.json(newTodo);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
