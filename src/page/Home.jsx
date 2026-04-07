import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import useStudentTermCodes from "../hooks/useTermCodes";
import useGetTermInformation from "../hooks/useGetTermInformation";
import useGetAcademicPerformance from "../hooks/useGetAcademicPerformance";
import TermGpaBar from "../components/TermGpaBar";
import HomeHeader from "../components/HomeHeader";
import GpaMetrics from "../components/GpaMetrics";
import CourseDataView from "../components/CourseDataView";
import "./Home.css";

// Ellucian provided hooks
import { useData, useCardInfo } from "@ellucian/experience-extension-utils";

import { Typography, Card } from "@ellucian/react-design-system/core";

/* ================= CONFIG ================= */
const TABLE_CONFIG = {
  attendanceGood: 75,
  attendanceWarning: 60,
  lowGrades: ["F"],
};

const COLOR_CONFIG = {
  ON_TRACK: "#34930E",
  NEEDS_ATTENTION: "#F3C60F",
  CRITICAL: "#ED1012",
};

const GPA_CONFIG = {
  GOOD: 3.5,
  MEDIUM: 3.0,
};

/* ================= COMPONENT ================= */
const MySuccessTrackerTable = () => {
  const [currentTerm, setCurrentTerm] = useState(null);
  const [termData, setTermData] = useState([]);
  const [currentBannerId, setCurrentBannerId] = useState(null);
  const [currentTermCode, setCurrentTermCode] = useState(null);
  const [latestTermCode, setLatestTermCode] = useState(null); // always the most recent term, never changes on term switch
  const [currentGpa, setCurrentGpa] = useState(0);
  const [termGpa, setTermGpa] = useState(0);
  const [gpaDelta, setGpaDelta] = useState(0);
  const [courseData, setCourseData] = useState([]);
  const [loadingCourseData, setLoadingCourseData] = useState(false);
  const [termGpaData, setTermGpaData] = useState([]);
  const [loadingAllTermGpas, setLoadingAllTermGpas] = useState(false);
  const [initialCourseData, setInitialCourseData] = useState([]);
  const [avgAttendance, setAvgAttendance] = useState(null);
  const [diffAttendance, setDiffAttendance] = useState(null);
  const [isFirstTermFlag, setIsFirstTermFlag] = useState(false);

  const { authenticatedEthosFetch } = useData();
  const { cardId } = useCardInfo();

  // Defined as a constant outside render cycle to avoid stale closure issues
  const blockedTermCodes = useMemo(() => ["199610", "199510", "199520"], []);

  const { getStudentTermCodes, loadingTermCodes, termCodesResult } =
    useStudentTermCodes(authenticatedEthosFetch, cardId);

  const { getStudentDetails, loadingTermInformation } = useGetTermInformation(
    authenticatedEthosFetch,
    cardId,
  );

  const { getAcademicPerformance } = useGetAcademicPerformance(
    authenticatedEthosFetch,
    cardId,
  );

  // Fetch and filter term codes
  useEffect(() => {
    getStudentTermCodes().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const filteredTerms = data
          .filter((item) => !blockedTermCodes.includes(item.termCode))
          .sort((a, b) => a.termCode.localeCompare(b.termCode));

        setTermData(filteredTerms.map((term) => term.term));
        setCurrentTerm(filteredTerms[filteredTerms.length - 1]?.term);
        setCurrentTermCode(filteredTerms[filteredTerms.length - 1]?.termCode);
        setLatestTermCode(filteredTerms[filteredTerms.length - 1]?.termCode);
        setCurrentBannerId(filteredTerms[filteredTerms.length - 1]?.bannerId);
      }
    });
  }, [getStudentTermCodes]);

  // Fetch current term details
  useEffect(() => {
    if (!currentTermCode) return;

    getStudentDetails({ termCode: currentTermCode })
      .then((data) => {
        const cumGpa = parseFloat(data?.cumulativeGpa) || 0;
        const trmGpa = data?.termGpa;
        setCurrentGpa(cumGpa);
        setTermGpa(trmGpa);
        setCurrentBannerId(data?.bannerId);
        setGpaDelta(data?.cgpaDifference);
        setAvgAttendance(data?.averageAttendancePercentage ?? null);
        setDiffAttendance(data?.differenceInAttendance ?? null);
        setIsFirstTermFlag(data?.firstTermFlag ?? false);

        if (Array.isArray(data?.termInformation)) {
          setInitialCourseData(data.termInformation);
        } else {
          setInitialCourseData([]);
        }
      })
      .catch(() => {
        setCurrentGpa(0);
        setTermGpa(0);
        setAvgAttendance(null);
        setDiffAttendance(null);
        setIsFirstTermFlag(false);
        setInitialCourseData([]);
      });
  }, [currentTermCode, currentTerm, getStudentDetails, termCodesResult]);

  // Fetch all term GPAs at once
  useEffect(() => {
    if (!termCodesResult || termCodesResult.length === 0) return;

    const fetchAllTermGpas = async () => {
      setLoadingAllTermGpas(true);
      try {
        const filteredTerms = termCodesResult
          .filter((item) => !blockedTermCodes.includes(item.termCode))
          .sort((a, b) => a.termCode.localeCompare(b.termCode));

        const allTermGpaPromises = filteredTerms.map(async (term) => {
          try {
            const data = await getStudentDetails({ termCode: term.termCode });
            return {
              term: term.term,
              termCode: term.termCode,
              termGpa: data?.termGpa,
              cumulativeGpa: parseFloat(data?.cumulativeGpa) || 0,
            };
          } catch (error) {
            console.error(
              `Error fetching GPA for term ${term.termCode}:`,
              error,
            );
            return {
              term: term.term,
              termCode: term.termCode,
              termGpa: 0,
              cumulativeGpa: 0,
            };
          }
        });

        const allTermGpas = await Promise.all(allTermGpaPromises);
        setTermGpaData(allTermGpas);
      } catch (error) {
        console.error("Error fetching all term GPAs:", error);
      } finally {
        setLoadingAllTermGpas(false);
      }
    };

    fetchAllTermGpas();
  }, [termCodesResult, getStudentDetails]);

  // Fetch academic performance data for each course
  useEffect(() => {
    if (
      !initialCourseData ||
      initialCourseData.length === 0 ||
      !currentTermCode ||
      !currentBannerId
    ) {
      setCourseData([]);
      return;
    }

    const fetchAcademicPerformanceData = async () => {
      setLoadingCourseData(true);
      try {
        const performancePromises = initialCourseData.map(async (course) => {
          try {
            const performanceData = await getAcademicPerformance({
              termCode: currentTermCode,
              crn: course.crn,
              bannerId: currentBannerId,
            });
            return {
              courseNumber: course.courseNumber,
              subjectCode: course.subjectCode,
              crn: course.crn,
              courseTitle: course.courseTitle || "-",
              attendancePercentage: course?.attendancePercentage
                ? parseFloat(course.attendancePercentage)
                : null,
              grade: performanceData?.grade || "-",
              credit: performanceData?.earnedCreditHours || "-",
              gradeMode: performanceData?.gradeMode || "-",
            };
          } catch (error) {
            console.error(
              `Error fetching performance for CRN ${course.crn}:`,
              error,
            );
            return {
              crn: course.crn,
              courseNumber: "-",
              subjectCode: "-",
              courseTitle: course.courseTitle || "-",
              attendancePercentage: null,
              grade: "-",
              credit: course.credit || "-",
              gradeMode: "-",
            };
          }
        });

        const performanceResults = await Promise.all(performancePromises);
        setCourseData(performanceResults);
      } catch (error) {
        console.error("Error fetching academic performance data:", error);
      } finally {
        setLoadingCourseData(false);
      }
    };

    fetchAcademicPerformanceData();
  }, [
    initialCourseData,
    currentTermCode,
    currentBannerId,
    getAcademicPerformance,
  ]);

  const getStatusColor = (value) => {
    if (value === null || value === undefined) return "#999";
    if (value >= TABLE_CONFIG.attendanceGood) return COLOR_CONFIG.ON_TRACK;
    if (value >= TABLE_CONFIG.attendanceWarning)
      return COLOR_CONFIG.NEEDS_ATTENTION;
    return COLOR_CONFIG.CRITICAL;
  };

  const getGpaCircleColor = (gpa) => {
    if (gpa >= GPA_CONFIG.GOOD) return COLOR_CONFIG.ON_TRACK;
    if (gpa >= GPA_CONFIG.MEDIUM) return COLOR_CONFIG.NEEDS_ATTENTION;
    return COLOR_CONFIG.CRITICAL;
  };

  const handleTermChange = (term) => {
    setCourseData([]);
    setCurrentTerm(term.term);
    setCurrentTermCode(term.termCode);
    setCurrentBannerId(term.bannerId);
  };

  const isFirstTerm = useMemo(() => {
    if (!termCodesResult || termCodesResult.length === 0) return false;
    const sorted = termCodesResult
      .filter((item) => !blockedTermCodes.includes(item.termCode))
      .sort((a, b) => a.termCode.localeCompare(b.termCode));
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

  const isLoading = loadingTermInformation;

  return (
    <div className="root">
      <Card className="card">
        <HomeHeader
          currentTerm={currentTerm}
          termCodesResult={termCodesResult}
          blockedTermCodes={blockedTermCodes}
          loadingTermCodes={loadingTermCodes}
          handleTermChange={handleTermChange}
        />

        {isLoading && (
          <Typography
            style={{ padding: "20px", textAlign: "center", color: "#02050c" }}
          >
            Loading student details...
          </Typography>
        )}

        {!isLoading && (
          <>
            <div className="gpa-cards-wrapper">
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <GpaMetrics
                  loadingTermInformation={loadingTermInformation}
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
                />

                {/* TERM GPA BAR CHART */}
                <Card className="term-gpa-bar-card">
                  <TermGpaBar
                    termData={termData}
                    termGpaData={termGpaData}
                    loading={loadingAllTermGpas}
                  />
                </Card>
              </div>
            </div>

            <CourseDataView
              loadingCourseData={loadingCourseData}
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
