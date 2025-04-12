import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

// Define interfaces
interface CategoryData {
  count: number;
  acv: number;
  acvPercentage: string;
}

interface AggregatedData {
  [key: string]: { [category: string]: CategoryData };
}

interface TotalsData {
  count: number;
  acv: number;
}

interface Dataset {
  aggregated: AggregatedData;
  totals: TotalsData;
}

interface ApiResponse {
  [key: string]: Dataset;
}

// Initialize Express app
const app = express();
const PORT = 5000;

// Enable CORS for all routes
app.use(cors());

// Data directory
const dataDir = path.join(__dirname, "../data");

// Function to read and parse JSON files
const readJsonFile = (fileName: string): any[] => {
  const filePath = path.join(dataDir, fileName);
  const rawData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(rawData);
};

// Aggregate data by category and quarter
const aggregateData = (data: any[], key: string): AggregatedData => {
  const aggregated: AggregatedData = {};
  data.forEach((item) => {
    const quarter = item.closed_fiscal_quarter;
    const category = item[key];
    if (!aggregated[quarter]) aggregated[quarter] = {};
    if (!aggregated[quarter][category])
      aggregated[quarter][category] = { count: 0, acv: 0, acvPercentage: "0" };
    aggregated[quarter][category].count += item.count || 0;
    aggregated[quarter][category].acv += item.acv || 0;
  });
  return aggregated;
};

// Calculate totals and percentages
const calculateTotals = (aggregated: AggregatedData): TotalsData => {
  const totals: TotalsData = { count: 0, acv: 0 };
  for (const quarter in aggregated) {
    for (const category in aggregated[quarter]) {
      totals.count += aggregated[quarter][category].count;
      totals.acv += aggregated[quarter][category].acv;
    }
  }
  return totals;
};

// Process data for API response
const processData = (): ApiResponse => {
  const customerTypes = readJsonFile("Customer type.json");
  const industries = readJsonFile("Account Industry.json");
  const acvRanges = readJsonFile("ACV Range.json");
  const teams = readJsonFile("Team.json");

  const response: ApiResponse = {
    customerTypes: {
      aggregated: aggregateData(customerTypes, "Cust_Type"),
      totals: calculateTotals(aggregateData(customerTypes, "Cust_Type")),
    },
    industries: {
      aggregated: aggregateData(industries, "Acct_Industry"),
      totals: calculateTotals(aggregateData(industries, "Acct_Industry")),
    },
    acvRanges: {
      aggregated: aggregateData(acvRanges, "ACV_Range"),
      totals: calculateTotals(aggregateData(acvRanges, "ACV_Range")),
    },
    teams: {
      aggregated: aggregateData(teams, "Team"),
      totals: calculateTotals(aggregateData(teams, "Team")),
    },
  };

  // Add percentages to totals
  for (const dataset in response) {
    const totalAcv = response[dataset].totals.acv;
    for (const quarter in response[dataset].aggregated) {
      for (const category in response[dataset].aggregated[quarter]) {
        const item = response[dataset].aggregated[quarter][category];
        item.acvPercentage = totalAcv
          ? ((item.acv / totalAcv) * 100).toFixed(2)
          : "0";
      }
    }
  }

  return response;
};

// API endpoint
app.get("/api/data", (req, res) => {
  try {
    const data = processData();
    res.json(data);
  } catch (error) {
    res.status(500).send("Error processing data");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
