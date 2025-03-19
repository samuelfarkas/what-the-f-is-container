import React, { useState } from "react";

function AddTodo({ addTodo }) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        setIsSubmitting(true);
        await addTodo({ title });
        setTitle("");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-todo-form">
      <input
        type="text"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
        autoFocus
      />
      <button 
        type="submit" 
        disabled={!title.trim() || isSubmitting}
      >
        {isSubmitting ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}

export default AddTodo;
