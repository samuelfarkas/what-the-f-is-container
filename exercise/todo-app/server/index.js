const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { createClient } = require("redis");
const dotenv = require("dotenv");

// Load environment variables from .env file if present
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// PostgreSQL connection
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || "tododb",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
});

// Redis connection
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Redis connection error:", err);
    // Continue running even if Redis is not available
    console.log("API will continue without Redis caching");
  }
})();

// Check if Redis is connected
const isRedisConnected = () => {
  return redisClient.isReady;
};

// Database connection test
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("PostgreSQL connection error:", err);
  } else {
    console.log("Connected to PostgreSQL at:", res.rows[0].now);
    // Initialize database tables if needed
    initializeDatabase();
  }
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // This is a backup initialization if the init SQL script doesn't work
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Check if we have data
    const result = await pool.query("SELECT COUNT(*) FROM todos");
    if (parseInt(result.rows[0].count) === 0) {
      console.log("Initializing todos table with sample data");
      await pool.query(`
        INSERT INTO todos (title, completed) VALUES
          ('Learn Docker basics', true),
          ('Create a Dockerfile', true),
          ('Build a Docker image', false),
          ('Set up docker-compose', false),
          ('Connect to PostgreSQL database', false),
          ('Implement Redis caching', false),
          ('Deploy containerized app', false);
      `);
    }
  } catch (err) {
    console.error("Database initialization error:", err);
  }
};

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Todo API",
    database: "PostgreSQL",
    cache: isRedisConnected() ? "Redis" : "Disabled",
    endpoints: [
      { method: "GET", path: "/api/todos", description: "Get all todos" },
      { method: "GET", path: "/api/todos/:id", description: "Get a todo by ID" },
      { method: "POST", path: "/api/todos", description: "Create a new todo" },
      { method: "PATCH", path: "/api/todos/:id", description: "Update a todo" },
      { method: "DELETE", path: "/api/todos/:id", description: "Delete a todo" },
      { method: "GET", path: "/api/status", description: "Get API status" }
    ]
  });
});

// API status route
app.get("/api/status", async (req, res) => {
  try {
    // Check PostgreSQL connection
    const dbResult = await pool.query("SELECT 1 as check");
    const dbConnected = dbResult.rows[0].check === 1;
    
    // Get cache stats if Redis is connected
    let cacheStats = null;
    if (isRedisConnected()) {
      const info = await redisClient.info();
      cacheStats = {
        connected: true,
        version: info.split("\n").find(line => line.startsWith("redis_version"))?.split(":")[1] || "unknown"
      };
    }
    
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        type: "PostgreSQL"
      },
      cache: isRedisConnected() 
        ? cacheStats 
        : { connected: false, message: "Redis not connected" }
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Get all todos
app.get("/api/todos", async (req, res) => {
  try {
    // Try to get todos from cache first
    if (isRedisConnected()) {
      const cachedTodos = await redisClient.get("todos");
      if (cachedTodos) {
        console.log("Cache hit: returning todos from Redis");
        return res.json(JSON.parse(cachedTodos));
      }
    }

    // No cache hit, get from database
    console.log("Cache miss: fetching todos from PostgreSQL");
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY created_at DESC"
    );
    
    // Store in cache for next request
    if (isRedisConnected()) {
      await redisClient.set("todos", JSON.stringify(result.rows), {
        EX: 60 // Cache for 60 seconds
      });
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ message: "Error fetching todos" });
  }
});

// Get todo by ID
app.get("/api/todos/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    // Try to get todo from cache first
    if (isRedisConnected()) {
      const cachedTodo = await redisClient.get(`todo:${id}`);
      if (cachedTodo) {
        console.log(`Cache hit: returning todo ${id} from Redis`);
        return res.json(JSON.parse(cachedTodo));
      }
    }
    
    // No cache hit, get from database
    const result = await pool.query(
      "SELECT * FROM todos WHERE id = $1",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }
    
    // Store in cache for next request
    if (isRedisConnected()) {
      await redisClient.set(`todo:${id}`, JSON.stringify(result.rows[0]), {
        EX: 60 // Cache for 60 seconds
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching todo ${id}:`, error);
    res.status(500).json({ message: "Error fetching todo" });
  }
});

// Create a new todo
app.post("/api/todos", async (req, res) => {
  const { title } = req.body;
  
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }
  
  try {
    const result = await pool.query(
      "INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *",
      [title.trim(), false]
    );
    
    const newTodo = result.rows[0];
    
    // Invalidate todos cache
    if (isRedisConnected()) {
      await redisClient.del("todos");
    }
    
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ message: "Error creating todo" });
  }
});

// Update a todo
app.patch("/api/todos/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, completed } = req.body;
  
  try {
    // First check if todo exists
    const checkResult = await pool.query(
      "SELECT * FROM todos WHERE id = $1",
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }
    
    // Build the update query dynamically based on provided fields
    let updateFields = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      queryParams.push(title);
    }
    
    if (completed !== undefined) {
      updateFields.push(`completed = $${paramIndex++}`);
      queryParams.push(completed);
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add the id as the last parameter
    queryParams.push(id);
    
    const query = `
      UPDATE todos 
      SET ${updateFields.join(", ")} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await pool.query(query, queryParams);
    
    // Invalidate caches
    if (isRedisConnected()) {
      await redisClient.del("todos");
      await redisClient.del(`todo:${id}`);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating todo ${id}:`, error);
    res.status(500).json({ message: "Error updating todo" });
  }
});

// Delete a todo
app.delete("/api/todos/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }
    
    // Invalidate caches
    if (isRedisConnected()) {
      await redisClient.del("todos");
      await redisClient.del(`todo:${id}`);
    }
    
    res.status(204).end();
  } catch (error) {
    console.error(`Error deleting todo ${id}:`, error);
    res.status(500).json({ message: "Error deleting todo" });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API is available at http://localhost:${port}/api/todos`);
  console.log(`PostgreSQL: ${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}`);
  console.log(`Redis: ${process.env.REDIS_URL}`);
});