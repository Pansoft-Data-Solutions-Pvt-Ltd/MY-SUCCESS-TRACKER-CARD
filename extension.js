module.exports = {
    name: "Student Success Tracker",
    publisher: "Sample",
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
                        key: "goodAttendanceColorCode",
                        label: "Hex color code for good attendance",
                        type: "text",
                        required: false,
                    },
                    {
                        key: "decentAttendanceColorCode",
                        label: "Hex color code for decent attendance",
                        type: "text",
                        required: false,
                    },
                    {
                        key: "poorAttendanceColorCode",
                        label: "Hex color code for bad attendance",
                        type: "text",
                        required: false,
                    },
                    {
                        key: "gpaIncreaseChevronColorCode",
                        label: "Hex color code for chevron when GPA has increased",
                        type: "text",
                        required: false,
                    },
                    {
                        key: "gpaDecreaseChevronColorCode",
                        label: "Hex color code for chevron when GPA has decreased",
                        type: "text",
                        required: false,
                    },
                    {
                        key: "gpaCircleColorCode",
                        label: "Hex color code for the GPA circle",
                        type: "text",
                        required: false,
                    },
                    {
                        key: "academicPerformancePipeline",
                        label: "Serverless API name for academic performance pipeline",
                        type: "text",
                        required: true,
                    },
                    {
                        key: "latestTermInformationPipeline",
                        label: "Serverless API name for latest term information pipeline",
                        type: "text",
                        required: true,
                    },
                    {
                        key: "termInformationPipeline",
                        label: "Serverless API name for term information pipeline",
                        type: "text",
                        required: true,
                    },
                    {
                        key: "termCodesPipeline",
                        label: "Serverless API name for term codes pipeline",
                        type: "text",
                        required: true,
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
