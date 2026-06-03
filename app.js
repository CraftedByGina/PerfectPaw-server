const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { auth, requiresAuth } = require("express-openid-connect");
const escape = require("escape-html");

const apiRoutes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const connectMongo = require("./db/connectMongo");
const { oauthBridge } = require("./controllers/auth.controller");

dotenv.config();

const port = Number(process.env.PORT) || 5000;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
const mongoUri = process.env.MONGO_URI || "";

const app = express();

app.use(
  auth({
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    authorizationParams: {
      response_type: "code",
      response_mode: "query",
    },
  })
);
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.type("html").send(`
      <h1>PerfectPaw API</h1>
      <a href="/signup">Signup</a><br>
      <a href="/login">Log in</a><br>
    `);
  }

  const displayName = req.oidc.user?.name || req.oidc.user?.email || "User";

  return res.type("html").send(`
    <p>Logged in as ${escape(displayName)}</p>
    <h1>User Profile</h1>
    <pre>${escape(JSON.stringify(req.oidc.user, null, 2))}</pre>
    <a href="/logout">Log out</a><br>
    <a href="/api/pets">Browse pets API</a>
  `);
});

app.get("/signup", (req, res) => {
  return res.oidc.login({
    returnTo: "/",
    authorizationParams: { screen_hint: "signup" },
  });
});

const googleLogin = (req, res) =>
  res.oidc.login({
    returnTo: "/oauth/bridge",
    authorizationParams: { connection: "google-oauth2" },
  });

app.get("/oauth/login", googleLogin);
app.get("/oauth/signup", googleLogin);

app.get("/oauth/bridge", requiresAuth(), oauthBridge);

app.get("/profile", requiresAuth(), (req, res) => {
  res.json({
    user: req.oidc.user,
  });
});

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectMongo(mongoUri);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
