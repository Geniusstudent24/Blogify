# Blogify - A College Communication Portal

![Blogify Screenshot]



A full-stack web application designed to streamline communication within a college or educational institution. This platform allows administrators (teachers) to post assignments, notices, and study materials in a centralized location. Students can view content, engage via comments, and subscribe to real-time push notifications for new updates.

**Live Demo:** [https://blogify-uca1.onrender.com](https://blogify-uca1.onrender.com)

---

## Features

* **User Authentication:** Secure user registration and login system using JWT (JSON Web Tokens) stored in cookies.
* **Admin Role:** A dedicated admin role with exclusive rights to create, edit, and delete blog posts.
* **Categorized Content:** Posts can be categorized as 'Assignment', 'Notice', or 'Study Material' for easy filtering and access.
* **Rich Text Editor:** Implemented TinyMCE, a powerful WYSIWYG editor, allowing admins to create detailed posts with formatted text, lists, links, and embedded images/PDFs.
* **File Uploads to Cloud:** Seamless file and image uploads are handled using `multer` and stored on a dedicated AWS S3 bucket.
* **Real-time Comments:** Users can comment on blog posts, with new comments appearing in real-time for all connected users, powered by Socket.IO.
* **Web Push Notifications:** Users can subscribe to receive instant push notifications on their device (desktop or mobile) whenever a new post is published, using OneSignal.
* **Automated Content Management:** A scheduled Cron Job runs daily to automatically delete posts older than 14 days, ensuring the platform remains up-to-date and storage is managed efficiently.

---

## Tech Stack

* **Frontend:** EJS (Embedded JavaScript templates), HTML5, CSS3, Bootstrap 5
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (with Mongoose for object modeling)
* **Authentication:** JWT, Cookies, Middleware
* **Real-time Engine:** Socket.IO
* **File Storage:** AWS S3
* **Push Notifications:** OneSignal
* **Deployment:** Render.com

---

## Local Setup and Installation

To run this project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_GITHUB_USERNAME/Blogify.git](https://github.com/YOUR_GITHUB_USERNAME/Blogify.git)
    cd Blogify
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a `.env` file in the root directory and add the following environment variables.

    ```env
    MONGO_URL=YOUR_MONGO_CONNECTION_STRING
    PORT=8000
    
    # AWS S3 Credentials
    AWS_REGION=YOUR_AWS_REGION
    AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
    AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
    S3_BUCKET_NAME=YOUR_S3_BUCKET_NAME

    # OneSignal API Keys (or previously generated VAPID keys)
    # VAPID_PUBLIC_KEY=...
    # VAPID_PRIVATE_KEY=...
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```

5.  Open your browser and navigate to `http://localhost:8000`.

---

## Author

* **Your Name**
* **[LinkedIn Profile URL]**
* **[Portfolio Website URL]**
