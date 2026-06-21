const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Shelter = require("../models/shelter.model");

const signToken = (user, jwtSecret) =>
  jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

/*
  POST /auth/register
*/
const register = async (req, res, next) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured",
      });
    }

    const fullName = (req.body.fullName || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const requestedRole = req.body.role;
    const shelterName = (req.body.shelterName || "").trim()
    const contactPhone = (req.body.contactPhone || "").trim()
    const address = (req.body.address || "").trim()
    const city = (req.body.city || "").trim()
    const state = (req.body.state || "").trim()
    const zipCode = (req.body.zipCode || "").trim()
    const website = (req.body.website || "").trim()
    const licenseNumber = (req.body.licenseNumber || "").trim()
    const missionStatement = (req.body.missionStatement || "").trim()
    const yearsOperating = Number(req.body.yearsOperating || 0)
    const animalTypes = Array.isArray(req.body.animalTypes) ? req.body.animalTypes : []

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "password must be at least 8 characters",
      });
    }

    if (requestedRole === 'shelter_admin' && !shelterName) {
      return res.status(400).json({
        message: 'ShelterName is required for shelter accounts'
      })
    }

    const allowedRoles = ["adopter", "shelter_admin"];
    const role = allowedRoles.includes(requestedRole) ? requestedRole : "adopter";

    const existingUser = await User.findOne({ email }).select("_id");

    if (existingUser) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role,
      isActive: true,
    });

    let shelter = null;

    if (role === "shelter_admin"){
      shelter = await Shelter.create({
        adminUserId: user._id,
        name: shelterName,
        contactEmail: email,
        contactPhone,
        address,
        city,
        state,
        zipCode,
        website,
        licenseNumber,
        missionStatement,
        animalTypes,
        yearsOperating,
        approvalStatus:"pending",
        isVerified: false,
      })
    }
    const token = jwt.sign(
      {
        sub: String(user._id),
        role: user.role,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        shelterId:shelter? shelter._id: "",
        shelterName: shelter? shelter.name: "",
        shelterStatus: shelter? shelter.approvalStatus: ""
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
  POST /auth/login
*/
const login = async (req, res, next) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured",
      });
    }

    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("_id fullName email role isActive passwordHash");

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const shelter = user.role === "shelter_admin"
      ? await Shelter.findOne({ adminUserId: user._id }).select("_id name approvalStatus")
      : null;

    const token = jwt.sign(
      {
        sub: String(user._id),
        role: user.role,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        shelterId: shelter?._id || "",
        shelterName: shelter?.name || "",
        shelterStatus: shelter?.approvalStatus || "",
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
  GET /auth/me

*/
const me = async (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

/*
  GET /oauth/bridge

  Runs after express-openid-connect has authenticated the user against Auth0.
  Finds or creates the matching local user, mints our own JWT, and redirects
  back to the SPA with the token so the frontend can establish API auth.
*/
const oauthBridge = async (req, res, next) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured",
      });
    }

    const profile = req.oidc?.user || {};
    const email = (profile.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "OAuth profile did not include an email address",
      });
    }

    let user = await User.findOne({ email }).select(
      "_id fullName email role isActive"
    );

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        fullName: profile.name || profile.nickname || "",
        email,
        passwordHash,
        role: "adopter",
        isActive: true,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    const token = signToken(user, jwtSecret);
    const frontendUrl = (
      process.env.FRONTEND_URL ||
      process.env.CORS_ORIGIN ||
      "http://localhost:5173"
    ).replace(/\/+$/, "");

    return res.redirect(
      `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  oauthBridge,
};
