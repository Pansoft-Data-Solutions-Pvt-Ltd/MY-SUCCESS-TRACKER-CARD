import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import useFetch from "../hooks/useFetch";
import TermGpaBar from "../components/TermGpaBar";
import HomeHeader from "../components/HomeHeader";
import GpaMetrics from "../components/GpaMetrics";
import CourseDataView from "../components/CourseDataView";
import "./Home.css";
import TargetGpaModal from "../components/TargetGpaModal";

// Ellucian provided hooks
import { useData, useCardInfo } from "@ellucian/experience-extension-utils";

import { Typography, Card } from "@ellucian/react-design-system/core";

/* ================= CONFIG ================= */
/* ================= COMPONENT ================= */
const MySuccessTrackerTable = () => {
  const [currentTerm, setCurrentTerm] = useState(null);
  const [termData, setTermData] = useState([]);
  const [currentTermCode, setCurrentTermCode] = useState(null);
  const [latestTermCode, setLatestTermCode] = useState(null);
  const [currentGpa, setCurrentGpa] = useState(0);
  const [termGpa, setTermGpa] = useState(0);
  const [gpaDelta, setGpaDelta] = useState(0);
  const [courseData, setCourseData] = useState([]);
  const [termGpaData, setTermGpaData] = useState([]);
  const [avgAttendance, setAvgAttendance] = useState(null);
  const [diffAttendance, setDiffAttendance] = useState(null);
  const [isFirstTermFlag, setIsFirstTermFlag] = useState(false);
  const [termCodesResult, setTermCodesResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { authenticatedEthosFetch } = useData();
  const { cardId, cardConfiguration } = useCardInfo();

  const {
    excellent_performance_color_code,
    satisfactory_performance_color_code,
    poor_performance_color_code,
    minimum_threshold_for_excellent_performance,
    minimum_threshold_for_satisfactory_performance,
    minimum_threshold_for_excellent_attendance,
    minimum_threshold_for_satisfactory_attendance,
    student_term_courses_pipeline,
    student_gpa_recommendation_pipeline,
  } = cardConfiguration;

  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [recommendationError, setRecommendationError] = useState(null);

  const fetchGpaRecommendation = async (gpa) => {
    if (!gpa || !student_gpa_recommendation_pipeline) return;
    setLoadingRecommendation(true);
    setRecommendationResult(null);
    setRecommendationError(null);

    try {
      const queryString = new URLSearchParams({
        cardId,
        targetGpa: gpa,
      }).toString();
      const resourcePath = `${student_gpa_recommendation_pipeline}?${queryString}`;
      const options = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };

      const response = await authenticatedEthosFetch(resourcePath, options);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      let data = await response.text();
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.text) data = jsonData.text;
        else if (jsonData.message) data = jsonData.message;
        else if (jsonData.result) data = jsonData.result;
        else if (typeof jsonData === "string") data = jsonData;
        else data = JSON.stringify(jsonData, null, 2);
      } catch (e) {
        console.error(e);
      }
      setRecommendationResult(data);
    } catch (err) {
      setRecommendationError(err.message || "Something went wrong.");
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleOpenModal = () => {
    setRecommendationResult(null);
    setRecommendationError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Parse config thresholds once — they arrive as strings from cardConfiguration
  const parsed_minimum_threshold_for_excellent_performance = parseFloat(
    minimum_threshold_for_excellent_performance,
  );
  const parsed_minimum_threshold_for_satisfactory_performance = parseFloat(
    minimum_threshold_for_satisfactory_performance,
  );
  const parsed_minimum_threshold_for_excellent_attendance = parseFloat(
    minimum_threshold_for_excellent_attendance,
  );
  const parsed_minimum_threshold_for_satisfactory_attendance = parseFloat(
    minimum_threshold_for_satisfactory_attendance,
  );

  if (
    parsed_minimum_threshold_for_excellent_performance <=
    parsed_minimum_threshold_for_satisfactory_performance
  ) {
    throw new Error(
      "Invalid performance configuration: excellent threshold must be greater than satisfactory threshold",
    );
  }

  if (
    parsed_minimum_threshold_for_excellent_attendance <=
    parsed_minimum_threshold_for_satisfactory_attendance
  ) {
    throw new Error(
      "Invalid attendance configuration: excellent threshold must be greater than satisfactory threshold",
    );
  }

  const COLOR_CONFIG = {
    ON_TRACK: excellent_performance_color_code,
    NEEDS_ATTENTION: satisfactory_performance_color_code,
    CRITICAL: poor_performance_color_code,
  };

  const TABLE_CONFIG = {
    attendanceGood: minimum_threshold_for_excellent_attendance,
    attendanceWarning: minimum_threshold_for_satisfactory_attendance,
    lowGrades: ["F"],
  };

  const {
    loading: dataLoading,
    data: pipelineData,
    error: dataError,
  } = useFetch(
    authenticatedEthosFetch,
    cardId,
    undefined,
    student_term_courses_pipeline,
    {},
  );
  // Fetch and filter term codes
  useEffect(() => {
    if (pipelineData && pipelineData.termData) {
      const allTermCodes = Object.keys(pipelineData.termData);
      const filteredTerms = allTermCodes.sort((a, b) => a.localeCompare(b));

      const newTermCodesResult = filteredTerms.map((tc) => ({
        termCode: tc,
        term: pipelineData.termData[tc]?.termName || tc, // prefer termName, fallback to termCode
        bannerId: pipelineData.bannerId,
      }));

      setTermCodesResult(newTermCodesResult);

      if (filteredTerms.length > 0 && !currentTermCode) {
        const latestTc = filteredTerms[filteredTerms.length - 1];
        const latestTermName =
          pipelineData.termData[latestTc]?.termName || latestTc;
        setLatestTermCode(latestTc);
        setCurrentTermCode(latestTc);
        setCurrentTerm(latestTermName);
        setTermData(newTermCodesResult.map((t) => t.term)); // use termName as labels
      }
    }
  }, [pipelineData, currentTermCode]);

  useEffect(() => {
    if (!pipelineData || !currentTermCode) return;
    const termInfo = pipelineData.termData[currentTermCode];
    if (!termInfo) return;

    setCurrentGpa(termInfo.cumulative_gpa || 0);
    setTermGpa(termInfo.gpa_available ? termInfo.term_gpa || 0 : "N/A");
    setAvgAttendance(termInfo.attendancePercentage);

    // Calculate avg attendance
    const courses = termInfo.courses || [];

    // Edge case: term exists but student has no courses enrolled
    if (courses.length === 0) {
      setCourseData([]);
      setAvgAttendance(null);
      setDiffAttendance(null);
      setGpaDelta(0);
      setIsFirstTermFlag(false);
      return;
    }

    // Calculate mapped courses
    const mappedCourses = courses.map((course) => ({
      courseNumber: course.courseNumber,
      subjectCode: course.subjectCode,
      crn: course.crn,
      courseTitle: course.courseTitle || "-",
      attendancePercentage: course.attendancePercentage
        ? parseFloat(course.attendancePercentage)
        : null,
      grade: course.finalGrade || "-",
      credit: course.creditHours || "-",
      gradeMode: course.gradeMode || "-",
    }));
    setCourseData(mappedCourses);

    // Fetch previous term to compute deltas
    let gpaDiff = 0;
    let attDiff = 0;
    let isFirst = false;

    if (termCodesResult) {
      const currentIndex = termCodesResult.findIndex(
        (t) => t.termCode === currentTermCode,
      );
      if (currentIndex === 0) {
        isFirst = true;
      } else if (currentIndex > 0) {
        const prevTermCode = termCodesResult[currentIndex - 1].termCode;
        const prevTermInfo = pipelineData.termData[prevTermCode];
        if (prevTermInfo) {
          let prevCumGpa = prevTermInfo.cumulative_gpa;

          if (
            prevCumGpa === "N/A" ||
            prevCumGpa === null ||
            prevCumGpa === undefined
          ) {
            prevCumGpa = 0;
          } else {
            prevCumGpa = Number(prevCumGpa);
          }

          gpaDiff = (termInfo.cumulative_gpa || 0) - prevCumGpa;

          const prevAvgAtt = prevTermInfo.attendancePercentage;

          if (avgAttendance !== null && prevAvgAtt !== null) {
            attDiff = avgAttendance - prevAvgAtt;
          } else {
            attDiff = 0;
          }
        }
      }
    }

    setGpaDelta(gpaDiff);
    setDiffAttendance(attDiff);
    setIsFirstTermFlag(isFirst);
  }, [pipelineData, currentTermCode, termCodesResult, avgAttendance]);

  // For term Gpas Bar
  useEffect(() => {
    if (!pipelineData || !termCodesResult) {
      setTermGpaData([]);
      return;
    }

    const allTermGpas = termCodesResult.map((termObj) => {
      const tInfo = pipelineData.termData[termObj.termCode];
      return {
        term: termObj.term,
        termCode: termObj.termCode,
        termGpa: tInfo?.term_gpa || 0,
        cumulativeGpa: tInfo?.cumulative_gpa || 0,
      };
    });
    setTermGpaData(allTermGpas);
  }, [pipelineData, termCodesResult]);

  const getStatusColor = (value) => {
    const parsed_value = parseFloat(value);
    if (isNaN(parsed_value)) return poor_performance_color_code;
    if (parsed_value >= parsed_minimum_threshold_for_excellent_attendance)
      return excellent_performance_color_code;
    if (parsed_value >= parsed_minimum_threshold_for_satisfactory_attendance)
      return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const getGpaCircleColor = (gpa) => {
    const parsed_gpa = parseFloat(gpa);
    if (isNaN(parsed_gpa)) return poor_performance_color_code;
    if (parsed_gpa >= parsed_minimum_threshold_for_excellent_performance)
      return excellent_performance_color_code;
    if (parsed_gpa >= parsed_minimum_threshold_for_satisfactory_performance)
      return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const handleTermChange = (term) => {
    // setCourseData([]); // This is causing an error when clicking on already selected term the course data becomes empty
    setCurrentTerm(term.term);
    setCurrentTermCode(term.termCode);
  };

  const isFirstTerm = useMemo(() => {
    if (!termCodesResult || termCodesResult.length === 0) return false;
    const sorted = termCodesResult.sort((a, b) =>
      a.termCode.localeCompare(b.termCode),
    );
    return sorted[0]?.termCode === currentTermCode;
  }, [termCodesResult, currentTermCode]);

  const isZeroDelta = parseFloat(gpaDelta) === 0;
  const isPositive = gpaDelta >= 0;
  const gpaCircleColor = getGpaCircleColor(currentGpa);
  const termGpaCircleColor = getGpaCircleColor(termGpa);
  const attendanceCircleColor = getStatusColor(avgAttendance);
  const deltaColor = isPositive ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;

  const isLatestTerm = currentTermCode === latestTermCode;
  const attendanceDiff = parseFloat(diffAttendance);
  const isZeroAttendanceDiff = attendanceDiff === 0;
  const isPositiveAttendanceDiff = attendanceDiff > 0;
  const attendanceDiffColor = isPositiveAttendanceDiff
    ? COLOR_CONFIG.ON_TRACK
    : COLOR_CONFIG.CRITICAL;

  const isLoading = dataLoading;
  const hasNoTerms =
    !dataLoading &&
    !dataError &&
    pipelineData &&
    (!pipelineData.termData || Object.keys(pipelineData.termData).length === 0);

  return (
    <div className="root">
      <Card className="card">
        <HomeHeader
          currentTerm={currentTerm}
          termCodesResult={termCodesResult}
          loadingTermCodes={dataLoading}
          handleTermChange={handleTermChange}
        />

        {isLoading && (
          <Typography
            style={{ padding: "20px", textAlign: "center", color: "#02050c" }}
          >
            Loading student details...
          </Typography>
        )}

        {/* Edge case: API returned an error */}
        {!isLoading && dataError && (
          <Typography
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#B91C1C",
              fontStyle: "italic",
            }}
          >
            Failed to load student data. Please try again later.
          </Typography>
        )}

        {/* Edge case: Student not registered for any term */}
        {!isLoading && hasNoTerms && (
          <Typography
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#6B7280",
              fontStyle: "italic",
            }}
          >
            No term registrations found for this student.
          </Typography>
        )}

        {!isLoading && !dataError && !hasNoTerms && termCodesResult && (
          <>
            <div className="gpa-cards-wrapper">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "20px",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <GpaMetrics
                    loadingTermInformation={dataLoading}
                    isFirstTerm={isFirstTerm}
                    isFirstTermFlag={isFirstTermFlag}
                    isZeroDelta={isZeroDelta}
                    isPositive={isPositive}
                    deltaColor={deltaColor}
                    gpaDelta={gpaDelta}
                    gpaCircleColor={gpaCircleColor}
                    currentGpa={currentGpa}
                    termGpaCircleColor={termGpaCircleColor}
                    termGpa={termGpa}
                    isLatestTerm={isLatestTerm}
                    diffAttendance={diffAttendance}
                    isZeroAttendanceDiff={isZeroAttendanceDiff}
                    isPositiveAttendanceDiff={isPositiveAttendanceDiff}
                    attendanceDiffColor={attendanceDiffColor}
                    attendanceCircleColor={attendanceCircleColor}
                    avgAttendance={avgAttendance}
                    colors={COLOR_CONFIG}
                    handleOpenModal={handleOpenModal}
                  />

                  {/* TERM GPA BAR CHART */}
                  <Card className="term-gpa-bar-card">
                    <TermGpaBar
                      termData={termData}
                      termGpaData={termGpaData}
                      loading={dataLoading}
                    />
                  </Card>
                </div>

                {/* Target GPA Button */}
                {/* <div style={{ marginTop: "20px" }}>
                  <Button onClick={handleOpenModal} disabled={!isLatestTerm}>
                    Set Target GPA
                  </Button>
                </div> */}

                {/* Target GPA Modal */}
                <TargetGpaModal
                  open={modalOpen}
                  onClose={handleCloseModal}
                  onSubmit={fetchGpaRecommendation}
                  loading={loadingRecommendation}
                  result={recommendationResult}
                  error={recommendationError}
                />
              </div>
            </div>

            <CourseDataView
              loadingCourseData={dataLoading}
              courseData={courseData}
              getStatusColor={getStatusColor}
              tableConfig={TABLE_CONFIG}
              colors={COLOR_CONFIG}
            />
          </>
        )}
      </Card>
    </div>
  );
};

MySuccessTrackerTable.propTypes = {
  classes: PropTypes.object,
};

export default MySuccessTrackerTable;
