import React from "react";
import Chart from "react-apexcharts";

const TwentyYearChart = ({ data, symbol, theme, date  }) => {
  // Take up to 240 months (20 years)
  const twentyYearData = data.slice(-240);

  const chartOptions = {
    fill: {
      gradient: {
          shade:"light",
          type: "horizontal",
          shadeIntensity: 0.1,
          opacityFrom: 0.1,
          opacityTo: 0.7
      }},
      colors:["#008FFB"],
    chart: { 
      toolbar:{
        offsetY:(window.innerWidth < 507 ? 20 : 0),
        tools: {
          reset:false
        }
      },
      dropShadow: {
        enabled: true,
        opacity: 0.9,
        blur: 7,
        left: -2,
        top: 5
      },
      redrawOnWindowResize:true,
      background: 'transparent',
      foreColor:(theme==="dark" ? "#fff" : "#222324"),
      type: "line",
      height: 350 },
    title: { text: `${symbol} - 20 Year History until ${date}`, align:'left' },
    dataLabels: {
      enabled:false    },
    xaxis: { 
      type: "datetime",
      labels: { 
        formatter: (value) => new Date(value).toLocaleDateString('default', { year: 'numeric',month: 'short',day: 'numeric'  }) 
      }
    },
    yaxis: { title: { text: "Price" } },
    tooltip: {
      theme:theme,
      x: {
        format: 'dd MMM yyyy',
      },
      y: {
        formatter: (value) => `$${value.toFixed(2)}`,
      },
    }
    

  };

  return (
    <Chart
      options={{
        ...chartOptions,
        theme: { mode: theme }
      }}
      series={[{
        name: "Price",
        data: twentyYearData.map(item => ({
          x: new Date(item.date).getTime(),
          y: item.open
        }))
      }]}
      type="area"
      height={350}
    />
  );
};

export default TwentyYearChart;