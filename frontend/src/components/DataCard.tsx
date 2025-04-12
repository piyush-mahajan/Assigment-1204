import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import BarChart from "./BarChart";
import DoughnutChart from "./DoughnutChart";

interface DataCardProps {
  title: string;
  data: any;
  totals: any;
  chartType: "bar" | "doughnut" | "table";
}

const DataCard = ({ title, data, totals, chartType }: DataCardProps) => {
  const renderChart = () => {
    if (!data || !totals) return <Typography>Loading...</Typography>;

    if (chartType === "bar") {
      return <BarChart data={data} totals={totals} />;
    } else if (chartType === "doughnut") {
      return <DoughnutChart data={data} totals={totals} />;
    } else if (chartType === "table") {
      const quarters = ["2023-Q3", "2023-Q4", "2024-Q1", "2024-Q2"];
      const customerData = data || {};
      const totalAcv = totals.acv;

      const tableData = {
        "Existing Customer": quarters
          .map((q) => {
            const quarterData = customerData[q]?.["Existing Customer"] || {
              count: 0,
              acv: 0,
            };
            return {
              count: quarterData.count,
              acv: quarterData.acv,
              percentage: ((quarterData.acv / totalAcv) * 100).toFixed(2),
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
            const quarterData = customerData[q]?.["New Customer"] || {
              count: 0,
              acv: 0,
            };
            return {
              count: quarterData.count,
              acv: quarterData.acv,
              percentage: ((quarterData.acv / totalAcv) * 100).toFixed(2),
            };
          })
          .concat([
            {
              count: quarters.reduce(
                (sum, q) =>
                  sum + (customerData[q]?.["New Customer"]?.count || 0),
                0
              ),
              acv: quarters.reduce(
                (sum, q) => sum + (customerData[q]?.["New Customer"]?.acv || 0),
                0
              ),
              percentage: (
                (quarters.reduce(
                  (sum, q) =>
                    sum + (customerData[q]?.["New Customer"]?.acv || 0),
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
        <Table>
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
                      ? ""
                      : tableData[type as keyof typeof tableData][index].count}
                    <br />
                    {`$${Math.round(
                      tableData[type as keyof typeof tableData][index].acv /
                        1000
                    )}K`}
                    <br />
                    {type === "Total"
                      ? ""
                      : `${
                          tableData[type as keyof typeof tableData][index]
                            .percentage
                        }%`}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default DataCard;
