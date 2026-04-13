module.exports = {
  name: "Student Success Tracker",
  publisher: "Pansoft",
  cards: [
    {
      type: "Academic",
      source: "./src/cards/StudentSuccessTrackerCard",
      title: "Student Success Tracker",
      displayCardType: "Student Success Tracker Card",
      description:
        "An Experience extension which provides a consolidated view of a student's academic perforamnce for a given term.",
      configuration: {
        client: [
          {
            key: "excellent_performance_color_code",
            label: "Hex color code for excellent performance",
            type: "text",
            require: false,
            default: "#079C34"
          },
          {
            key: "satisfactory_performance_color_code",
            label: "Hex color code for satisfactory performance",
            type: "text",
            require: false,
            default: "#F5A327"
          },
          {
            key: "poor_performance_color_code",
            label: "Hex color code for poor performance",
            type: "text",
            require: false,
            default: "#F54927"
          },
          {
            key: "minimum_threshold_for_excellent_performance",
            label: "Minimum threshold for excellent performance",
            type: "text",
            require: true,
            default: "3"
          },
          {
            key: "minimum_threshold_for_satisfactory_performance",
            label: "Minimum threshold for satisfactory performance",
            type: "text",
            require: true,
            default: "2"
          },
          {
            key: "minimum_threshold_for_excellent_attendance",
            label: "Minimum threshold for excellent attendance",
            type: "text",
            require: true,
            default: "80"
          },
          {
            key: "minimum_threshold_for_satisfactory_attendance",
            label: "Minimum threshold for satisfactory attendance",
            type: "text",
            require: true,
            default: "60"
          },
          {
            key: "latest_term_information_pipeline",
            label: "Serverless API name for latest term information pipeline",
            type: "text",
            require: true,
            default: "pansoft-x-get-student-latest-term-information"
          },
          {
            key: "student_term_courses_pipeline",
            label: "Serverless API name for student term courses",
            type: "text",
            require: true,
            default: "pansoft-x-get-student-term-courses"
          }
        ],
        server: [
          {
            key: "ethosApiKey",
            label: "Ethos API Key",
            type: "password",
            require: true,
            default: "",
          },
        ],
      },
      pageRoute: {
        route: "/",
        excludeClickSelectors: ["a"],
      },
    },
  ],
  page: {
    source: "./src/page/router.jsx",
    fullWidth: true,
  },
};

