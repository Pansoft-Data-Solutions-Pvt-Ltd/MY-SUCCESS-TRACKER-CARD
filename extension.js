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
            required: false,
          },
          {
            key: "satisfactory_performance_color_code",
            label: "Hex color code for satisfactory performance",
            type: "text",
            required: false,
          },
          {
            key: "poor_performance_color_code",
            label: "Hex color code for poor performance",
            type: "text",
            required: false,
          },
          {
            key: "minimum_threshold_for_excellent_performance",
            label: "Minimum threshold for excellent performance",
            type: "text",
            required: true,
          },
          {
            key: "minimum_threshold_for_satisfactory_performance",
            label: "Minimum threshold for satisfactory performance",
            type: "text",
            required: true,
          },
          {
            key: "minimum_threshold_for_excellent_attendance",
            label: "Minimum threshold for excellent attendance",
            type: "text",
            required: true,
          },
          {
            key: "minimum_threshold_for_satisfactory_attendance",
            label: "Minimum threshold for satisfactory attendance",
            type: "text",
            required: true,
          },
          {
            key: "academic_performance_pipeline",
            label: "Serverless API name for academic performance pipeline",
            type: "text",
            required: true,
            default: "x-pansoft-get-student-academic-performance"
          },
          {
            key: "latest_term_information_pipeline",
            label: "Serverless API name for latest term information pipeline",
            type: "text",
            required: true,
            default: "x-pansoft-get-student-latest-term-information"
          },
          {
            key: "term_information_pipeline",
            label: "Serverless API name for term information pipeline",
            type: "text",
            required: true,
            default: "x-pansoft-get-student-term-information"
          },
          {
            key: "term_codes_pipeline",
            label: "Serverless API name for term codes pipeline",
            type: "text",
            required: true,
            default: "x-pansoft-get-student-term-codes"
          },
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

