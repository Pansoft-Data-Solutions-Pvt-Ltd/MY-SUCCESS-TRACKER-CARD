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

// Labels
const labels = ["January", "February", "March"];

// Chart data (NO faker)
const data = {
  labels,
  datasets: [
    {
      label: "Term GPA",
      data: [120, 450, 300, 700, 200, 900, 500],
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
  ],
};

export default function App() {
  return (
    <div style={{ width: "100%", margin: "0px 0px" }}>
      <Bar options={options} data={data} />
    </div>
  );
}
