import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";

import interviews from "./routes/interviews.js";
import messages from "./routes/messages.js";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.use(cors());

app.use(passport.initialize());
app.use(cookieParser());

app.get("/api", (req, res) => {
  res.send("Hello to API");
});

app.use("/api/interview-sessions", interviews);
app.use("/api/messages", messages);

app.use(express.static("public"));

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Connected to the MySQL database.");

    app.locals.db = connection;

    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1); // Exit the app if connection fails
  }
}

startServer();
