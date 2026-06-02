const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const attachCurrentUser = async (req, res, next) => {
  try {
    const authHeader = req.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.sub).select(
      "_id fullName email role isActive"
    );

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid or inactive user",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    next(error);
  }
};

module.exports = attachCurrentUser;