## Getting Started: Local Setup

Follow these steps to get the Yelp prototype application running on your local machine.

### 1. Database Configuration
Ensure your MySQL service is running and accessible.

*   **Start MySQL Service:**
    ```bash
    brew services start mysql
    ```
*   **Verify Connection:**
    ```bash
    mysql -u root -p -h 127.0.0.1 -P 3306
    ```
    *(Log in with your MySQL root password).*

### 2. Environment Setup
Navigate to the backend directory and configure your credentials.

*   **Move to Backend Folder:**
    ```bash
    cd /path/to/your/project/backend
    ```
*   **Generate JWT Secret:** Run this command to generate a unique key for your `.env`:
    ```bash
    python3 -c "import secrets; print(secrets.token_urlsafe(32))"
    ```
*   **Configure `.env`:** Update the `.env` file in the backend folder with the following:
    *   `DATABASE_PASSWORD`: Your_MySQL_Password
    *   `JWT_SECRET_KEY`: (Paste the token generated above)
    *   `OPENAI_API_KEY`: (Your OpenAI secret key)

### 3. Backend Installation & Migrations
Activate your virtual environment and prepare the database schema.

*   **Activate Virtual Environment:**
    ```bash
    source /path/to/your/venv/bin/activate
    ```
*   **Install Dependencies:**
    ```bash
    python -m pip install langchain-core langchain-openai openai
    ```
*   **Run Database Migrations:**
    ```bash
    alembic upgrade head
    ```

### 4. Running the Application
Open two terminal windows to run the backend and frontend simultaneously.

*   **Start Backend Server:**
    ```bash
    uvicorn app.main:app --reload --port 8080
    ```
*   **Start Frontend Server:**
    Navigate to your frontend directory and run:
    ```bash
    npm run dev
