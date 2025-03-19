import { useState, useEffect } from "react";
import TodoList from "./components/TodoList";
import AddTodo from "./components/AddTodo";
import ConnectionStatus from "./components/ConnectionStatus";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/todos`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setError("Failed to load todos. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (todo) => {
    try {
      const response = await fetch(`${API_URL}/api/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTodos([...todos, data]);
    } catch (error) {
      console.error("Error adding todo:", error);
      setError("Failed to add todo. Please try again.");
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedTodo = await response.json();

      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));

      setError(null);
    } catch (error) {
      console.error("Error updating todo:", error);
      setError("Failed to update todo status. Please try again.");
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setTodos(todos.filter((todo) => todo.id !== id));
      setError(null);
    } catch (error) {
      console.error("Error deleting todo:", error);
      setError("Failed to delete todo. Please try again.");
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>What to do?</h1>
        <p>Containerized with Docker</p>
      </header>

      <main>
        <AddTodo addTodo={addTodo} />

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading todos...</div>
        ) : (
          !error && (
            <TodoList
              todos={todos}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
            />
          )
        )}

        <ConnectionStatus apiUrl={API_URL} />
      </main>

      <footer>
        <p>Full-stack workshop | Docker | OMNETIC</p>
      </footer>
    </div>
  );
}

export default App;
