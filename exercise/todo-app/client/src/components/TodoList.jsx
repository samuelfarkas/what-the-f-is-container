import React from "react";

function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>
          <span>{todo.title}</span>
          <span>{todo.completed ? " (Completed)" : ""}</span>
        </li>
      ))}
    </ul>
  );
}

export default TodoList;
