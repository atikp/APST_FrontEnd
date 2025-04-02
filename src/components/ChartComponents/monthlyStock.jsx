import React from "react";
import Chart from "react-apexcharts";

const OneMonthChart = ({ data, symbol, theme, date }) => {

  // Use full month of intraday data
  const chartOptions = {

    fill: {
      gradient: {
          shade:"dark",
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
      foreColor:(theme = "dark" ? "#fff" : "#222324"),
      type: "line", 
      height: 350,
      zoom: { enabled: true }
    },
    title: { 
      text: `${symbol} - Past Month until ${ date }`,
      align: 'center'
    },
    dataLabels: {
      enabled:false    },
    xaxis: { 
      type: "datetime",
      labels: { 
        formatter: (value) => new Date(value).toLocaleDateString([], { 
          month: 'short', 
          day: 'numeric' 
        })
      },
      title: { text: "Date" }
    },
    yaxis: { 
      title: { text: "Price ($)" },
      labels: {
        formatter: (value) => value.toFixed(2)
      }
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy'
      },
      y: {
        formatter: (value) => `$${value.toFixed(2)}`
      }
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
        data: data.map(item => ({
          x: new Date(item.date).getTime(),
          y: item.open
        }))
      }]}
      type="area"
      height={350}
    />
  );
};

export default OneMonthChart;