# Assignment 1004 - Data Visualization Dashboard

## Overview
This project creates a data visualization dashboard to display insights from four JSON data files: `Customer type.json`, `Account Industry.json`, `Team.json`, and `ACV Range.json`. The backend processes these files and serves the data via an API, while the frontend, built with ReactJS and Material-UI, consumes the API and visualizes the data using D3.js charts (bar and doughnut). The assignment follows the provided instructions and includes detailed comments for evaluation.

## Project Requirements
- **Backend**: Read JSON files, organize data for frontend use, and serve via API.
- **Frontend**: Consume API, use Material-UI cards, and visualize data with D3.js bar and doughnut charts.
- **Languages**: TypeScript/JavaScript for backend, ReactJS (functional components) for frontend.
- **Submission**: GitHub repository with frontend screenshot.

## Charts and Dashboard
### List of Charts
1. **Customer Type Dashboard**:
   - **Bar Chart**: Side-by-side bars showing ACV for "Existing Customer" and "New Customer" across quarters (2023-Q3, 2023-Q4, 2024-Q1, 2024-Q2).
   - **Doughnut Chart**: Segments representing total ACV for "Existing Customer" and "New Customer".
   - **Table**: Displays count, ACV, and percentages for each quarter and total.
2. **Account Industry Dashboard**:
   - **Bar Chart**: Stacked bars showing ACV by industry (e.g., Manufacturing, Transportation) per quarter.
   - **Doughnut Chart**: Segments for total ACV by industry.
3. **Team Dashboard**:
   - **Bar Chart**: Grouped bars showing ACV by team (e.g., Asia Pac, Europe) per quarter.
   - **Doughnut Chart**: Segments for total ACV by team.
4. **ACV Range Dashboard**:
   - **Bar Chart**: Stacked bars showing ACV by range (e.g., <$20K, $20K-$50K) per quarter.
   - **Doughnut Chart**: Segments for total ACV by range.

### Dashboard Layout
- Each data slice (Customer Type, Account Industry, Team, ACV Range) is displayed in a separate Material-UI card.
- Cards are arranged in a responsive grid layout using Material-UI's `Grid` component.

## Installation and Setup
1. **Clone the Repository**:
   - `git clone <repository-url>`
2. **Install Dependencies**:
   - Navigate to the project root: `cd <project-directory>`
   - Run `npm install` to install backend and frontend dependencies.
3. **Start the Backend**:
   - Navigate to the backend directory: `cd backend`
   - Run `npm start` or as per backend configuration to serve API at `http://localhost:5000/api/data`.
4. **Start the Frontend**:
   - Navigate to the frontend directory: `cd frontend`
   - Run `npm run dev` to start the Vite development server.
5. **Access the Application**:
   - Open `http://localhost:5173` in your browser.

## Code Details

### Backend (Example server.ts)
```typescript
import express from 'express';
import fs from 'fs';
import path from 'path';

// Initialize Express app
const app = express();
const port = 5000;

// Read and organize JSON data
const dataDir = path.join(__dirname, 'data');
const data = {
  customerTypes: JSON.parse(fs.readFileSync(path.join(dataDir, 'Customer type.json'), 'utf8')),
  industries: JSON.parse(fs.readFileSync(path.join(dataDir, 'Account Industry.json'), 'utf8')),
  teams: JSON.parse(fs.readFileSync(path.join(dataDir, 'Team.json'), 'utf8')),
  acvRanges: JSON.parse(fs.readFileSync(path.join(dataDir, 'ACV Range.json'), 'utf8')),
};

// API endpoint to serve data
app.get('/api/data', (req, res) => {
  res.json(data); // Send organized data as response
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
```

### Frontend (App.tsx)
```tsx
import { useState, useEffect } from "react"; // React hooks for state and side effects
import {
  Container, // Container for layout
  Grid, // Grid for responsive design
  Typography, // Text for headings
  Table, // Table for data display
  TableBody, // Table body
  TableCell, // Table cells
  TableHead, // Table header
  TableRow, // Table rows
} from "@mui/material"; // Material-UI components
import DataCard from "./components/DataCard"; // Custom card component
import axios from "axios"; // HTTP client for API calls

// Interface for table data items
interface TableDataItem {
  count: number; // Number of opportunities
  acv: number; // Annual Contract Value
  percentage: string; // Percentage of total
}

// Interface for table data structure
interface TableData {
  "Existing Customer": TableDataItem[]; // Data for Existing Customer
  "New Customer": TableDataItem[]; // Data for New Customer
  Total: TableDataItem[]; // Total data
}

// Main App component
const App = () => {
  const [data, setData] = useState<any>({}); // State for API data
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  // Fetch data from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/data"); // API call
        setData(response.data); // Update state with data
      } catch (error) {
        console.error("Error fetching data:", error); // Log errors
      } finally {
        setLoading(false); // End loading
      }
    };
    fetchData(); // Execute fetch
  }, []);

  // Show loading if data is not ready
  if (loading || !data.customerTypes?.aggregated) {
    return <Typography align="center">Loading...</Typography>;
  }

  console.log("Customer Data:", data.customerTypes.aggregated); // Debug log

  const customerData = data.customerTypes?.aggregated || {}; // Extract customer data
  const totals = data.customerTypes?.totals || { acv: 6363199.5200000005, count: 201 }; // Default totals
  const quarters = ["2023-Q3", "2023-Q4", "2024-Q1", "2024-Q2"]; // Quarters list

  // Prepare table data
  const totalAcv = totals.acv; // Total ACV
  const tableData: TableData = {
    "Existing Customer": quarters.map((q) => {
      const quarterData = customerData[q] || {}; // Default empty object
      const existingData = quarterData["Existing Customer"] || { count: 0, acv: 0 }; // Default values
      return {
        count: existingData.count || 0, // Safe count
        acv: existingData.acv !== undefined ? existingData.acv : 0, // Safe acv
        percentage: ((existingData.acv !== undefined ? existingData.acv : 0) / totalAcv * 100).toFixed(2), // Calculate percentage
      };
    }).concat([ // Add total row
      {
        count: quarters.reduce((sum, q) => sum + (customerData[q]?.["Existing Customer"]?.count || 0), 0),
        acv: quarters.reduce((sum, q) => sum + (customerData[q]?.["Existing Customer"]?.acv || 0), 0),
        percentage: ((quarters.reduce((sum, q) => sum + (customerData[q]?.["Existing Customer"]?.acv || 0), 0) / totalAcv) * 100).toFixed(2),
      },
    ]),
    "New Customer": quarters.map((q) => {
      const quarterData = customerData[q] || {};
      const newData = quarterData["New Customer"] || { count: 0, acv: 0 };
      return {
        count: newData.count || 0,
        acv: newData.acv !== undefined ? newData.acv : 0,
        percentage: ((newData.acv !== undefined ? newData.acv : 0) / totalAcv * 100).toFixed(2),
      };
    }).concat([ // Add total row
      {
        count: quarters.reduce((sum, q) => sum + (customerData[q]?.["New Customer"]?.count || 0), 0),
        acv: quarters.reduce((sum, q) => sum + (customerData[q]?.["New Customer"]?.acv || 0), 0),
        percentage: ((quarters.reduce((sum, q) => sum + (customerData[q]?.["New Customer"]?.acv || 0), 0) / totalAcv) * 100).toFixed(2),
      },
    ]),
    Total: [
      {
        count: totals.count || 201,
        acv: totalAcv,
        percentage: "100",
      },
    ],
  };

  // Render dashboard
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Won ACV mix by Cust Type
      </Typography>
      <Grid container spacing={3}>
        <Grid sx={{ width: { xs: "100%", md: "50%" } }}>
          <DataCard title="Bar Chart" data={customerData} totals={totals} chartType="bar" />
        </Grid>
        <Grid sx={{ width: { xs: "100%", md: "50%" } }}>
          <DataCard title="Doughnut Chart" data={customerData} totals={totals} chartType="doughnut" />
        </Grid>
      </Grid>
      <Table sx={{ mt: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>Closed Fiscal Quarter</TableCell>
            {[...quarters, "Total"].map((q) => <TableCell key={q} align="center">{q}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {["Existing Customer", "New Customer", "Total"].map((type) => (
            <TableRow key={type}>
              <TableCell component="th" scope="row">{type}</TableCell>
              {[...quarters, "Total"].map((q, index) => (
                <TableCell key={q} align="center">
                  {type === "Total" ? tableData["Total"][0].count : tableData[type as keyof TableData][index].count}
                  <br />
                  {`$${Math.round((type === "Total" ? tableData["Total"][0].acv : tableData[type as keyof TableData][index].acv) / 1000)}K`}
                  <br />
                  {type === "Total" ? tableData["Total"][0].percentage : `${tableData[type as keyof TableData][index].percentage}%`}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default App;
```

## Final Submission Instructions
1. **Create a GitHub Repository**:
   - Initialize a new repository (e.g., `assignment-1004`).
   - Push the project files:
     - `git init`
     - `git add .`
     - `git commit -m "Initial commit with backend and frontend code"`
     - `git remote add origin <repository-url>`
     - `git push -u origin main`
2. **Add a Screenshot**:
   ![image](https://github.com/user-attachments/assets/3aecedff-a170-42cf-b36a-f3063098d095)
![image](https://github.com/user-attachments/assets/3f813909-1c53-4837-88c2-076c88cc09da)

