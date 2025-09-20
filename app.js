const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");


const userRoutes = require("./routes/userRoutes");
const financialRecordRoutes = require("./routes/financialRecordRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const recurringTransactionRoutes = require("./routes/recurringTransactionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userSettingsRoutes = require("./routes/userSettingsRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const categoryTagRoutes = require("./routes/categoryAndTagsRoutes");
const transactionSearchRoutes = require("./routes/transactionSearchRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const calendarRoutes = require("./routes/calendarRoutes");






// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://personal-finance-tracker-frontend-tau.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use(express.static("uploads/userImg"));
// app.use(express.static("uploads/recordImg"));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/financial-records", financialRecordRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/recurring-transactions", recurringTransactionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", userSettingsRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/categories-tags", categoryTagRoutes);
app.use("/api/transactions/search", transactionSearchRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/calendar", calendarRoutes);





// Placeholder route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});