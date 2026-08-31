🚀 CollabLance - Freelancing & Real-Time Team Collaboration Platform
JavaSpring BootSpring CloudReactMySQLWebSocket

CollabLance is an enterprise-grade, microservices-driven freelancing and real-time team collaboration platform. It bridges the gap between project owners and freelancers by providing seamless project management, role-based hiring, real-time WebSocket chat with file sharing, and interactive Kanban boards for task management.

📜 Table of Contents
Team Members
Key Features
System Architecture
Microservices Breakdown
Tech Stack
Getting Started & Installation
API Route Mapping
License

👥 Team Members

Name Role	Responsibilities

Madhav Saxena	👑 Team Lead	Project Architecture, Gateway & Service Routing, Core Features

Anshita Aseri	💻 Team Member	Microservice Development & Frontend Integration

Aniruddha Raut	💻 Team Member	Backend API & Database Management

Aditi Deo	💻 Team Member	UI/UX & Frontend Components


✨ Key Features

🔑 Auth & User Management (auth-service)
Secure Authentication: JWT-based login, registration, email verification, and password reset tokens.
Developer Profiles: Bio management, skill tagging, and PDF resume/certification uploads.

📋 Project Management (project-service)
Project Marketplace: Create, search, filter, and apply to freelancing projects.
Role Requirements: Define custom role openings per project (e.g., Frontend Developer, Backend Dev).
Application Tracking: Accept/Reject applicant workflows and automatic team formation.
Reports & Moderation: User reporting system and project moderation.

💬 Real-Time Collaboration & Tasks (collaboration-service)
Real-Time Live Chat: Powered by WebSocket and STOMP protocol with SockJS fallback.
File Sharing: Upload and exchange images, notes, and documentation inside project chat rooms.
Kanban Board: Drag-and-drop task status tracking (TODO, IN_PROGRESS, DONE).

🛡️ Admin Management
Platform activity monitoring, user moderation, and category management.

🏗️ System Architecture
The project follows a decoupled Microservices Architecture coordinated by Netflix Eureka Service Registry and unified under Spring Cloud API Gateway:


                                  +-----------------------+
                                  |     React Frontend    |
                                  |   (http://localhost)  |
                                  +-----------+-----------+
                                              |
                                              v
                                   +--------------------+
                                   | Spring API Gateway |
                                   |    (Port 8080)     |
                                   +---------+----------+
                                             |
           +---------------------------------+---------------------------------+
           |                                 |                                 |
           v                                 v                                 v
+--------------------+            +--------------------+            +--------------------+
|    Auth Service    |            |  Project Service   |            | Collaboration Svc  |
|    (Port 8081)     |            |    (Port 8082)     |            |    (Port 8083)     |
+---------+----------+            +---------+----------+            +---------+----------+
          |                                 |                                 |
          +---------------------------------+---------------------------------+
                                            |
                                            v
                                 +--------------------+
                                 | Eureka Discovery   |
                                 |    (Port 8761)     |
                                 +--------------------+

                                 
🚀 Microservices Breakdown
Service	Port	Description
🪐 Eureka Server	8761	Service Registry & Discovery Server
🛡️ API Gateway	8080	Unified API entry point with CORS configuration & load balancing
🔐 Auth Service	8081	Authentication, User Profiles, JWT Tokens, Email Services
📦 Project Service	8082	Projects, Categories, Role Requirements & Applications
💬 Collaboration Service	8083	Real-time WebSocket Chat, Task Management (Kanban), File Uploads
💻 Frontend	3000	Single Page Application built with React 19 & Bootstrap

🛠️ Tech Stack
Backend
Core: Java 17, Spring Boot 3.x, Spring Cloud 2023
Security: Spring Security, JWT (JSON Web Tokens)
Data Access: Spring Data JPA, Hibernate, MySQL 8.0
Real-Time: Spring WebSocket, STOMP Protocol, SockJS
Service Discovery & Gateway: Netflix Eureka, Spring Cloud Gateway

Frontend
Framework: React 19, React Router v7
Styling: Bootstrap 5, Custom CSS Modules
HTTP Client: Axios
Real-time: @stomp/stompjs, sockjs-client
⚙️ Getting Started & Installation

Prerequisites
JDK 17 or higher
Node.js v18+ & npm
MySQL 8.0 running on port 3306

Step 1: Clone Repository
bash
git clone https://github.com/Madddy13/Freelancing-Collaboration-Platform.git
cd Freelancing-Collaboration-Platform

Step 2: Configure Database
Create the MySQL database:
sql

CREATE DATABASE IF NOT EXISTS freelancing_platform;

Step 3: Run Microservices
Open separate terminal windows and launch services using the Maven wrapper:

bash

# 1. Start Eureka Server (Port 8761)
cd eureka-server
./mvnw spring-boot:run
# 2. Start API Gateway (Port 8080)
cd ../api-gateway
./mvnw spring-boot:run
# 3. Start Auth Service (Port 8081)
cd ../auth-service
./mvnw spring-boot:run
# 4. Start Project Service (Port 8082)
cd ../project-service
./mvnw spring-boot:run
# 5. Start Collaboration Service (Port 8083)
cd ../collaboration-service
./mvnw spring-boot:run
Step 4: Run Frontend
bash

cd frontend
npm install
npm start
Visit http://localhost:3000 in your browser!

🛣️ API Route Mapping
All frontend requests route through API Gateway on http://localhost:8080:

Route Pattern	Target Microservice	Functionality
/api/auth/**	AUTH-SERVICE	Login, Register, JWT, Password Reset
/api/admin/**	AUTH-SERVICE / PROJECT-SERVICE	Admin Moderation & Activity
/api/projects/**	PROJECT-SERVICE	Project CRUD, Filters, Roles
/api/applications/**	PROJECT-SERVICE	Application acceptance/rejection
/api/tasks/**	COLLABORATION-SERVICE	Kanban board task management
/api/chat/**	COLLABORATION-SERVICE	Real-time messaging & history

📜 License
This project is created and maintained by Madhav Saxena and team for academic & software engineering demonstration purposes. All rights reserved.
