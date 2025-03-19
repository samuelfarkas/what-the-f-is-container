# What the F is Container?

Welcome to the Docker workshop! This guide will help you prepare your environment so you're ready to follow along with the exercises.

## Prerequisites

Before attending the workshop, please ensure you have the following installed on your machine:

### 1. Docker Desktop / Docker Engine

- **For Windows & macOS**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **For Linux**: Install [Docker Engine](https://docs.docker.com/engine/install/)

#### Minimum Requirements:

- **Windows**: Windows 10 64-bit or newer with WSL2 enabled
- **macOS**: macOS 10.15 or newer
- **Linux**: A supported distribution (Ubuntu, Debian, Fedora, etc.)
- **RAM**: At least 4GB (8GB recommended)
- **Disk Space**: At least 10GB free

## Verifying Your Installation

After installing Docker, please verify it's working correctly:

1. Open a terminal/command prompt
2. Run the following command:

```bash
docker --version
```

You should see output like: `Docker version 28.0.1, build 068a01e`

3. Now verify Docker is running by executing:

```bash
docker run --rm hello-world
```

You should see a message starting with: "Hello from Docker!"

If either command fails, please check that:

- Docker Desktop is running (for Windows and macOS)
- Your user has permission to run Docker commands (for Linux, your user should be in the 'docker' group)

## Getting the Workshop Materials

1. Clone this repository:

```bash
git clone https://github.com/samuelfarkas/what-the-f-is-container.git
cd what-the-f-is-container
```

## Troubleshooting

### Common Issues

1. **Docker Desktop not starting**

   - On Windows: Make sure WSL2 is properly installed and enabled
   - On macOS: Check system preferences for any security blocks

2. **Permission denied**

   - On Linux: You may need to add your user to the 'docker' group:
     ```bash
     sudo usermod -aG docker $USER
     # Then log out and back in
     ```

3. **Not enough disk space**
   - Free up at least 10GB of space for Docker images and containers

## What to Expect

During the workshop, we'll:

1. Learn Docker fundamentals and core concepts
2. Build and run containers from Dockerfiles
3. Use Docker Compose to manage multi-container applications
4. Follow best practices for containerizing applications

We'll be working with a full-stack Todo application that includes:

- React frontend
- Node.js Express backend
- PostgreSQL database
