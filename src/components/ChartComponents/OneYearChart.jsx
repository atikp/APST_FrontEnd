import { useMemo } from "react";
import Chart from "react-apexcharts";

const OneYearChart = ({ data, symbol, theme, date }) => {
  // Take the last 12 monthly data points
  
   const processedData = useMemo(() => {
      // Take up to 240 months (20 years)
      const oneYearData = data.slice(-12);
      
      // Transform the data just once when data changes
      return oneYearData.map(item => ({
        x: new Date(item.date).getTime(),
        y: item.open
      }));
    }, [data]);

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
      foreColor:(theme==="dark" ? "#fff" : "#222324"),
      type: "line", 
      height: 350 ,
      zoom: { enabled: true }
    },
    title: { text: `${symbol} - Past Year until ${date}`,align:'left' },
    dataLabels: {
      enabled:false    },
    xaxis: { 
      type: "datetime",
      labels: { 
        formatter: (value) => new Date(value).toLocaleDateString('default', { month: 'short', year: 'numeric' }) 
      }
    },
    yaxis: { title: { text: "Price" } },
    tooltip: {
      theme:theme,
      x: {
        format: 'dd MMM yyyy HH:mm',
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
        data: processedData
      }]}
      type="area"
      height={350}
    />
  );
};

export default OneYearChart;