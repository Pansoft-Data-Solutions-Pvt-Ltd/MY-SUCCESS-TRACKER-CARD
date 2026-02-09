// import React from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Bar } from "react-chartjs-2";
// import PropTypes from "prop-types";
//
// // Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// );
//
// // Chart options
// const options = {
//   responsive: true,
//   plugins: {
//     legend: {
//       position: "top",
//     },
//     title: {
//       display: true,
//       text: "Term GPA Report",
//     },
//   },
// };
//
// export default function App({ termData, termGpaData }) {
//   // Chart data
//   const data = {
//     labels: termData,
//     datasets: [
//       {
//         label: "Term GPA",
//         data: termGpaData?.map((data) => data.termGpa),
//         backgroundColor: "rgba(255, 99, 132, 0.5)",
//       },
//     ],
//   };
//
//   return (
//     <div style={{ width: "100%", margin: "0px 0px" }}>
//       <Bar options={options} data={data} />
//     </div>
//   );
// }
//
// App.propTypes = {
//   termData: PropTypes.arrayOf(
//     PropTypes.shape({
//       term: PropTypes.string,
//     }),
//   ),
//   termGpaData: PropTypes.array,
// };

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  scales: {
    y: {
      min: 0,
      max: 4,
      ticks: {
        stepSize: 1,
        callback: function (value) {
          return value; // Only show whole numbers
        },
      },
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
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div style={{ width: "100%", margin: "0px 0px" }}>
      <Line options={options} data={data} />
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
