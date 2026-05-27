const User = require("../model/user");
const jwt = require("jsonwebtoken");
const { validate, assert } = require("../utilities/utils");

const authController = {
  async register(req, res) {
    try {
      console.log(req);
      validate(req.body, ["email", "password"]);
      const { email, password } = req.body;

      const existingUser = await User.findByEmail(email);
      assert(!existingUser, "Email already in use", "email");

      const user = await User.create(email, password);
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.json({ user: { id: user.id, email: user.email }, token });
    } catch (error) {
      console.error("Registration error:", error);
      res
        .status(400)
        .json({ error: error.message, inputError: error.inputError });
    }
  },

  async login(req, res) {
    try {
      const user = req.user;
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.json({ user: { id: user.id, email: user.email }, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({ error: error.message });
    }
  },

  async me(req, res) {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        is_admin: req.user.is_admin || false,
      },
    });
  },

  async forgotPassword(req, res) {
    try {
      validate(req.body, ["email"]);
      const { email } = req.body;

      const user = await User.findByEmail(email);
      // Always return 200 to avoid user enumeration
      if (!user) {
        return res.status(200).json({
          message: "If that email exists, a reset link has been sent.",
        });
      }

      const resetToken = jwt.sign(
        { timestamp: Date.now(), user_id: user.id },
        user.password_hash,
        { expiresIn: "5m" },
      );

      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      // In production, send this URL via your preferred email provider
      console.log("Password reset URL:", resetUrl);

      res
        .status(200)
        .json({ message: "If that email exists, a reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(400).json({ error: error.message });
    }
  },

  async resetPassword(req, res) {
    try {
      validate(req.body, ["token", "email", "password"]);
      const { token, email, password } = req.body;

      const user = await User.findByEmail(email);
      assert(user, "Invalid or expired reset token");

      jwt.verify(token, user.password_hash);

      await User.updatePassword(user.id, password);

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = authController;
