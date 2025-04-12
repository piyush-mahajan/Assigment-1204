import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import DataCard from "./components/DataCard";
import axios from "axios";

interface TableDataItem {
  count: number;
  acv: number;
  percentage: string;
}

interface TableData {
  "Existing Customer": TableDataItem[];
  "New Customer": TableDataItem[];
  Total: TableDataItem[];
}

const App = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/data");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data.customerTypes?.aggregated) {
    return <Typography align="center">Loading...</Typography>;
  }

  console.log("Customer Data:", data.customerTypes.aggregated);

  const customerData = data.customerTypes?.aggregated || {};
  const totals = data.customerTypes?.totals || {
    acv: 6363199.5200000005,
    count: 201,
  };
  const quarters = ["2023-Q3", "2023-Q4", "2024-Q1", "2024-Q2"];

  // Calculate total ACV and percentages
  const totalAcv = totals.acv;
  const tableData: TableData = {
    "Existing Customer": quarters
      .map((q) => {
        const quarterData = customerData[q] || {};
        const existingData = quarterData["Existing Customer"] || {
          count: 0,
          acv: 0,
        };
        return {
          count: existingData.count || 0,
          acv: existingData.acv !== undefined ? existingData.acv : 0,
          percentage: (
            ((existingData.acv !== undefined ? existingData.acv : 0) /
              totalAcv) *
            100
          ).toFixed(2),
        };
      })
      .concat([
        {
          count: quarters.reduce(
            (sum, q) =>
              sum + (customerData[q]?.["Existing Customer"]?.count || 0),
            0
          ),
          acv: quarters.reduce(
            (sum, q) =>
              sum + (customerData[q]?.["Existing Customer"]?.acv || 0),
            0
          ),
          percentage: (
            (quarters.reduce(
              (sum, q) =>
                sum + (customerData[q]?.["Existing Customer"]?.acv || 0),
              0
            ) /
              totalAcv) *
            100
          ).toFixed(2),
        },
      ]),
    "New Customer": quarters
      .map((q) => {
        const quarterData = customerData[q] || {};
        const newData = quarterData["New Customer"] || { count: 0, acv: 0 };
        return {
          count: newData.count || 0,
          acv: newData.acv !== undefined ? newData.acv : 0,
          percentage: (
            ((newData.acv !== undefined ? newData.acv : 0) / totalAcv) *
            100
          ).toFixed(2),
        };
      })
      .concat([
        {
          count: quarters.reduce(
            (sum, q) => sum + (customerData[q]?.["New Customer"]?.count || 0),
            0
          ),
          acv: quarters.reduce(
            (sum, q) => sum + (customerData[q]?.["New Customer"]?.acv || 0),
            0
          ),
          percentage: (
            (quarters.reduce(
              (sum, q) => sum + (customerData[q]?.["New Customer"]?.acv || 0),
              0
            ) /
              totalAcv) *
            100
          ).toFixed(2),
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Won ACV mix by Cust Type
      </Typography>

      <Grid
        container
        direction="row"
        sx={{
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {/* <Grid direction="row" container spacing={3}> */}
        <Grid sx={{ width: { xs: "100%", md: "50%" } }}>
          <DataCard
            title="Bar Chart"
            data={customerData}
            totals={totals}
            chartType="bar"
          />
        </Grid>
        <Grid sx={{ width: { xs: "100%", md: "50%" } }}>
          <DataCard
            title="Doughnut Chart"
            data={customerData}
            totals={totals}
            chartType="doughnut"
          />
        </Grid>
      </Grid>
      <Table sx={{ mt: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>Closed Fiscal Quarter</TableCell>
            {[...quarters, "Total"].map((q) => (
              <TableCell key={q} align="center">
                {q}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {["Existing Customer", "New Customer", "Total"].map((type) => (
            <TableRow key={type}>
              <TableCell component="th" scope="row">
                {type}
              </TableCell>
              {[...quarters, "Total"].map((q, index) => (
                <TableCell key={q} align="center">
                  {type === "Total"
                    ? tableData["Total"][0].count
                    : tableData[type as keyof TableData][index].count}
                  <br />
                  {`$${Math.round(
                    (type === "Total"
                      ? tableData["Total"][0].acv
                      : tableData[type as keyof TableData][index].acv) / 1000
                  )}K`}
                  <br />
                  {type === "Total"
                    ? tableData["Total"][0].percentage
                    : `${
                        tableData[type as keyof TableData][index].percentage
                      }%`}
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
