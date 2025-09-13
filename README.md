# Personal Finance Tracker – Backend

This is the backend API for the Personal Finance Tracker application. It is built with **Node.js**, **Express.js**, and **MongoDB**. The backend handles user authentication, financial record management, and provides RESTful endpoints for the frontend.

## Features

- User authentication and authorization (JWT)
- Add, view, update, and delete financial records
- Categorize expenses and income
- File upload support (for receipts/images)
- Analytics endpoints for expense tracking
- Generate automatically insights according to your records
- Add , view , update and delete Categories and Tags
- Add , view , update and delete Budget
- Add , view , update and delete Bills (for upcoming bills)
- Secure API endpoints

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT 
- **File Uploads:** Multer (if used)
- **Environment Variables:** dotenv

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/itisaarjan/PersonalFinanceTracker.git
   ```

2. **Navigate to the server directory:**
   ```bash
   cd PersonalFinanceTracker/server
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up environment variables:**  
   Create a `.env` file in the `server` directory and add the following:
   ```
   PORT=5555
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   # Add any other variables you use
   ```

5. **Run the development server:**
   ```bash
   nodemon app.js or node app.js
   ```
   The server will start on `http://localhost:5555` by default.

## API Usage

- **Register:** `POST /api/auth/register`
- **Login:** `POST /api/auth/login`
- **Get Records:** `GET /api/records`
- **Add Record:** `POST /api/records`
- **Update Record:** `PUT /api/records/:id`
- **Delete Record:** `DELETE /api/records/:id`
- ...

## Deployment

- Deploy  backend to [Render](https://render.com/) or another Node.js hosting provider.
- Set your environment variables in the Render dashboard.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Rahul Sharma - [GitHub](https://github.com/Sharma7422)

Project Link: [https://github.com/Sharma7422/PersonalFinanceTracker.git](https://github.com/Sharma7422/PersonalFinanceTracker.git)

## Acknowledgements

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Multer
- dotenv