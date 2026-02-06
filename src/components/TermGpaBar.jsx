import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// Chart options
const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Term GPA Report",
    },
  },
};

export default function App({ termData, termGpaData }) {
  // Chart data
  const data = {
    labels: termData,
    datasets: [
      {
        label: "Term GPA",
        data: termGpaData?.map((data) => data.termGpa),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div style={{ width: "100%", margin: "0px 0px" }}>
      <Bar options={options} data={data} />
    </div>
  );
}

App.propTypes = {
  termData: PropTypes.arrayOf(
    PropTypes.shape({
      term: PropTypes.string,
    }),
  ),
  termGpaData: PropTypes.array,
};
