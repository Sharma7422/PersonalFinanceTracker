const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendMail = require("../utils/sendMail"); // You need to implement this utility or use nodemailer

const {
  generateBillReminders,
  generateBudgetAlerts,
  generateSavingTips,
} = require("./notificationController");



const registerUser = async (req, res) => {
  const { name, email, password, phoneNo } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Handle profile image upload
    const profile = req.file ? req.file.filename : "default-avatar.png";
    // Create new user
    const user = await User.create({ name, email, password, phoneNo, profile});

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        // phoneNo: user.phoneNo,
        profile: user.profile,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" , error: error.message });
  }
};




const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password matches
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    
    

    await Promise.all([
  generateBillReminders(user._id),
  generateBudgetAlerts(user._id),
  generateSavingTips(user._id)
]);
    // Generate JWT token
    const token = generateToken(user._id);


    // Respond with user data and token
    res.status(200).json({
  user: {
    _id: user.id,
    name: user.name,
    email: user.email,
    phoneNo: user.phoneNo,
    profile: user.profile,
  },
  token,
});
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};


const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
        profile: user.profile,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};





// Forgot Password (send reset link or code)
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.pin = resetCode;
    await user.save();

    // Send code to user's email
    await sendMail({
      to: user.email,
      subject: "Your Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
    });

    res.status(200).json({ message: "Reset code sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password (with code)
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.pin !== code) {
      return res.status(400).json({ message: "Invalid code or email." });
    }
    // Hash the new password before saving!
    user.password = newPassword; 
user.pin = undefined;
await user.save();
    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { registerUser , loginUser , getUserProfile , forgotPassword , resetPassword };