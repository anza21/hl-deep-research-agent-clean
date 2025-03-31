import dotenv from "dotenv";
dotenv.config();

// Define endpoints to test
let endpoints = {
  "GET /health": {},
  "POST /agent": {
    agent_id: "hl-agent-02",
  },
  "POST /cot": {
    agent_id: "hl-agent-02",
  },
  "POST /diary": {
    agent_id: "hl-agent-02",
  },
};

// Store test results in memory
let testResults = {
  lastRun: null,
  curlCommands: {},
};

Object.entries(endpoints).forEach(([endpoint]) => {
  const endpointName = endpoint.split(" ")[1].substring(1); // Extract name from "METHOD /path"
  testResults[endpointName] = null;
  testResults.curlCommands[endpointName] = null;
});

function storeTestResult(testType, result) {
  testResults[testType] = result;
  testResults.lastRun = new Date().toISOString();
  return testResults;
}

function storeCurlCommand(testType, curlCommand) {
  testResults.curlCommands[testType] = curlCommand;
  return testResults;
}

function getTestResults() {
  return testResults;
}

// Generate curl command for an endpoint
function generateCurlCommand(url, method, headers, body) {
  let curlCmd = `curl -X ${method} "${url}"`;
  for (const [key, value] of Object.entries(headers)) {
    curlCmd += ` \\\n  -H "${key}: ${value}"`;
  }
  if (body) {
    curlCmd += ` \\\n  -d '${JSON.stringify(body)}'`;
  }
  return curlCmd;
}

// Generic test function for all endpoints
async function testEndpoint(baseUrl, endpointPath, method, body = null) {
  const endpoint = baseUrl + endpointPath;
  const endpointName = endpointPath.substring(1); // Remove leading slash

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.WEBSERVER_API_KEY,
  };

  // Generate and store curl command
  const curlCmd = generateCurlCommand(endpoint, method, headers, body);
  storeCurlCommand(endpointName, curlCmd);

  try {
    const fetchOptions = {
      method,
      headers,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No response body");
      throw new Error(
        `HTTP error! Status: ${response.status}, Response: ${errorText}`
      );
    }

    const data = await response.json();

    console.log(
      `✅ ${endpointName} endpoint validation passed for ${endpoint}`
    );
    storeTestResult(endpointName, data);
    return data;
  } catch (error) {
    console.error(
      `❌ Error testing ${endpointName} endpoint ${endpoint}:`,
      error.message
    );
    console.error(error.stack);
    const errorResult = { error: error.message };
    storeTestResult(endpointName, errorResult);
    return errorResult;
  }
}

// Run all tests
async function runTests(url) {
  // Test all endpoints using the endpoints object
  for (const [endpoint, body] of Object.entries(endpoints)) {
    const [method, path] = endpoint.split(" ");
    await testEndpoint(
      url,
      path,
      method,
      Object.keys(body).length > 0 ? body : null
    );
  }

  console.log(`✨ Test results available at:`);
  console.log(`- ${url}/test-results?apiKey=${process.env.WEBSERVER_API_KEY}`);
}

// Helper function to generate a test section HTML
function generateTestSectionHtml(endpoint, testData, curlCommand) {
  return `
    <div class="test-section">
      <div class="test-header">
        <span class="test-title">/${endpoint}</span>
        <span class="${testData && !testData.error ? "success" : "failure"}">
          ${testData ? (testData.error ? "❌ Failed" : "✅ Passed") : "Not run"}
        </span>
      </div>
      <div class="section-title">Response:</div>
      <pre>${testData ? JSON.stringify(testData, null, 2) : "No data"}</pre>
      
      <div class="section-title">Curl Command:</div>
      <pre class="curl-command">${
        curlCommand || "No curl command available"
      }</pre>
    </div>
  `;
}

// Helper function to generate CSS styles
function generateStyles() {
  return `
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { color: #333; }
      .test-section { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
      .test-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
      .test-title { font-weight: bold; font-size: 18px; }
      .success { color: green; }
      .failure { color: red; }
      pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; }
      .timestamp { color: #666; font-style: italic; }
      .curl-command { margin-top: 10px; background-color: #333; color: #fff; padding: 10px; border-radius: 5px; }
      .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
    </style>
  `;
}

// Helper function to generate timestamp section
function generateTimestampHtml() {
  return testResults.lastRun
    ? `<p class="timestamp">Last run: ${new Date(
        testResults.lastRun
      ).toLocaleString()}</p>`
    : "<p>No tests have been run yet</p>";
}

// Function to generate HTML view of test results
function generateTestResultsHtml() {
  // Get all endpoint names
  const endpointNames = Object.keys(testResults).filter(
    (key) => key !== "lastRun" && key !== "curlCommands"
  );

  // Generate HTML for each endpoint
  const endpointSections = endpointNames
    .map((endpoint) =>
      generateTestSectionHtml(
        endpoint,
        testResults[endpoint],
        testResults.curlCommands[endpoint]
      )
    )
    .join("");

  // Combine all sections into the final HTML
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>API Test Results</title>
    ${generateStyles()}
  </head>
  <body>
    ${generateTimestampHtml()}
    ${endpointSections}
  </body>
  </html>
  `;

  return html;
}

export {
  runTests,
  getTestResults,
  generateTestResultsHtml,
  storeTestResult,
  storeCurlCommand,
};

if (process.argv[1].endsWith("test_api.js")) {
  runTests();
}
