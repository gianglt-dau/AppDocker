# Chapter 4: MySQL Database

In [Chapter 1: React Frontend Application](01_react_frontend_application_.md), you learned about the interactive interface. In [Chapter 2: NodeJS Tasks API](02_nodejs_tasks_api_.md), we explored the dedicated service for managing tasks. And in [Chapter 3: Python Users & Dashboard API](03_python_users___dashboard_api_.md), we discovered the service handling users and dashboard analytics.

Both the NodeJS Tasks API and the Python Users & Dashboard API are like busy workers in our application. They process requests, but where do they store all the important information? Where do the tasks, user details, and status updates actually live so they don't disappear when the services restart?

This is where the **MySQL Database** comes in. It's the central, organized storage unit for all our application's data.

### What Problem Does the MySQL Database Solve?

Imagine our `Task Manager` application as a company.
*   The React Frontend is the front office, where customers (users) interact.
*   The NodeJS Tasks API is the "Tasks Department."
*   The Python Users & Dashboard API is the "HR & Reporting Department."

These departments constantly handle information: new tasks are created, users sign up, tasks are marked as complete. If they just wrote this information on sticky notes, it would quickly get lost or become disorganized.

The **MySQL Database** is like the company's ultra-organized, secure, and always-available digital filing cabinet.

*   **Persistence**: If our "Tasks Department" (NodeJS API) shuts down for maintenance, we don't want all the tasks to vanish! The database ensures data is saved permanently.
*   **Consistency**: Both the "Tasks Department" and "HR Department" might need to know about users (e.g., who is assigned a task). The database ensures they both access the *same, up-to-date* information.
*   **Reliability**: It provides a structured way to store, retrieve, update, and delete information reliably, making sure no data gets corrupted or lost.

Without a database, our application wouldn't remember any tasks or users after a restart, making it completely useless!

### Key Concepts

Let's break down what a MySQL Database is and how it works:

#### 1. What is a Database?

At its simplest, a **database** is an organized collection of information. Think of it like a digital version of a library or a phone book. It's designed to store, manage, and retrieve large amounts of data efficiently.

#### 2. What is MySQL?

**MySQL** is one of the world's most popular **Relational Database Management Systems (RDBMS)**.
*   **Relational**: This means data is organized into structured tables (like spreadsheets) that can be related to each other.
*   **Database Management System (DBMS)**: It's the software that allows you to interact with the database – create new databases, manage tables, and store/retrieve data.

#### 3. Tables, Rows, and Columns

The fundamental way MySQL stores data is in **tables**. Each table is like a spreadsheet with:

*   **Columns (Fields)**: These define the type of information stored. For example, in a `users` table, you might have columns for `id`, `name`, `email`, and `role`.
*   **Rows (Records)**: Each row represents a single entry or item. In the `users` table, each row would be a unique user.

Here's an example of how data might look inside our `appdb` database:

| Table: `users`                                               |
| :----------------------------------------------------------- |
| **id** (INT) | **name** (VARCHAR) | **email** (VARCHAR)     | **role** (VARCHAR) |
| 1            | Nguyễn Văn A     | nguyenvana@email.com    | admin              |
| 2            | Trần Thị B       | tranthib@email.com      | manager            |
| 3            | Lê Văn C         | levanc@email.com        | member             |

| Table: `tasks`                                               |
| :----------------------------------------------------------- |
| **id** (INT) | **title** (VARCHAR)               | **status** (VARCHAR) | **assigned_to** (INT) |
| 1            | Thiết kế giao diện Dashboard | done                 | 1                     |
| 2            | Viết API quản lý Users        | done                 | 2                     |
| 3            | Tích hợp Database MySQL      | in_progress          | 1                     |

Notice how `assigned_to` in the `tasks` table points to the `id` in the `users` table. This is a "relationship" that allows us to know *who* a task is assigned to!

#### 4. SQL: The Language of Databases

To talk to a MySQL database, we use a special language called **SQL** (Structured Query Language). It's used to:
*   **CREATE** tables and databases.
*   **READ** (select) data.
*   **UPDATE** existing data.
*   **DELETE** data.

These correspond directly to the **CRUD** operations we discussed in previous chapters! Our NodeJS and Python APIs use SQL (or tools that generate SQL) to perform these actions.

### How Our APIs Interact with the MySQL Database

Both our [NodeJS Tasks API](02_nodejs_tasks_api_.md) and [Python Users & Dashboard API](03_python_users___dashboard_api_.md) need to talk to the database. They act as "translators" between the React frontend and the raw data in MySQL.

*   When the React frontend asks the **NodeJS Tasks API** for a list of tasks, the NodeJS API sends a SQL `SELECT` command to MySQL, retrieves the tasks, and sends them back to React.
*   When the React frontend asks the **Python Users & Dashboard API** for user information or dashboard statistics, the Python API sends appropriate SQL commands to MySQL (e.g., `SELECT * FROM users`, `COUNT` tasks by status), processes the results, and sends them back.

### Under the Hood: The Database's Workflow

Let's trace how the [NodeJS Tasks API](02_nodejs_tasks_api_.md) gets tasks from MySQL, which is a very similar flow to how the Python API would get users.

```mermaid
sequenceDiagram
    participant React App
    participant NodeJS Tasks API
    participant MySQL Database

    React App->>NodeJS Tasks API: GET /api-node/tasks (Request tasks list)
    NodeJS Tasks API->>MySQL Database: SQL Query: SELECT * FROM tasks (Ask for tasks)
    Note over NodeJS Tasks API: Translates request into SQL
    MySQL Database-->>NodeJS Tasks API: Sends task records
    NodeJS Tasks API-->>React App: Sends task list (JSON format)
    React App->>React App: Displays tasks on screen
```

**Step-by-Step Explanation:**

1.  **React App requests tasks**: When your `Task Manager` loads or you refresh the task list, the React frontend sends a `GET` request to the NodeJS Tasks API.
2.  **NodeJS Tasks API processes request**: The NodeJS API receives this request. It knows it needs to fetch task data.
3.  **NodeJS Tasks API queries MySQL**: The NodeJS API then translates this request into a SQL query, like `SELECT * FROM tasks`, and sends it to the MySQL Database.
4.  **MySQL Database executes query**: The MySQL Database receives the SQL query, finds all the relevant task records in its `tasks` table, and sends them back to the NodeJS API.
5.  **NodeJS Tasks API responds to React App**: The NodeJS API receives the task data from MySQL, formats it into JSON, and sends this JSON data back to the waiting React frontend.
6.  **React App displays tasks**: The React app receives the JSON data and updates the user interface to show the tasks.

### Core Configuration and Files

To get our MySQL Database running and connected to our APIs, we use a few key files:

#### 1. `docker-compose.yml` (MySQL Service Definition)

This file, which orchestrates our entire application, includes a section to define our `mysql` service. This tells Docker how to set up and run the MySQL database.

```yaml
  # ==================== DATABASE ====================
  mysql:
    image: mysql:8 # 1. Use the official MySQL 8 image
    environment:
      MYSQL_ROOT_PASSWORD: root # 2. Set the root password
      MYSQL_DATABASE: appdb     # 3. Create a database named 'appdb'
    volumes:
      - mysql_data:/var/lib/mysql # 4. Store actual data persistently
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql # 5. Run this script on startup
    healthcheck: # 6. Check if MySQL is really ready
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 5s
      retries: 10
```
**Explanation:**
1.  **`image: mysql:8`**: We tell Docker to download and use the official MySQL version 8 software.
2.  **`MYSQL_ROOT_PASSWORD: root`**: This environment variable sets the password for the `root` user in MySQL.
3.  **`MYSQL_DATABASE: appdb`**: This tells MySQL to automatically create a database named `appdb` when it starts. This is where all our application's tables (users, tasks) will live.
4.  **`volumes: - mysql_data:/var/lib/mysql`**: This is crucial for *persistence*. It means all the data created inside the MySQL container will be stored in a special Docker volume named `mysql_data` on your computer. If you stop and restart the container, your data will still be there!
5.  **`volumes: - ./init.sql:/docker-entrypoint-initdb.d/init.sql`**: This tells Docker to copy our `init.sql` file (which contains commands to create tables and insert initial data) into a special directory inside the MySQL container. MySQL automatically runs any `.sql` files found here when it first starts up, setting up our database for us.
6.  **`healthcheck`**: This helps Docker (and other services like our APIs) know when the MySQL database is fully up and ready to accept connections, preventing our APIs from trying to connect too early.

#### 2. `init.sql` (Database Schema and Seed Data)

This SQL script is run automatically by MySQL when its Docker container first starts up (thanks to the `volumes` setting above). It creates the necessary tables for our application and populates them with some initial data. We'll explore this in much more detail in the next chapter.

```sql
-- Create the 'users' table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member'
);

-- Create the 'tasks' table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to INT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample users
INSERT INTO users (name, email, role) VALUES
('Nguyễn Văn A', 'nguyenvana@email.com', 'admin'),
('Trần Thị B', 'tranthib@email.com', 'manager');

-- Insert sample tasks
INSERT INTO tasks (title, status, assigned_to) VALUES
('Thiết kế giao diện Dashboard', 'done', 1),
('Viết API quản lý Users', 'done', 2);
```
**Explanation:**
-   **`CREATE TABLE IF NOT EXISTS ...`**: These commands define the structure of our `users` and `tasks` tables, specifying column names (like `id`, `name`, `title`), their data types (like `INT` for numbers, `VARCHAR(255)` for text up to 255 characters), and rules (like `PRIMARY KEY`, `NOT NULL`, `DEFAULT`, `FOREIGN KEY`).
-   **`INSERT INTO ... VALUES ...`**: These commands add initial sample data into our newly created tables. This is often called "seeding" the database.

#### 3. Connecting from NodeJS (`node-api/app.js`)

Our NodeJS Tasks API uses the `mysql2` library to connect to the database.

```javascript
const mysql = require('mysql2/promise'); // 1. Import MySQL client

let db;
async function connectDB() {
    // 2. Try to connect to MySQL
    db = await mysql.createConnection({
        host: process.env.DB_HOST || "127.0.0.1", // 3. Get host from environment (Docker) or use local
        user: "root",
        password: "root",
        database: "appdb"
    });
    console.log("✅ MySQL Connected!");
}

// ... later, in an API route ...
app.get('/api-node/tasks', async (req, res) => {
    const [rows] = await db.query("SELECT * FROM tasks ORDER BY id DESC"); // 4. Execute a SQL query
    res.json(rows);
});

connectDB().then(() => { // 5. Connect to DB before starting the server
    app.listen(3000, () => console.log("🚀 NodeJS Tasks API running on port 3000"));
});
```
**Explanation:**
1.  We import the `mysql2` library.
2.  The `connectDB` function attempts to establish a connection to MySQL.
3.  **`host: process.env.DB_HOST || "127.0.0.1"`**: This is crucial. When running inside Docker Compose, `DB_HOST` will be set to `mysql` (the name of our MySQL service in `docker-compose.yml`), allowing the NodeJS API to find the database. When running locally outside Docker, it falls back to `127.0.0.1` (localhost).
4.  **`await db.query(...)`**: This is how the API sends SQL commands to MySQL and waits for a response.
5.  We ensure the database connection is established *before* our NodeJS API starts listening for requests.

#### 4. Connecting from Python (`python-api/main.py`)

Our Python Users & Dashboard API uses `SQLAlchemy` (an Object-Relational Mapper or ORM) and `pymysql` to connect.

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# 1. Get database URL from environment (Docker) or use local
DATABASE_URL = os.environ.get("DATABASE_URL", "mysql+pymysql://root:root@127.0.0.1/appdb")

engine = None
SessionLocal = None

def connect_db():
    global engine, SessionLocal
    # 2. Establish connection using SQLAlchemy
    engine = create_engine(DATABASE_URL)
    engine.connect() # Test the connection
    SessionLocal = sessionmaker(bind=engine)
    print("✅ MySQL Connected!")

connect_db() # Connect to the database when the API starts

Base = declarative_base() # Used for defining database models

class User(Base): # 3. Define a Python object that maps to the 'users' table
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    email = Column(String(255))

# ... later, in an API route ...
@app.get("/api-python/users")
def get_users():
    db = SessionLocal()
    users = db.query(User).all() # 4. Query for users using the Python model
    db.close()
    return users
```
**Explanation:**
1.  **`DATABASE_URL = os.environ.get("DATABASE_URL", ...)`**: Similar to NodeJS, this gets the database connection string from an environment variable (`DATABASE_URL`). When running in Docker, `mysql` is used as the host. Locally, it falls back to `127.0.0.1`.
2.  **`engine = create_engine(DATABASE_URL)`**: SQLAlchemy uses an "engine" to manage the connection to the database.
3.  **`class User(Base): ...`**: This defines a Python class that acts as a blueprint for our `users` table. This is an ORM concept – it lets us work with database rows as Python objects, which is often easier than writing raw SQL.
4.  **`db.query(User).all()`**: This is how the Python API queries for data. SQLAlchemy translates this into the appropriate SQL behind the scenes.

Both APIs connect to the *same* `mysql` service defined in `docker-compose.yml`, acting as a central data hub for our entire application.

### Conclusion

In this chapter, we uncovered the critical role of the **MySQL Database** as the central, persistent storage for our **AppDocker** project. You learned that it's like an organized digital filing cabinet, storing all our task and user data in structured tables using SQL. We also saw how our NodeJS and Python APIs connect to and interact with this database, ensuring data persistence and consistency across all services.

Now that we understand what the database is and why it's important, the next chapter will dive deeper into *how* we specifically structure our database tables and populate them with initial data through **Database Schema & Seeding**.

[Next Chapter: Database Schema & Seeding](05_database_schema___seeding_.md)

---

<sub><sup>Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge).</sup></sub> <sub><sup>**References**: [[1]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab3/init.sql), [[2]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab4/docker-compose-db.yml), [[3]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab6/docker-compose.yml), [[4]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab7/docker-compose.yml), [[5]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab7/init.sql), [[6]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab7/node-api/app.js), [[7]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab7/python-api/main.py), [[8]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Notes.md)</sup></sub>