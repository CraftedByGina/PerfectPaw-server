const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

const apiRoutes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const connectMongo = require("./db/connectMongo");

dotenv.config();

const port = Number(process.env.PORT) || 5000;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
const mongoUri = process.env.MONGO_URI || "";

const app = express();

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
  res.json({
    message: "PerfectPaw API is running",
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
