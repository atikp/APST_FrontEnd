import React from 'react';
import Chart from 'react-apexcharts';

const TwentyFourHourChart = ({ data, symbol, theme, date  }) => {

  // Get the most recent trading day's complete data
  const getMostRecentTradingDayData = (data) => {
    // Sort data to ensure it's in chronological order
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Group data by date
    const dataByDate = sortedData.reduce((acc, item) => {
      const date = new Date(item.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    // Get the dates sorted in descending order
    const sortedDates = Object.keys(dataByDate).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    // Return data for the most recent date with enough data points
    return dataByDate[sortedDates[0]] || [];
  };

  // Get the most recent trading day's complete data
  const twentyFourHourData = getMostRecentTradingDayData(data);

  const chartOptions = {
    fill: {
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.1,
        opacityFrom: 0.1,
        opacityTo: 0.7,
      },
    },
    colors: ['#008FFB'],
    chart: {
      toolbar: {
        offsetY:(window.innerWidth < 507 ? 20 : 0),
        tools: {
          selection: true,
          reset: true,
          zoom:true
        },
      },
      dropShadow: {
        enabled: true,
        opacity: 0.9,
        blur: 7,
        left: -2,
        top: 5
      },
      redrawOnWindowResize:true,
      foreColor: theme = 'dark' ? '#fff' : '#222324',
      background: 'transparent',
      type: 'area',
      height: 350,
      zoom: { enabled: true, allowMouseWheelZoom: false}
    },
    title: {
      text: `${symbol} - Most Recent Trading Day ${date }`,
      align: 'center',
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: (value) => {
          const date = new Date(value);
          return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
        },
      },
      title: { text: 'Time' },
    },
    yaxis: {
      title: { text: 'Price ($)' },
      labels: {
        formatter: (value) => value.toFixed(2),
      },
    },
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
        theme: { mode: theme },
      }}
      series={[
        {
          name: 'Price',
          data: twentyFourHourData.map((item) => ({
            x: new Date(item.date).getTime(),
            y: item.open,
          })),
        },
      ]}
      type="area"
      height={350}
    />
  );
};
export default TwentyFourHourChart;
