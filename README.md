
# CampusOS: AI-Powered University Operations Platform

## 1. Team Details

*   **Team leader name:** *P.Hema*

## 2. Problem Statement & Solution

### Problem Statement: Open Innovation

Modern universities suffer from digital fragmentation. Critical functions like academic administration, student services, faculty management, and campus life are siloed across disconnected platforms (LMS, ERPs, standalone web pages, email chains). This creates inefficiency, poor user experience, and a lack of a unified data view for decision-making. Students and faculty must navigate a maze of systems to perform basic tasks, leading to frustration and wasted time.

### Our Solution: CampusOS

CampusOS is a unified, AI-powered, role-based platform designed to consolidate all aspects of university life into a single, intuitive dashboard. By leveraging a modular architecture and a centralized Firebase backend, CampusOS provides a "single pane of glass" for every user—from students and faculty to high-level directors and administrative staff.

The platform's "Open Innovation" approach lies in its extensible, role-based design and the integration of a powerful AI assistant (Gemini), which can access real-time data to automate tasks, answer questions, and provide intelligent insights, fundamentally transforming the campus experience.

### Opportunities

*   **Operational Efficiency:** Centralizes data and workflows, drastically reducing administrative overhead for tasks like document review, scheduling, and complaint management.
*   **Enhanced User Experience:** Provides a seamless, consistent, and personalized dashboard for every user, eliminating the need to juggle multiple applications.
*   **Data-Driven Decision Making:** Creates a unified data source, allowing administrators to gain real-time insights into campus operations.
*   **AI-Powered Assistance:** The integrated Gemini assistant acts as a 24/7 support agent, answering queries and automating routine tasks, freeing up human resources for more critical work.

### How is it different from existing ideas?

While Learning Management Systems (LMS) or Enterprise Resource Planning (ERP) systems exist, CampusOS differentiates itself in three key ways:
1.  **Unified Experience:** Unlike siloed systems, CampusOS integrates everything from academic schedules and library resources to hostel complaints and event management under a single, role-aware interface.
2.  **Deep AI Integration:** CampusOS is built with a powerful AI core (Gemini via Genkit). The AI is not just a chatbot; it's a true assistant that can access and reason with real-time data from across the platform (e.g., "Are there any medical leave requests pending my approval?" or "Find me a free slot to reschedule my DSA class").
3.  **Modular & Role-Based:** The platform is built on a strict, secure, and extensible role-based access control system. Each user (Student, Faculty, Doctor, Director, etc.) sees a dashboard tailored specifically to their needs and permissions, ensuring data privacy and relevance.

### How will it solve the problem?

CampusOS directly solves the fragmentation problem by:
*   **Centralizing Workflows:** A student submits a medical leave request, the doctor reviews it, and the director gives final approval—all within the same platform, with real-time status updates.
*   **Automating Information Retrieval:** Instead of emailing the academic office, a student can ask the Gemini AI, "Who teaches the Deep Learning course?" and get an instant, accurate answer based on live data.
*   **Providing a Single Source of Truth:** All data, from student enrollment and faculty availability to event calendars and library inventory, resides in a structured Firestore database, eliminating data redundancy and inconsistency.

## 3. List of Features Offered

CampusOS offers a tailored experience for each user role:

### Core Platform Features (Available to All)
*   **Secure Authentication:** Robust email/password login system with forgot/reset password functionality.
*   **Personalized Dashboard:** A unique landing page for each role, summarizing key information and actions.
*   **Smart Search Bar:** A unified search bar to quickly find information or access external web pages and user-defined shortcuts.
*   **Gemini AI Assistant:** An AI-powered chat assistant that can answer questions and perform tasks by accessing real-time data.
*   **Profile Management:** Users can update their profile picture with a built-in image cropper and editor.
*   **App Launcher:** A Google-style app launcher for quick access to external services like Gmail, Drive, and Calendar.

### Student Dashboard (`/student`)
*   **Today's Schedule:** Displays the student's class schedule for the current day, including any rescheduled classes.
*   **Campus Feed:** A carousel of active campus events and announcements managed by the SDC.
*   **Curriculum Viewer:** View the official B.Tech curriculum for the student's specific branch.
*   **Resource Hub:** A central place for learning materials, divided into "Global Resources" (managed by SDC) and "My Resources" (a student's personal, private collection of links and uploaded PDFs).
*   **Library:** Browse the institute's digital and physical book collection, and manage personal notes and documents in a private "My Library" section.
*   **Document Submission:**
    *   **Medical Leave:** Submit medical leave requests with document uploads and track their approval status in real-time.
    *   **Fee Receipt:** Submit semester fee receipts with PDF proof of payment.
*   **Hostel Complaint Box:** Anonymously submit hostel-related complaints (cleanliness, water, etc.) to the Student Life Council (SLC).
*   **Availability Viewer:** Check the real-time availability status of Faculty, Doctors, the Librarian, and the Academic Office.

### Faculty Dashboard (`/faculty`)
*   **Today's Schedule:** View personal teaching schedule for the day.
*   **Availability Management:** Set and update personal availability status, which is visible to students.
*   **Class & Reschedule Management:** View enrolled students for assigned courses and use an AI-powered tool to find conflict-free slots for rescheduling missed classes.

### Doctor Dashboard (`/doctor`)
*   **Availability Management:** Manage and display personal availability status (e.g., Available, On Leave, Nurse Available).
*   **Medical Request Review:** Review, approve, or reject pending medical leave requests submitted by students.
*   **Approval History:** View a log of all previously processed requests.

### Director Dashboard (`/director`)
*   **Final Approval Workflow:** Review and provide the final approval or rejection for medical leave requests that have already been approved by a doctor.
*   **Filtered Search:** Search and filter pending requests by student name, ID, or date.

### Academic Office Dashboard (`/academics`)
*   **Student Management:** Add, edit, and view student records, organized by branch and year.
*   **Faculty Assignments:** View a read-only list of all current teaching assignments and faculty load.
*   **Curriculum Management:** View and manage the official curriculum for all programs.
*   **Document Review Center:**
    *   **Medical Documents:** View all medical certificates submitted by students.
    *   **Fee Receipts:** View all fee receipts submitted by students.
*   **Medical Records Archive:** Access a finalized, filterable list of all approved and rejected medical leaves.
*   **Reschedule Log:** An audit trail of all rescheduled classes across the institution.
*   **Office Availability:** Set the global availability status for the Academic Office.

### Librarian Dashboard (`/librarian`)
*   **Book Collection Management:** Add, edit, and delete both physical and digital books in the institute library, including uploading PDF files and cover images.
*   **Availability Management:** Set and update personal availability status for students.

### SDC Dashboard (`/sdc`)
*   **Event Management:** Create, edit, and archive campus events that appear on the student dashboard's feed.
*   **Global Resource Management:** Manage the "Global Resources" (e.g., links to LeetCode, GitHub) visible to all students in the Resource Hub.

### SLC Dashboard (`/slc`)
*   **Complaint Management:** Confidentially review and manage all hostel complaints submitted by students, update their status, and add internal notes.

## 4. Google Technologies Used

*   **Firebase App Hosting:** Hosts the Next.js application, providing a secure, scalable, and fully managed environment.
*   **Firebase Authentication:** Manages user identity with a secure and easy-to-use email/password system.
*   **Firestore:** The core NoSQL database for the application, storing all data in a structured, real-time, and scalable manner.
*   **Firebase Storage:** Used for storing all user-uploaded files, such as medical documents, fee receipts, library books, and profile pictures.
*   **Genkit with Gemini:** The AI backbone of the application. Genkit is a Firebase framework used to build production-ready AI flows, and it integrates directly with Google's Gemini models to power the Campus Assistant and other intelligent features.
*   **Next.js & React:** The frontend framework used to build the responsive, server-driven user interface.

## 5. Process Flow Diagram (Medical Leave Approval)

This use case demonstrates the cross-role workflow facilitated by CampusOS.

```
(Student)                               (Doctor)                                (Director)                             (Academic Office)
   |                                       |                                       |                                          |
1. Submits Medical Leave Request           |                                       |                                          |
   (Form + PDF Upload)                     |                                       |                                          |
   |                                       |                                       |                                          |
   v                                       |                                       |                                          |
[ Firestore: "medicalRequests" collection ]|                                       |                                          |
   (status: 'Pending Doctor Verification') |                                       |                                          |
   |-------------------------------------->|                                       |                                          |
                                        2. Reviews Request on Dashboard           |                                          |
                                           (Views PDF, student details)            |                                          |
                                           |                                       |                                          |
                                        3. Approves Request                       |                                          |
                                           |                                       |                                          |
                                           v                                       |                                          |
                                   [ Firestore: status update ]                    |                                          |
                               (status: 'Pending Director Approval')               |                                          |
                                           |-------------------------------------->|                                          |
                                                                                4. Reviews Doctor-Approved Request         |
                                                                                   (Views PDF, student details)            |
                                                                                   |                                       |
                                                                                5. Gives Final Approval                    |
                                                                                   |                                       |
                                                                                   v                                       |
                                                                           [ Firestore: final status update ]              |
                                                                               (status: 'Approved')                        |
                                                                                   |--------------------------------------->|
                                                                                                                           6. Views Finalized Record
                                                                                                                              (In Medical Records Archive)
```

## 6. Architecture Diagram

The CampusOS application follows a modern, serverless, full-stack architecture.

```
+--------------------------------------------------------------------------------+
|                                  USER (Browser)                                |
|                                                                                |
|     +----------------------------------------------------------------------+   |
|     |                      Next.js Frontend (React)                        |   |
|     |                                                                      |   |
|     |   [ UI Components (shadcn/ui), Pages, Forms, State Management ]      |   |
|     |                                                                      |   |
|     +----------------------------------^-----------------------------------+   |
|                                        | (HTTPS)                               |
+----------------------------------------|---------------------------------------+
                                         |
+----------------------------------------|---------------------------------------+
|                                        v                                       |
|                       BACKEND (Firebase & Google Cloud)                        |
|                                                                                |
|  +---------------------------+  +-------------------------------------------+  |
|  |   Firebase App Hosting    |  |                   AI Layer                  |  |
|  |                           |  |                                           |  |
|  |    [ Serves Next.js ]     |  | +-----------------------------------------+ |  |
|  |                           |  | |           Genkit (AI Flows)             | |  |
|  +---------------------------+  | +--------------------^--------------------+ |  |
|                                 |                      |                      |  |
|  +---------------------------+  | +--------------------|--------------------+ |  |
|  |     Firebase Services     |  | |           Gemini Models (LLM)           | |  |
|  |                           |  | +-----------------------------------------+ |  |
|  |  +---------------------+  |  +-------------------------------------------+  |
|  |  |    Authentication   |<----+ (Auth state sync)                            |
|  |  +---------------------+  |                                                |
|  |                           |                                                |
|  |  +---------------------+  |<---- (Real-time data read/write) --------------+ (AI reads data)
|  |  |      Firestore      |  |                                                |
|  |  +---------------------+  |                                                |
|  |                           |                                                |
|  |  +---------------------+  |<---- (File upload/download)                     |
|  |  |       Storage       |  |                                                |
|  |  +---------------------+  |                                                |
|  |                           |                                                |
|  +---------------------------+                                                |
|                                                                                |
+--------------------------------------------------------------------------------+

```
**Explanation:**

1.  **Client-Side (Browser):** The user interacts with a responsive Next.js application. All UI is built with React and styled with Tailwind CSS and shadcn/ui components.
2.  **Hosting:** The entire application is served securely via Firebase App Hosting.
3.  **Backend Services (Firebase):**
    *   **Authentication:** Manages user sign-up, login, and sessions. The frontend synchronizes with the auth state in real-time.
    *   **Firestore:** Acts as the central database. The frontend subscribes to real-time updates from Firestore, ensuring the UI is always in sync with the backend data.
    *   **Storage:** Securely stores all user-uploaded files.
4.  **AI Layer (Genkit & Gemini):**
    *   When a user interacts with an AI feature (like the Campus Assistant), the Next.js frontend calls a server-side "AI Flow" managed by Genkit.
    *   Genkit orchestrates the process, builds a structured prompt, and securely calls the Gemini model.
    *   Critically, the Genkit flow can directly and securely read data from Firestore to provide contextually aware, accurate answers, which are then streamed back to the user.
