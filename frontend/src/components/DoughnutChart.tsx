import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface DoughnutChartProps {
  data: any;
  totals: any;
}

interface PieDataItem {
  label: string;
  value: number;
}

const DoughnutChart = ({ data, totals }: DoughnutChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !totals) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.4;
    const outerRadius = radius * 0.8;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Use data from backend
    const pieData: PieDataItem[] = [
      {
        label: "New Customer",
        value:
          data["2023-Q3"]?.["New Customer"]?.acv +
          data["2023-Q4"]?.["New Customer"]?.acv +
          data["2024-Q1"]?.["New Customer"]?.acv +
          data["2024-Q2"]?.["New Customer"]?.acv,
      },
      {
        label: "Existing Customer",
        value:
          data["2023-Q3"]?.["Existing Customer"]?.acv +
          data["2023-Q4"]?.["Existing Customer"]?.acv +
          data["2024-Q1"]?.["Existing Customer"]?.acv +
          data["2024-Q2"]?.["Existing Customer"]?.acv,
      },
    ];

    const pie = d3.pie<PieDataItem>().value((d) => d.value);
    const arc = d3
      .arc<PieArcDatum<PieDataItem>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const arcs = g
      .selectAll(".arc")
      .data(pie(pieData))
      .enter()
      .append("g")
      .attr("class", "arc");

    // Draw arcs
    arcs
      .append("path")
      .attr("d", arc as any)
      .attr("fill", (d, i) => (i === 0 ? "#ff9800" : "#1976d2"));

    // Add total label in the center
    g.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-size", "1.2em")
      .text(`Total $${Math.round(totals.acv / 1000)}K`);

    // Add external labels with straight callouts
    const labelRadius = outerRadius + 50;
    arcs
      .append("text")
      .attr("transform", (d) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        const x = Math.cos(midAngle) * labelRadius;
        const y = Math.sin(midAngle) * labelRadius;
        return `translate(${x},${y})`;
      })
      .attr("dy", ".35em")
      .style("text-anchor", (d) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? "start" : "end";
      })
      .text((d) => {
        const value = Math.round(d.value / 1000);
        const percentage = ((d.value / totals.acv) * 100).toFixed(0);
        return `$${value}K (${percentage}%)`;
      });

    // Add straight callout lines
    arcs
      .append("line")
      .attr("x1", (d) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return Math.cos(midAngle) * outerRadius;
      })
      .attr("y1", (d) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return Math.sin(midAngle) * outerRadius;
      })
      .attr("x2", (d) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return Math.cos(midAngle) * (labelRadius - 20);
      })
      .attr("y2", (d) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return Math.sin(midAngle) * (labelRadius - 20);
      })
      .attr("stroke", "#000")
      .attr("stroke-width", 1);
  }, [data, totals]);

  return <svg ref={svgRef}></svg>;
};

export default DoughnutChart;
