const User = require("../models/userModel");
const bcrypt = require("bcryptjs");


const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phoneNo = req.body.phoneNo || user.phoneNo;

    // Update profile image if uploaded
    if (req.file) {
      user.profile = req.file.filename; // store file name
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNo: updatedUser.phoneNo,
      profile: updatedUser.profile || "default-image.png", // fallback if no image
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
};


const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.pin = newPassword;
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password" });
  }
};


const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting account" });
  }
};


const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phoneNo: user.phoneNo,
      profile: user.profile || "default-image.png", // fallback if no image
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile details" });
  }
};

module.exports = {
  updateUserProfile,
  changePassword,
  deleteAccount,
  getUserProfile
};