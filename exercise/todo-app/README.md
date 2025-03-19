# Docker Todo App Example

This is a comprehensive Todo application built with React (client), Express (server), PostgreSQL (database), and Redis (caching) to demonstrate Docker containerization concepts and multi-service orchestration.

## Project Structure

- `client/`: React frontend built with Vite
- `server/`: Express backend API with PostgreSQL and Redis integration
- `postgres/`: PostgreSQL initialization scripts
- `docker-compose.yml`: Multi-container Docker configuration with 7 services:
  - **client**: React frontend
  - **server**: Express API backend
  - **postgres**: PostgreSQL database
  - **redis**: Redis cache
  - **pgadmin**: PostgreSQL admin interface
  - **redis-commander**: Redis admin interface
  - **dozzle**: Lightweight Docker logs viewer

## Prerequisites

- Docker and Docker Compose installed on your machine

## Running with Docker Compose

### Development Mode with Live Reloading

```bash
# Start the application with Docker's watch feature for development
docker compose watch

# This enables live reloading:
# - Changes to client code will refresh the browser
# - Changes to server code will restart the Node.js server
```

### Standard Mode

```bash
# Start the application
docker compose up

# Start in detached mode (background)
docker compose up -d

# View logs
docker compose logs -f

# Stop the application
docker compose down
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/todos
- API Status: http://localhost:3001/api/status
- PostgreSQL Admin (PGAdmin): http://localhost:8082
  - Email: admin@example.com
  - Password: admin
  - Add server connection with:
    - Host: postgres
    - Port: 5432
    - Database: tododb
    - Username: postgres
    - Password: postgres
- Redis Commander: http://localhost:8081
- Dozzle Logs Dashboard: http://localhost:8000
  - Extremely lightweight Docker logs viewer
  - No login required
  - Features:
    - Real-time log streaming
    - Filter by container name
    - Search within logs
    - Color-coded log levels
    - Dark/light mode toggle
    - Download logs

## Development Without Docker (don't)

For local development without Docker, you'll need to set up PostgreSQL and Redis locally, then use environment variables to connect to them.

### Client

```bash
cd client
pnpm install
pnpm dev
```

### Server

```bash
cd server
pnpm install

# Set environment variables for local development
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_DB=tododb
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export REDIS_URL=redis://localhost:6379
(or use dotenv package)
# Start the server
pnpm dev
```

### Required Local Services

You'll need to install and run:

- PostgreSQL database
- Redis cache server

Or, you can use Docker just for these services while developing locally:

```bash
# Run only the needed services
docker compose up redis postgres -d
```

## Docker Concepts Demonstrated

1. **Multi-stage builds** - Optimizing image size by using separate build and runtime stages
2. **Docker Compose** - Orchestrating multiple containers and services
3. **Docker Watch** - Live reloading and development enhancements with the `docker compose watch` feature
4. **Volume mounts** - For development hot-reloading and persistent data storage
5. **Environment variables** - Configuring services across containers
6. **Container networking** - Communication between multiple services
7. **Data persistence** - Using named volumes for databases and caches
8. **Multi-service architecture** - Connecting frontend, backend, database, and caching services
9. **Admin interfaces** - Using containerized admin tools for database and cache management
10. **Logging with Dozzle** - Easy log monitoring with a lightweight web interface
11. **Docker socket mounting** - Accessing the Docker API from within a container

## Docker Commands Reference

```bash
# Build all images
docker compose build

# Start specific service
docker compose up client

# Run with Docker Watch for live reloading during development
docker compose watch

# View running containers
docker compose ps

# Execute command in container
docker compose exec server sh

# View logs for specific service
docker compose logs -f client

# View logs for all services
docker compose logs -f

# View logs for database connection
docker compose logs -f server | grep "PostgreSQL\|Redis"

# Connect to PostgreSQL from server container
docker compose exec server sh -c "psql -h postgres -U postgres -d tododb"

# Connect to Redis CLI
docker compose exec redis redis-cli

# Stop and remove containers, networks
docker compose down

# Stop and remove containers, networks, volumes (CAUTION: destroys data)
docker compose down -v

# Check the health of services
docker compose ps

# Restart a specific service
docker compose restart server

# Scale a service (for services without mapped ports)
docker compose up -d --scale redis=2

# Tail PostgreSQL logs
docker compose logs -f postgres

```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [PGAdmin Documentation](https://www.pgadmin.org/docs/)
- [Redis Commander GitHub](https://github.com/joeferner/redis-commander)
- [Dozzle Documentation](https://dozzle.dev/)

## Architecture Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Client   │──────│  Express Server │──────│  PostgreSQL DB  │
│    (Vite)       │      │    (Node.js)    │      │   (persistence) │
│                 │      │                 │      │                 │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                                  │
                         ┌────────┴────────┐
                         │                 │
                         │  Redis Cache    │
                         │                 │
                         └─────────────────┘
                                  ▲
                                  │
      ┌─────────────────┐         │        ┌─────────────────┐
      │                 │         │        │                 │
      │  Redis Commander│─────────┘        │     PGAdmin     │
      │  (admin UI)     │                  │  (admin UI)     │
      │                 │                  │                 │
      └─────────────────┘                  └─────────────────┘


              Logging System
┌─────────────────────────────────────┐
│                                     │
│           ┌──────────────┐          │
│           │              │          │
│           │    Dozzle    │          │
│           │ (Log Viewer) │          │
│           │              │          │
│           └──────┬───────┘          │
│                  │                  │
└──────────────────┼──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│                                     │
│           Docker Socket             │
│         /var/run/docker.sock        │
│                                     │
└─────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│                                     │
│          Container Logs             │
│    (from all services via stdout)   │
│                                     │
└─────────────────────────────────────┘
```
