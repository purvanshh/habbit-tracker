/**
 * Simple server test script
 * Run with: node test-server.js
 */

const http = require("http");

const testEndpoints = [
  { path: "/health", method: "GET" },
  { path: "/", method: "GET" },
];

const testServer = async () => {
  const baseUrl = "http://localhost:3000";

  console.log("🧪 Testing Habit Tracker API Server...\n");

  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
      });

      const data = await response.json();

      console.log(`✅ ${endpoint.method} ${endpoint.path}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(data, null, 2)}\n`);
    } catch (error) {
      console.log(`❌ ${endpoint.method} ${endpoint.path}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
};

// Check if server is running
const checkServer = () => {
  const req = http.request(
    "http://localhost:3000/health",
    { method: "GET" },
    (res) => {
      if (res.statusCode === 200) {
        console.log("✅ Server is running on port 3000");
        testServer();
      } else {
        console.log("❌ Server responded with status:", res.statusCode);
      }
    },
  );

  req.on("error", (error) => {
    console.log("❌ Server is not running. Please start it with: npm run dev");
    console.log("   Error:", error.message);
  });

  req.end();
};

checkServer();
