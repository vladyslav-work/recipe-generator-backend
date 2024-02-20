import express from "express";
import mysql from "mysql";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";

import routes from "./routes/routes.js";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Recipe from "./models/recipes.js";
const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.use(
  cors({ origin: (_, callback) => callback(null, true), credentials: true })
);

app.use(passport.initialize());
app.use(cookieParser());

app.get("/api", (req, res) => {
  res.send("Hello to API");
});

app.use("/api", routes);

app.use(express.static("public"));

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
};

const PORT = process.env.PORT || 5000;

console.log(dbConfig);

async function startServer() {
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
}

startServer();
