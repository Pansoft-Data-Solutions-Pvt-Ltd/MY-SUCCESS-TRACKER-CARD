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
      text: "Monthly Sales Report",
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
    <div style={{ width: "80%", margin: "50px auto" }}>
      <Bar options={options} data={data} />
    </div>
  );
}
