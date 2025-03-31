import { promises as fs } from "fs";
import http from "http";
import { join } from "path";

// Helper function to read and parse JSON files
export const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
};

// Check if port is in use and terminate existing process
export const checkPortAndTerminate = (port, hostname) => {
  return new Promise((resolve) => {
    const testServer = http.createServer();

    testServer.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(
          `Port ${port} is in use, attempting to close existing connection...`
        );
        // Port is in use, we'll try to force close it
        const tempServer = http.createServer();
        tempServer.on("error", (err) => {
          console.error(`Failed to take over port ${port}: ${err.message}`);
          process.exit(1); // Exit if we can't take over the port
        });
        tempServer.listen(port, hostname, () => {
          tempServer.close(() => {
            console.log(`Successfully released port ${port}`);
            resolve();
          });
        });
      } else {
        console.error(`Error checking port: ${err.message}`);
        resolve();
      }
    });

    testServer.once("listening", () => {
      testServer.close(() => {
        resolve();
      });
    });

    testServer.listen(port, hostname);
  });
};

// Variables to track latest log files
let lastResearchLog = 0;
let lastTradeLog = 0;

// Get latest Chain of Thought from log files
export const getLatestCOT = async (logsDir) => {
  try {
    console.log("Searching for logs in:", logsDir);
    const logFiles = await fs.readdir(logsDir);

    const logs = logFiles
      .filter((log) => log.endsWith(".json"))
      .map((log) => log.split(".")[0]);

    const researchLogFileName = logs
      .filter((log) => log.startsWith("deepresearch"))
      ?.map((log) => Number(log.slice(13)))
      .filter((log) => log >= lastResearchLog)
      ?.sort((a, b) => b - a)[0];

    const tradeLogFileName = logs
      .filter((log) => log.startsWith("deeptrade"))
      ?.map((log) => Number(log.slice(10)))
      .filter((log) => log >= lastTradeLog)
      ?.sort((a, b) => b - a)[0];

    console.log("Latest research log:", researchLogFileName);
    console.log("Latest trade log:", tradeLogFileName);

    let cot = "";

    if (researchLogFileName) {
      lastResearchLog = researchLogFileName;
      const researchLogPath = join(
        logsDir,
        `deepresearch-${researchLogFileName.toString()}.json`
      );
      const researchLog = await readJsonFile(researchLogPath);

      const thinkMatch = researchLog.choices[0].message.content.match(
        /<think>(.*?)<\/think>/s
      );
      if (thinkMatch) {
        cot = thinkMatch[1];
      }
    }

    if (tradeLogFileName) {
      lastTradeLog = tradeLogFileName;
      const tradeLogPath = join(
        logsDir,
        `deeptrade-${tradeLogFileName.toString()}.json`
      );
      const tradeLog = await readJsonFile(tradeLogPath);

      const thinkMatch = tradeLog.choices[0].message.content.match(
        /<think>(.*?)<\/think>/s
      );
      if (thinkMatch) {
        cot += thinkMatch[1];
      }
    }

    return cot;
  } catch (error) {
    console.error("Error getting latest COT:", error);
    return "";
  }
};
