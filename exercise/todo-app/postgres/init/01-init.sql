-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some initial todo items
INSERT INTO todos (title, completed) VALUES
    ('Learn Docker basics', true),
    ('Create a Dockerfile', false),
    ('Build a Docker image', false),
    ('Set up docker-compose', false),
    ('Connect to PostgreSQL database', false),
    ('Implement Redis caching', false),
