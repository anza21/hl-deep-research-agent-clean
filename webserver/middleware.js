import dotenv from "dotenv";

dotenv.config();

// Add request logging middleware
export const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
};

// CORS middleware
export const corsMiddleware = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
};

// Authentication middleware
export const authMiddleware = (req, res, next) => {
  if (req.path !== "/health") {
    const headerApiKey = req.headers["x-api-key"];
    const queryApiKey = req.query.apiKey;
    if (
      headerApiKey !== process.env.WEBSERVER_API_KEY &&
      queryApiKey !== process.env.WEBSERVER_API_KEY
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
  next();
};

// 404 handler
export const notFoundHandler = (req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "404 Not Found" });
};
