
const http = require("http");
const { createClient } = require("redis");

const PORT = 3000;

// Connect to Redis using the Compose service name
const redis = createClient({
  url: process.env.REDIS_URL || "redis://cache:6379"
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

// Create the web server
const server = http.createServer(async (req, res) => {
  try {
    // Increase the visitor counter stored in Redis
    const visits = await redis.incr("visits");

    res.writeHead(200, { "Content-Type": "text/html" });

    res.end(`
      <html>
        <head>
          <title>Cloud Project 2</title>
        </head>
        <body>
          <h1>Welcome to Cloud Project 2!</h1>
          <p>My Node.js application is running inside Docker.</p>
          <p>Redis is connected successfully!</p>
          <h2>Page visits: ${visits}</h2>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Request error:", err);
    res.writeHead(503, { "Content-Type": "text/plain" });
    res.end("Redis is currently unavailable.");
  }
});

// Connect to Redis before starting the server
async function start() {
  try {
    await redis.connect();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Connected to Redis successfully!");
    });
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1);
  }
}

start();
