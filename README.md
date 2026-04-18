
# 📚 EduQuiz — Modern Online Examination System

**EduQuiz** is a full-stack web-based examination platform designed to manage, deliver, and evaluate online assessments in a structured and reliable manner. It provides a balanced combination of administrative control and a streamlined student experience, making it suitable for academic and training environments.

The system focuses on clarity, usability, and performance—ensuring that exams can be conducted efficiently without unnecessary complexity.

---

## 🚀 Overview

EduQuiz supports the complete lifecycle of an online examination:

**Creation → Scheduling → Execution → Evaluation → Analysis**

The platform is divided into two primary environments:

* **Administrative Control Center** — for managing exams, students, and results
* **Student Examination Portal** — for participating in exams within a controlled interface

---

## ✨ Key Features

### 🛡️ Administrative Control Center

* Centralized exam creation and management across multiple subjects
* Flexible scheduling with defined start times, end times, and duration limits
* Structured question management supporting reusable content
* Real-time performance monitoring with categorized grading levels
* Manual score adjustment capabilities for review and correction

---

### 🎓 Student Examination Portal

* Clean, distraction-free interface designed for focused assessments
* Live countdown timer and progress tracking during exams
* Automatic submission upon time expiration
* Immediate result generation with clear grade classification
* Access to practice mode for reviewing completed or expired exams

---

## 🛠️ Technology Stack

**Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
**Backend:** Node.js with Express.js
**Database:** MySQL (relational data management)

The system follows a REST-based communication model, enabling smooth interaction between client and server.

---

## 🧩 System Architecture

EduQuiz is built using a layered architecture to maintain separation of concerns:

* Client-side interface handles user interaction
* REST API layer processes requests and responses
* Application logic manages business rules
* Database layer ensures structured data storage and integrity

This approach improves maintainability, scalability, and clarity of the system design.

---

## 📁 Project Structure

The project is organized into clearly separated components:

* Frontend assets for user interfaces
* Backend server handling API requests
* Dedicated files for admin and student views
* Styling and layout definitions
* Supporting modules for exam handling and analytics

---

## 📡 API Overview

The system exposes a set of RESTful endpoints for core operations:

* User authentication for both admin and student roles
* Retrieval of active and practice exams
* Submission and storage of exam results
* Administrative update of student scores

Each endpoint is designed to maintain clear separation between user roles and system responsibilities.

---

## ⚙️ Installation & Setup

To run the project locally:

* Clone the repository
* Install required dependencies
* Configure the MySQL database connection
* Start the backend server

Once running, the application is accessible through a local development server.

---

## 🔐 Security Considerations

EduQuiz incorporates essential security practices:

* Role-based access control to separate admin and student permissions
* Admin-level verification through a secure PIN mechanism
* Use of parameterized queries to prevent SQL injection
* Controlled API access to enforce logical boundaries

---

## 👨‍💻 Development Team

### **Sajidur Rahaman**

**ID:** 231-115-007
**Department:** Computer Science and Engineering

**Contributions:**

* UI/UX design for the Administrative Control Center
* Development of admin-side functionalities
* Exam execution logic (timers, progress tracking)
* Exam management and result handling features
* System structure planning and overall integration

---

### **Md. Minhaj Chowdhury**

**ID:** 231-115-015
**Department:** Computer Science and Engineering

**Contributions:**

* UI/UX design for the Student Examination Portal
* Student-side exam interface development
* Result display and practice mode features

---

## 🤝 Contribution

Contributions are welcome and encouraged.

To maintain quality and consistency:

* Follow a clear and structured workflow
* Keep changes focused and well-documented
* Submit pull requests for review before merging

---

## 📜 License

This project is distributed under the MIT License.

---

## 📌 Final Note

EduQuiz is built with a clear objective:

**to provide a dependable and structured platform for conducting online examinations with simplicity and control.**

