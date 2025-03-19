import React from "react";

function TodoList({ todos, toggleTodo, deleteTodo }) {
  if (todos.length === 0) {
    return <div className="empty-list">No todos yet. Add one above!</div>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id} className={todo.completed ? "completed" : ""}>
          <div className="todo-item">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id, !todo.completed)}
              className="todo-checkbox"
            />
            <span className="todo-title">{todo.title}</span>
          </div>
          <div className="todo-actions">
            <span className="status-badge">
              {todo.completed ? "Completed" : "Pending"}
            </span>
            <button 
              onClick={() => deleteTodo(todo.id)} 
              className="delete-btn"
              aria-label="Delete todo"
            >
              ✕
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default TodoList;
