# Chapter 7: Docker Compose Orchestration

In [Chapter 6: Docker Containerization](06_docker_containerization_.md), we learned how to package each individual part of our **AppDocker** project—the React Frontend, NodeJS API, Python API, and MySQL Database—into self-contained, isolated units called Docker Containers. Each container is like a neatly wrapped present, ready to run.

But imagine you have five different presents, and they all need to be opened, arranged, and connected in a specific way to work together as a single, amazing gift (our complete application!). How do you manage all of them efficiently? Manually starting each one with complex `docker run` commands and making sure they can talk to each other would be a huge headache!

### What Problem Does Docker Compose Orchestration Solve?

Our **AppDocker** project isn't just one application; it's a collection of several interconnected services:

*   The [React Frontend Application](01_react_frontend_application_.md) (running Nginx to serve it)
*   The [NodeJS Tasks API](02_nodejs_tasks_api_.md)
*   The [Python Users & Dashboard API](03_python_users___dashboard_api_.md)
*   The [MySQL Database](04_mysql_database_.md)
*   And for easy database management, phpMyAdmin

Each of these needs to:
*   Be built (if it's a custom application).
*   Be started in a specific order (e.g., database before APIs).
*   Have its ports correctly mapped.
*   Be able to find and communicate with other services (e.g., NodeJS API needs to connect to MySQL).
*   Receive specific configuration settings (like database host, username, password).

**Docker Compose** is the powerful tool that solves all these problems. Think of it as the **conductor for our application's orchestra**. With a single instruction, it reads a special script (`docker-compose.yml`) and then automatically handles:
*   Starting all the right "musicians" (containers).
*   Making sure they know when to start.
*   Setting up the stage (network) so they can communicate.
*   Giving them their individual instructions (environment variables).

This means you can bring up our entire `Task Manager` application stack—frontend, two backend APIs, database, and phpMyAdmin—with just *one simple command*!

### Key Concepts

Let's break down the essential ideas behind Docker Compose:

#### 1. Docker Compose: The Conductor

**Docker Compose** is a tool for defining and running multi-container Docker applications. It allows you to configure your entire application stack in a single file and then manage it with simple commands.

*   **Analogy**: You're building a city. Instead of individually constructing each house, road, and power line, Docker Compose is your city planner. You give it a master plan (the `docker-compose.yml` file), and it handles all the construction and infrastructure setup for you.

#### 2. `docker-compose.yml`: The Master Plan

This is the central configuration file (written in YAML format) where you define all the services, networks, and volumes for your application. It's the "sheet music" that the Docker Compose conductor reads to know how to orchestrate everything.

*   **Analogy**: The detailed blueprints for our city. It specifies exactly what buildings go where, how they connect to utilities, and what resources they share.

#### 3. Services: Individual Application Components

In a `docker-compose.yml` file, each independent part of your application (like our `node-api`, `python-api`, `frontend`, `mysql`, `phpmyadmin`) is called a **service**.

*   **Analogy**: Each building in our city plan – a "house" service, a "school" service, a "hospital" service. Each has a specific purpose.

#### 4. Networks: How Services Talk

Docker Compose automatically creates a virtual network for all your services. This allows containers to communicate with each other using their service names (e.g., `node-api` can talk to `mysql` by simply addressing it as `mysql`).

*   **Analogy**: The roads and communication lines within our city. They allow people (data) to travel between buildings (services).

#### 5. Volumes: Keeping Data Safe

We learned about volumes in [Chapter 4: MySQL Database](04_mysql_database_.md). Docker Compose also manages these, ensuring that important data (like our database content) persists even if containers are stopped or removed.

*   **Analogy**: Designated storage facilities in our city that keep valuable goods safe, even if a building needs to be rebuilt.

### How to Orchestrate Our AppDocker Project

The heart of Docker Compose orchestration is the `docker-compose.yml` file. This single file defines how all our individual Docker containers (`mysql`, `phpmyadmin`, `node-api`, `python-api`, `frontend`) are built, configured, and linked together.

Let's look at the `docker-compose.yml` file located at `Lab7/docker-compose.yml` and break down its key parts.

#### Running the Entire Application Stack

To bring up our entire application, you just need to be in the root directory of your project (where `docker-compose.yml` is) and run one command:

```bash
docker compose up --build -d
```
**Explanation:**
*   **`docker compose up`**: This is the main command that tells Docker Compose to read the `docker-compose.yml` file and start all the services defined within it.
*   **`--build`**: This flag ensures that Docker Compose rebuilds the images for any services that have a `build` instruction (like our `node-api`, `python-api`, and `frontend`) if their `Dockerfile` or source code has changed.
*   **`-d`**: This flag runs the containers in "detached" mode, meaning they run in the background, freeing up your terminal.

After running this command, Docker Compose will:
1.  Read `docker-compose.yml`.
2.  Build images for `node-api`, `python-api`, `frontend` using their respective `Dockerfile`s.
3.  Pull images for `mysql` and `phpmyadmin` from Docker Hub.
4.  Create a virtual network for all services.
5.  Start the `mysql` container first (because others depend on it) and ensure it's healthy.
6.  Start `phpmyadmin`, `node-api`, and `python-api` containers, connecting them to `mysql`.
7.  Start the `frontend` container, connecting it to `node-api` and `python-api`.
8.  Map the frontend's port 80 to your host machine's port 80.

Then, you can open your web browser and go to `http://localhost` to see the complete **AppDocker** application running!

To stop and remove all services:
```bash
docker compose down
```

#### Under the Hood: The Orchestration Flow

When you run `docker compose up --build -d`, here's a simplified sequence of what Docker Compose does:

```mermaid
sequenceDiagram
    participant You
    participant Docker Compose
    participant Docker Engine
    participant MySQL Service
    participant NodeJS API Service
    participant Python API Service
    participant Frontend Service

    You->>Docker Compose: `docker compose up --build -d`
    Docker Compose->>Docker Compose: Reads `docker-compose.yml`
    Docker Compose->>Docker Engine: Requests to build/pull images
    Docker Engine-->>Docker Compose: Images built/ready
    Docker Compose->>Docker Engine: Starts MySQL (waits for healthcheck)
    Docker Engine-->>MySQL Service: MySQL Container is up and healthy
    Docker Compose->>Docker Engine: Starts NodeJS API (depends on MySQL)
    Docker Engine-->>NodeJS API Service: NodeJS API Container is up
    Docker Compose->>Docker Engine: Starts Python API (depends on MySQL)
    Docker Engine-->>Python API Service: Python API Container is up
    Docker Compose->>Docker Engine: Starts Frontend (depends on APIs)
    Docker Engine-->>Frontend Service: Frontend Container is up (ports mapped)
    You->>Frontend Service: Access application at `http://localhost`
```

#### Breaking Down the `docker-compose.yml` File

Let's look at the definition of each service in `Lab7/docker-compose.yml`.

##### 1. MySQL Database Service

```yaml
  mysql:
    image: mysql:8 # Use the official MySQL 8 image
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: appdb
    volumes:
      - mysql_data:/var/lib/mysql # Persistent data storage
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql # Initial schema & data
    healthcheck: # Ensure DB is truly ready before other services connect
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 5s
      retries: 10
```
**Explanation:**
*   **`image: mysql:8`**: We use a pre-built official Docker image for MySQL version 8.
*   **`environment`**: Sets essential variables for MySQL setup (root password, database name).
*   **`volumes`**:
    *   `mysql_data:/var/lib/mysql`: Stores database files persistently in a Docker volume named `mysql_data`.
    *   `./init.sql:/docker-entrypoint-initdb.d/init.sql`: Copies our [Database Schema & Seeding](05_database_schema___seeding_.md) script to be run automatically.
*   **`healthcheck`**: This is a powerful feature! It tells Docker Compose to periodically check if MySQL is actually ready to accept connections, not just running. This prevents our APIs from trying to connect to a database that isn't fully initialized.

##### 2. phpMyAdmin Service

```yaml
  phpmyadmin:
    image: phpmyadmin/phpmyadmin # Use the official phpMyAdmin image
    ports:
      - "8080:80" # Map host port 8080 to container port 80
    environment:
      PMA_HOST: mysql # Tell phpMyAdmin to connect to the 'mysql' service
    depends_on:
      mysql:
        condition: service_healthy # Only start if 'mysql' is healthy
```
**Explanation:**
*   **`image: phpmyadmin/phpmyadmin`**: Another pre-built official image for phpMyAdmin.
*   **`ports: - "8080:80"`**: Makes phpMyAdmin accessible from your web browser at `http://localhost:8080`.
*   **`environment: PMA_HOST: mysql`**: This is crucial for networking! Instead of an IP address, we use `mysql` as the hostname. Docker Compose's networking magic ensures that `mysql` resolves to the IP address of our `mysql` service within the Docker network.
*   **`depends_on`**: Ensures that `phpmyadmin` will only start *after* the `mysql` service is running and passes its `healthcheck`. This prevents connection errors on startup.

##### 3. NodeJS Tasks API Service

```yaml
  node-api:
    build: ./node-api # Build the image using the Dockerfile in ./node-api
    environment:
      DB_HOST: mysql # Inject 'mysql' as the database host for the NodeJS app
    depends_on:
      mysql:
        condition: service_healthy # Only start if 'mysql' is healthy
```
**Explanation:**
*   **`build: ./node-api`**: Docker Compose will look for a `Dockerfile` in the `node-api` folder and build an image for this service.
*   **`environment: DB_HOST: mysql`**: This sets an environment variable `DB_HOST` inside the `node-api` container to `mysql`. Our [NodeJS Tasks API](02_nodejs_tasks_api_.md) is configured to read this variable to find its database.
*   **`depends_on`**: Ensures that `node-api` starts only after `mysql` is healthy.

##### 4. Python Users & Dashboard API Service

```yaml
  python-api:
    build: ./python-api # Build the image using the Dockerfile in ./python-api
    environment:
      DATABASE_URL: mysql+pymysql://root:root@mysql/appdb # Full DB connection string
    depends_on:
      mysql:
        condition: service_healthy # Only start if 'mysql' is healthy
```
**Explanation:**
*   **`build: ./python-api`**: Builds the image using the `Dockerfile` in the `python-api` folder.
*   **`environment: DATABASE_URL: ...`**: Sets a `DATABASE_URL` environment variable for the Python API, including the `mysql` service name as the host.
*   **`depends_on`**: Ensures `python-api` starts only after `mysql` is healthy.

##### 5. Frontend (React + Nginx) Service

```yaml
  frontend:
    build: ./frontend # Build the image using the Dockerfile in ./frontend
    ports:
      - "80:80" # Map host port 80 to container port 80 (where Nginx serves)
    depends_on:
      - node-api # Frontend needs NodeJS API to be running
      - python-api # Frontend needs Python API to be running
```
**Explanation:**
*   **`build: ./frontend`**: Builds the React application's image using the `Dockerfile` in the `frontend` folder (which includes Nginx).
*   **`ports: - "80:80"`**: This is how you access our application! It maps the web server's port 80 *inside* the `frontend` container to port 80 on your host machine. So, when you go to `http://localhost`, your browser is connecting to this container.
*   **`depends_on`**: Ensures the frontend container starts *after* both the `node-api` and `python-api` services are running, as the frontend will immediately try to make requests to them.

##### 6. Volumes Definition

```yaml
volumes:
  mysql_data: # Define the named volume for MySQL data persistence
```
**Explanation:**
*   This section defines the Docker volumes used by the services. `mysql_data` is a "named volume" managed by Docker, ensuring that the database data persists across container restarts or removals.

### Conclusion

In this chapter, we brought all the pieces of our **AppDocker** project together using **Docker Compose Orchestration**. You learned that Docker Compose acts as a conductor, managing the entire symphony of our application's containers through a single `docker-compose.yml` file. We explored how to define services, connect them using a virtual network, manage data persistence with volumes, and ensure services start in the correct order with `depends_on` and `healthcheck`. Now, with just `docker compose up`, our entire multi-service application springs to life, robust and interconnected!

While Docker Compose handles the internal networking between our services, we often need a more sophisticated way for the *outside world* (your browser) to access and route requests to different parts of our application. This is where **Nginx Reverse Proxy** comes in, which we'll explore in the next chapter.

[Next Chapter: Nginx Reverse Proxy](08_nginx_reverse_proxy_.md)

---

<sub><sup>Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge).</sup></sub> <sub><sup>**References**: [[1]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab3/docker-compose-db.yml), [[2]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab4/docker-compose-db.yml), [[3]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab6/docker-compose.yml), [[4]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab7/docker-compose.yml), [[5]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Notes.md)</sup></sub>