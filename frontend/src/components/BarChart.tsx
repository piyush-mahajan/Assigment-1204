import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface BarChartProps {
  data: any;
  totals: any;
}

const BarChart = ({ data, totals }: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !totals) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const quarters = ["2023-Q3", "2023-Q4", "2024-Q1", "2024-Q2"];
    const customerData = data || {};
    const totalAcv = totals.acv;

    const barData = {
      "2023-Q3": {
        "Existing Customer":
          customerData["2023-Q3"]?.["Existing Customer"]?.acv || 0,
        "New Customer": customerData["2023-Q3"]?.["New Customer"]?.acv || 0,
      },
      "2023-Q4": {
        "Existing Customer":
          customerData["2023-Q4"]?.["Existing Customer"]?.acv || 0,
        "New Customer": customerData["2023-Q4"]?.["New Customer"]?.acv || 0,
      },
      "2024-Q1": {
        "Existing Customer":
          customerData["2024-Q1"]?.["Existing Customer"]?.acv || 0,
        "New Customer": customerData["2024-Q1"]?.["New Customer"]?.acv || 0,
      },
      "2024-Q2": {
        "Existing Customer":
          customerData["2024-Q2"]?.["Existing Customer"]?.acv || 0,
        "New Customer": customerData["2024-Q2"]?.["New Customer"]?.acv || 0,
      },
    };

    const maxAcv = totalAcv; // Use total ACV as max for consistency

    const x0 = d3.scaleBand().domain(quarters).range([0, width]).padding(0.1);

    const x1 = d3
      .scaleBand()
      .domain(["Existing Customer", "New Customer"])
      .range([0, x0.bandwidth()])
      .padding(0.2);

    const y = d3.scaleLinear().domain([0, maxAcv]).range([height, 0]);

    // X-axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text("Closed Fiscal Quarter");

    // Y-axis
    g.append("g")
      .attr("class", "y-axis")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `$${d / 1000000}M`)
      );

    quarters.forEach((quarter) => {
      const groups = g
        .selectAll(`.bar-group-${quarter.replace("-", "")}`)
        .data(["Existing Customer", "New Customer"])
        .enter()
        .append("g")
        .attr("class", `bar-group-${quarter.replace("-", "")}`)
        .attr("transform", `translate(${x0(quarter)},0)`);

      groups
        .append("rect")
        .attr("x", (d) => x1(d) || 0)
        .attr("y", (d) => y(barData[quarter][d]))
        .attr("width", x1.bandwidth())
        .attr("height", (d) => height - y(barData[quarter][d]))
        .attr("fill", (d) =>
          d === "Existing Customer" ? "#1976d2" : "#ff9800"
        )
        .append("title")
        .text((d) => `$${Math.round(barData[quarter][d] / 1000)}K`);

      // Add percentage text on top of each bar
      const totalQuarterAcv =
        barData[quarter]["Existing Customer"] +
        barData[quarter]["New Customer"];
      groups
        .append("text")
        .attr("x", (d) => (x1(d) || 0) + x1.bandwidth() / 2)
        .attr("y", (d) => y(barData[quarter][d]) - 5)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("fill", "#000")
        .style("font-size", "10px")
        .text((d) => {
          const percentage = (
            (barData[quarter][d] / totalQuarterAcv) *
            100
          ).toFixed(0);
          return `${percentage}%`;
        });
    });

    // Add legend
    const legend = g
      .selectAll(".legend")
      .data(["Existing Customer", "New Customer"])
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20 - height})`);

    legend
      .append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", (d) => (d === "Existing Customer" ? "#1976d2" : "#ff9800"));

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text((d) => d);
  }, [data, totals]);

  return <svg ref={svgRef}></svg>;
};

export default BarChart;
