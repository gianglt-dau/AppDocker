# Chapter 3: Python Users & Dashboard API

In [Chapter 1: React Frontend Application](01_react_frontend_application_.md), we built the user interface you interact with. In [Chapter 2: NodeJS Tasks API](02_nodejs_tasks_api_.md), we learned about the backend service solely responsible for managing your tasks.

Now, imagine our application is growing. We don't just need to manage tasks; we also need to keep track of *who* is using the app (users!) and provide useful statistics (like how many tasks are pending, or who the busiest users are) in a "dashboard." This is where our **Python Users & Dashboard API** comes in.

### What Problem Does the Python Users & Dashboard API Solve?

Think of our Task Manager application as a small company.
*   The React Frontend is the visible office space where everyone works.
*   The NodeJS Tasks API is the "Task Management Department" – its only job is to handle tasks.

The **Python Users & Dashboard API** is like our company's dedicated "HR and Reporting Department."

*   **You need to add a new employee (user)?** This department handles all the paperwork (creating, storing user details).
*   **You want to see a list of all employees?** This department provides it.
*   **You need a report on company performance (dashboard statistics)?** This department gathers all the numbers and presents them.

This service focuses specifically on **managing "users"** (like adding new users, finding them, updating their info, or removing them) and **calculating analytical data for the "dashboard"** (e.g., total users, task distribution, top users). It's a separate, specialized service that helps keep our user data organized and provides valuable insights.

### Key Concepts

Let's explore the core ideas behind this "HR and Reporting" service:

#### 1. Python: A Friendly Programming Language

You might be familiar with Python as a language used for data science, web development, or scripting. It's known for its readability and simplicity. For our backend, using Python gives us another powerful tool in our toolbox.

*   **Analogy**: If JavaScript is a versatile screwdriver, Python is like a powerful wrench. Both are tools, but they excel in different situations. Using Python for this service allows us to leverage its strengths, just as we used Node.js for tasks.

#### 2. FastAPI: Building Python APIs Quickly

Just as Express.js makes building Node.js APIs easy, **FastAPI** is a modern, high-performance web framework for building APIs with Python. It's designed for speed and simplicity.

*   **Analogy**: If Python is our wrench, FastAPI is the specialized workbench and toolset that helps us use that wrench very efficiently to build sturdy API connections.

#### 3. CRUD Operations for Users

We encountered CRUD (Create, Read, Update, Delete) in [Chapter 2: NodeJS Tasks API](02_nodejs_tasks_api_.md) for tasks. This Python API applies the same concept, but for our "users."

| Operation | Description                                             | User Manager Example                                          |
| :-------- | :------------------------------------------------------ | :------------------------------------------------------------ |
| **C**reate  | Adding new data.                                        | Registering a new user with their name and email.             |
| **R**ead    | Retrieving (getting) existing data.                   | Getting a list of all users, or details for one specific user. |
| **U**pdate  | Modifying existing data.                                | Changing a user's role or updating their email address.       |
| **D**elete  | Removing existing data.                                 | Removing a user who is no longer with the company.            |

#### 4. Dashboard API: The Reporter

The Dashboard API isn't just about managing users; it also performs calculations and data gathering to create useful reports. It asks the database questions like: "How many users do we have?" or "What's the status of all tasks?" and then presents the answers in an easy-to-understand format for the frontend.

#### 5. Shared Database

Crucially, this Python API connects to the *same shared database* as the NodeJS Tasks API. This is important because:
*   User information needs to be stored persistently.
*   Dashboard statistics often combine data from multiple places, like the number of users *and* the number of tasks (even if tasks are managed by another service).

### How Our React Frontend Interacts with the Python Users & Dashboard API

Remember in [Chapter 1: React Frontend Application](01_react_frontend_application_.md), our main `App.jsx` component had different tabs and rendered `<UserList />` and `<Dashboard />` components?

```jsx
// ... (imports)
import UserList from './components/UserList';       // Component for Users
import Dashboard from './components/Dashboard';     // Component for Dashboard
// ...

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // Manage which tab is active

  // ... (tab styling and buttons)

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <h1>Task Manager - Microservices</h1>
      <p>NodeJS API → Tasks &nbsp;|&nbsp; Python API → Users & Dashboard</p>

      <div style={{ display: 'flex' }}> {/* Tab navigation */}
        <button style={tabStyle('dashboard')} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
        <button style={tabStyle('tasks')} onClick={() => setActiveTab('tasks')}>📝 Tasks (NodeJS)</button>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>👥 Users (Python)</button>
      </div>

      {activeTab === 'dashboard' && <Dashboard />} {/* Show Dashboard component if active */}
      {activeTab === 'tasks' && <TaskList />}       {/* Show TaskList component if active */}
      {activeTab === 'users' && <UserList />}       {/* Show UserList component if active */}
    </div>
  );
}

export default App;
```

When you click the "Users" tab, the `<UserList />` component (or a similar component) becomes active. Inside `UserList`, there would be code similar to what we saw for tasks, but calling the Python API:

```jsx
// Inside frontend/src/components/UserList.jsx (simplified)
import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api-python/users') // Ask the Python API for users
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error("Error fetching users:", error));
  }, []);

  return (
    <div>
      <h2>Users List</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
}
export default UserList;
```
**Explanation:**
-   **`fetch('/api-python/users')`**: This is our React frontend (running in the browser) making a **"Read" (GET)** request to the Python Users & Dashboard API. It's asking, "Hey Python API, give me all the users!"
    -   `/api-python/users` is the specific address for getting user data from the Python service.
-   **`.then(response => response.json())`**: The Python API sends back user data in JSON format. This line converts that JSON into usable JavaScript data.
-   **`.then(data => setUsers(data))`**: Once the data is ready, our React app updates its `users` list, which then automatically updates what you see on the screen.

Similarly, the `<Dashboard />` component would make a `fetch` request to `/api-python/dashboard` to get all the statistics.

### Under the Hood: The Python API's Workflow

Let's trace what happens when our React app wants to get the list of users from the Python API.

```mermaid
sequenceDiagram
    participant React App
    participant Python Users API
    participant MySQL Database

    React App->>Python Users API: GET /api-python/users (Request users)
    Python Users API->>MySQL Database: SELECT * FROM users (Fetch users from DB)
    Note over Python Users API: Processes data
    MySQL Database-->>Python Users API: Sends user records
    Python Users API-->>React App: Sends user list (JSON)
    React App->>React App: Displays users on screen
```

**Step-by-Step Explanation:**

1.  **React App asks for users**: When you click the "Users" tab, the React frontend sends a `GET` request to the Python Users & Dashboard API at `/api-python/users`.
2.  **Python Users API receives request**: The Python API server receives this request. It knows (because we programmed it) that this request means "get all users."
3.  **Python Users API talks to the Database**: To get the actual user data, the Python API then sends a query to our [MySQL Database](04_mysql_database_.md), asking for all the entries in the `users` table.
4.  **MySQL Database sends users back**: The database processes the query, finds all the user records, and sends them back to the Python Users API.
5.  **Python Users API sends users to React App**: The API receives the raw user data from the database, formats it nicely into JSON, and sends this JSON data back as a response to the waiting React frontend.
6.  **React App displays users**: The React app receives the JSON data, updates its internal list of users, and renders them onto your web page!

A similar flow happens when the dashboard requests data, but the Python API would perform calculations (like counting tasks by status) *before* sending the data back to the frontend.

### Core Files and Their Role

Let's look at the actual files that make this Python Users & Dashboard API work in our `python-api` folder.

#### 1. `python-api/requirements.txt`

This file lists all the Python libraries our project needs to run. When you set up the project, you'd typically run `pip install -r requirements.txt`.

```
fastapi
uvicorn
sqlalchemy
pymysql
```
**Explanation:**
-   `fastapi`: The web framework for building our API.
-   `uvicorn`: A super-fast web server that runs our FastAPI application.
-   `sqlalchemy`: A powerful tool to interact with databases using Python objects instead of raw SQL.
-   `pymysql`: A "driver" that allows `sqlalchemy` to actually talk to a MySQL database.

#### 2. `python-api/main.py`

This is the main file for our Python Users & Dashboard API. It sets up the FastAPI server, defines all the API endpoints (for users and dashboard), and contains the logic for interacting with the database.

First, setting up FastAPI and connecting to the database:

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, func
from sqlalchemy.orm import declarative_base, sessionmaker
import os
import time # For retrying database connection

app = FastAPI(title="Python Users & Dashboard API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows frontend on any origin to talk to this API
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection setup (more details in Chapter 4)
DATABASE_URL = os.environ.get("DATABASE_URL", "mysql+pymysql://root:root@127.0.0.1/appdb")
engine = None
SessionLocal = None

def connect_db():
    global engine, SessionLocal
    # This function tries to connect to MySQL multiple times
    # In a Docker environment, the DB_HOST will be the name of the MySQL service.
    # For local development, it might be "127.0.0.1".
    # (Simplified for brevity, actual code has retry logic)
    engine = create_engine(DATABASE_URL)
    engine.connect() # Test the connection
    SessionLocal = sessionmaker(bind=engine)
    print("✅ MySQL Connected!")

connect_db() # Connect to the database when the API starts

Base = declarative_base()

# Define how our Python objects map to database tables
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    email = Column(String(255))
    role = Column(String(50))

class Task(Base): # We define Task here to read task data for the dashboard
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    status = Column(String(50))
    assigned_to = Column(Integer)

# ... more API endpoints defined here ...
```
**Explanation:**
-   **Lines 1-7**: We import necessary libraries (`FastAPI`, `CORSMiddleware` for cross-origin requests, `sqlalchemy` for database, `os` for environment variables, `time` for retries) and create our FastAPI app.
-   **Lines 8-14**: `app.add_middleware(CORSMiddleware, ...)` allows our React frontend (running on a different address/port) to communicate with this API.
-   **Lines 17-31 (and `connect_db` function)**: This is how our API prepares to talk to the [MySQL Database](04_mysql_database_.md). It reads the `DATABASE_URL` from an environment variable (crucial for Docker!) and sets up the connection using `sqlalchemy`.
-   **Lines 33-47**: `User` and `Task` are `sqlalchemy` "models." They define how Python objects relate to tables in our `appdb` database. This lets us work with users and tasks using Python code instead of raw SQL strings.

Next, a simple **"Read" (GET)** endpoint to get all users:

```python
# GET - Lấy tất cả users
@app.get("/api-python/users")
def get_users():
    db = SessionLocal() # 1. Get a database session
    users = db.query(User).all() # 2. Query the database for all users
    db.close() # 3. Close the session
    return users # 4. Send the users back as JSON
```
**Explanation:**
-   **`@app.get("/api-python/users")`**: This tells FastAPI: "When a `GET` request comes to the `/api-python/users` address, run this function."
-   **Line 1**: `SessionLocal()` creates a temporary connection to the database.
-   **Line 2**: `db.query(User).all()` is the command sent to the database to fetch all `User` records. SQLAlchemy converts this into SQL.
-   **Line 3**: It's good practice to close the database session when done.
-   **Line 4**: `return users` automatically converts the list of Python `User` objects into JSON and sends it back to the React frontend.

Finally, an example of a **Dashboard** endpoint:

```python
# DASHBOARD / THỐNG KÊ
@app.get("/api-python/dashboard")
def get_dashboard():
    db = SessionLocal()

    total_users = db.query(func.count(User.id)).scalar() # Count all users
    total_tasks = db.query(func.count(Task.id)).scalar() # Count all tasks

    # Count tasks by status
    pending = db.query(func.count(Task.id)).filter(Task.status == "pending").scalar()
    done = db.query(func.count(Task.id)).filter(Task.status == "done").scalar()
    # ... (other status counts)

    # Example: Top users by task count (uses raw SQL for complex query)
    from sqlalchemy import text
    top_users_query_result = db.execute(text("""
        SELECT u.name, COUNT(t.id) as task_count
        FROM users u
        LEFT JOIN tasks t ON u.id = t.assigned_to
        GROUP BY u.id, u.name
        ORDER BY task_count DESC
        LIMIT 5
    """)).fetchall()
    
    db.close()

    return { # Return all gathered statistics
        "total_users": total_users,
        "total_tasks": total_tasks,
        "tasks_by_status": {
            "pending": pending,
            "done": done
        },
        "top_users": [{"name": r[0], "task_count": r[1]} for r in top_users_query_result]
    }
```
**Explanation:**
-   **`@app.get("/api-python/dashboard")`**: This endpoint collects various statistics for the dashboard.
-   It uses `db.query(func.count(...)).scalar()` to efficiently count records in the database (e.g., total users, tasks, or tasks with a specific status).
-   For more complex aggregations (like finding the top users by task count), it might use raw SQL queries (shown with `db.execute(text(...))`).
-   All the calculated statistics are then combined into a single Python dictionary, which FastAPI automatically converts to JSON for the frontend.

When you run the Python API, you'd typically use the `uvicorn` command defined in our `Dockerfile` and `docker-compose.yml`.

#### 3. `python-api/Dockerfile`

This file contains instructions for Docker on how to build an "image" (a self-contained package) of our Python Users & Dashboard API.

```dockerfile
FROM python:3.11 # Start with a base Python image
WORKDIR /app     # Set the working directory inside the container
COPY requirements.txt . # Copy the list of dependencies
RUN pip install -r requirements.txt # Install Python libraries
COPY . .         # Copy all our application code
EXPOSE 8000      # Tell Docker that the app listens on port 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] # Command to run the app
```
**Explanation:**
-   This `Dockerfile` is similar in concept to the NodeJS `Dockerfile` we'll see later. It packages our Python code and all its dependencies into a ready-to-run container.
-   `EXPOSE 8000` tells Docker that this service will be listening on port 8000 *inside* its container.
-   `CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]` is the command that starts our FastAPI application using the `uvicorn` server, making it accessible from outside the container on port 8000.

### Conclusion

In this chapter, we discovered the **Python Users & Dashboard API**, a specialized backend service for our **AppDocker** project. You learned that it's built with Python and FastAPI, handling crucial tasks like managing user information (CRUD operations) and providing valuable analytics for the dashboard. This API works alongside the NodeJS Tasks API, both communicating with our shared [MySQL Database](04_mysql_database_.md) to keep all our data consistent and accessible.

Now that we have two powerful backend services, it's time to truly understand the central hub that stores all their information: the database.

[Next Chapter: MySQL Database](04_mysql_database_.md)

---

<sub><sup>Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge).</sup></sub> <sub><sup>**References**: [[1]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab7/python-api/.dockerignore), [[2]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab7/python-api/Dockerfile), [[3]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab7/python-api/main.py), [[4]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Lab7/python-api/requirements.txt), [[5]](https://github.com/gianglt-dau/AppDocker/blob/42380997d078588130a5c047568a8b9cc06fb0c5/Notes.md)</sup></sub>