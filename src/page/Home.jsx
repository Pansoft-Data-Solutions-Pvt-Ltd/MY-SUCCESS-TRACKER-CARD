import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import DoubleChevronIcon from "../components/DoubleChevron";
import useStudentTermCodes from "../hooks/useTermCodes";
import useGetTermInformation from "../hooks/useGetTermInformation";
import useGetAcademicPerformance from "../hooks/useGetAcademicPerformance";
import TermGpaBar from "../components/TermGpaBar";
import "./Home.css";

// Ellucian provided hooks
import { useData, useCardInfo } from "@ellucian/experience-extension-utils";

import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Card,
  DropdownButtonItem,
} from "@ellucian/react-design-system/core";

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

  const backHref = useMemo(() => {
    const segments = window?.location?.pathname?.split("/").filter(Boolean);
    if (segments.length > 0) {
      return `${window.location.origin}/${segments[0]}/`;
    }
    return window.location.origin;
  }, []);

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

  const handleBack = () => {
    window.location.assign(backHref);
  };

  return (
    <div className="root">
      <Card className="card">
        <div className="card-header">
          <div className="back-button-wrapper">
            <Button color="secondary" onClick={handleBack}>
              Back
            </Button>
          </div>

          <div>
            <Typography
              variant="h4"
              className="card-title"
              style={{ fontWeight: 700, color: "#1F2937", textAlign: "center" }}
            >
              Academic Performance{currentTerm ? ` – ${currentTerm}` : ""}
            </Typography>
          </div>

          <div className="top-bar">
            <div className="term-section">
              <Typography className="term-label">Select Term</Typography>
              <Button
                disabled={loadingTermCodes || !termCodesResult}
                dropdown={termCodesResult
                  ?.filter((item) => !blockedTermCodes.includes(item.termCode))
                  .sort((a, b) => a.termCode.localeCompare(b.termCode))
                  .map((term) => (
                    <DropdownButtonItem
                      key={term.termCode}
                      onClick={() => handleTermChange(term)}
                    >
                      {term.term}
                    </DropdownButtonItem>
                  ))}
              >
                {loadingTermCodes ? "Loading…" : currentTerm || "Select Term"}
              </Button>
            </div>
          </div>
        </div>

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
                {/* COLUMN FOR CUMULATIVE GPA, TERM GPA, TERM ATTENDANCE */}
                <div className="gpa-cards-column">
                  <div style={{ display: "flex", gap: "20px" }}>
                    {/* CUMULATIVE GPA CARD */}
                    <Card className="gpa-top-card">
                      <div className="gpa-left">
                        <Typography
                          variant="p"
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            color: "#1F2937",
                          }}
                        >
                          Cumulative GPA
                        </Typography>
                        {!isFirstTerm && (
                          <div className="gpa-delta-row">
                            {isZeroDelta ? (
                              <Typography
                                className="gpa-delta-text"
                                style={{ fontWeight: 500 }}
                              >
                                <span
                                  style={{ color: "#6B7280", fontWeight: 700 }}
                                >
                                  Same as Last Term
                                </span>
                              </Typography>
                            ) : (
                              <>
                                <DoubleChevronIcon
                                  orientation={isPositive ? "up" : "down"}
                                  size={20}
                                  backgroundColor={deltaColor}
                                  style={{ transform: "translateY(4px)" }}
                                />
                                <Typography
                                  className="gpa-delta-text"
                                  style={{
                                    fontWeight: 500,
                                    top: "2px",
                                    position: "relative",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: deltaColor,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {gpaDelta}
                                  </span>
                                  <span
                                    style={{ marginLeft: 3, color: "#6B7280" }}
                                  >
                                    {" "}
                                    From Last Term
                                  </span>
                                </Typography>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div
                        className="gpa-circle"
                        style={{
                          borderColor: gpaCircleColor,
                          color: gpaCircleColor,
                        }}
                      >
                        {loadingTermInformation ? "..." : currentGpa.toFixed(2)}
                      </div>
                    </Card>

                    {/* TERM GPA CARD */}
                    <Card className="term-gpa-card">
                      <div className="gpa-left">
                        <Typography
                          variant="p"
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            color: "#0369A1",
                          }}
                        >
                          Term GPA
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{
                            fontSize: "0.875rem",
                            color: "#0C4A6E",
                            marginTop: "10px",
                            fontWeight: 500,
                          }}
                        >
                          Current term performance
                        </Typography>
                      </div>
                      <div
                        className="gpa-circle"
                        style={{
                          borderColor: termGpaCircleColor,
                          color: termGpaCircleColor,
                        }}
                      >
                        {loadingTermInformation ? "..." : termGpa}
                      </div>
                    </Card>

                    {/* TERM ATTENDANCE CARD */}
                    <Card className="term-attendance-card">
                      <div className="gpa-left">
                        <Typography
                          variant="p"
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            color: "#065F46",
                          }}
                        >
                          Term Attendance
                        </Typography>
                        {isLatestTerm && (
                          <div className="gpa-delta-row">
                            <Typography
                              className="gpa-delta-text"
                              style={{
                                fontWeight: 500,
                                top: "2px",
                                position: "relative",
                              }}
                            >
                              Attendance Til Date
                            </Typography>
                          </div>
                        )}
                        {!isFirstTermFlag && !isLatestTerm && diffAttendance != null && (
                          <div className="gpa-delta-row">
                            {isZeroAttendanceDiff ? (
                              <Typography
                                className="gpa-delta-text"
                                style={{ fontWeight: 500 }}
                              >
                                <span
                                  style={{ color: "#6B7280", fontWeight: 700 }}
                                >
                                  Same as Last Term
                                </span>
                              </Typography>
                            ) : (
                              <>
                                <DoubleChevronIcon
                                  orientation={
                                    isPositiveAttendanceDiff ? "up" : "down"
                                  }
                                  size={20}
                                  backgroundColor={attendanceDiffColor}
                                  style={{ transform: "translateY(4px)" }}
                                />
                                <Typography
                                  className="gpa-delta-text"
                                  style={{
                                    fontWeight: 500,
                                    top: "2px",
                                    position: "relative",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: attendanceDiffColor,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {Math.abs(attendanceDiff)}%
                                  </span>
                                  <span
                                    style={{ marginLeft: 3, color: "#6B7280" }}
                                  >
                                    {" "}
                                    From Last Term
                                  </span>
                                </Typography>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div
                        className="gpa-circle"
                        style={{
                          borderColor: attendanceCircleColor,
                          color: attendanceCircleColor,
                        }}
                      >
                        {loadingTermInformation
                          ? "..."
                          : avgAttendance != null
                            ? `${avgAttendance}%`
                            : "N/A"}
                      </div>
                    </Card>
                  </div>

                  <div className="legends-container">
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div className="legend-item">
                        <div
                          className="legend-dot"
                          style={{ backgroundColor: COLOR_CONFIG.ON_TRACK }}
                        />
                        <Typography variant="body2" style={{ fontWeight: 500 }}>
                          On Track
                        </Typography>
                      </div>
                      <div className="legend-item">
                        <div
                          className="legend-dot"
                          style={{
                            backgroundColor: COLOR_CONFIG.NEEDS_ATTENTION,
                          }}
                        />
                        <Typography variant="body2" style={{ fontWeight: 500 }}>
                          Needs Attention
                        </Typography>
                      </div>
                      <div className="legend-item">
                        <div
                          className="legend-dot"
                          style={{ backgroundColor: COLOR_CONFIG.CRITICAL }}
                        />
                        <Typography variant="body2" style={{ fontWeight: 500 }}>
                          Critical
                        </Typography>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <Typography
                        variant="body2"
                        style={{ fontWeight: 500, color: "#1F2937" }}
                      >
                        A, B, C, D = Letter Grades
                      </Typography>
                      <Typography
                        variant="body2"
                        style={{ fontWeight: 500, color: "#1F2937" }}
                      >
                        F = Fail
                      </Typography>
                      <Typography
                        variant="body2"
                        style={{ fontWeight: 500, color: "#03060c" }}
                      >
                        N/A = Not Applicable
                      </Typography>
                    </div>
                  </div>
                </div>

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
          </>
        )}

        {/* DESKTOP TABLE VIEW */}
        {!isLoading && (
          <div className="table-container">
            <Table className="table">
              <TableHead>
                <TableRow>
                  <TableCell className="header-cell">Course</TableCell>
                  <TableCell className="header-cell">Grade</TableCell>
                  <TableCell className="header-cell">Credits Earned</TableCell>
                  <TableCell className="header-cell last-cell">
                    Attendance
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingCourseData ? (
                  <TableRow>
                    <TableCell colSpan={4} className="body-cell">
                      <Typography
                        style={{ color: "#6B7280", fontStyle: "italic" }}
                      >
                        {loadingCourseData
                          ? "Loading course data..."
                          : "No course data available for this term"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  courseData.map((row, index) => {
                    const attendanceColor = getStatusColor(
                      row.attendancePercentage,
                    );
                    const isLowGrade = TABLE_CONFIG.lowGrades.includes(
                      row.grade,
                    );
                    const attendanceDisplay =
                      row.attendancePercentage !== null
                        ? `${row.attendancePercentage}%`
                        : "N/A";

                    return (
                      <TableRow key={row.crn || index} className="table-row">
                        <TableCell className="body-cell">
                          <div style={{ display: "flex", gap: "10px" }}>
                            <Typography variant="body2">
                              {row.subjectCode}-{row.courseNumber}
                            </Typography>
                            <Typography
                              variant="caption"
                              style={{ color: "#6B7280" }}
                            >
                              {row.courseTitle}
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell
                          className={`body-cell ${isLowGrade ? "low-grade" : ""}`}
                        >
                          {row?.grade}
                        </TableCell>
                        <TableCell className="body-cell">
                          <Typography variant="body2">{row?.credit}</Typography>
                        </TableCell>
                        <TableCell className="body-cell last-cell">
                          <div className="progress-wrapper">
                            {row.attendancePercentage !== null ? (
                              <>
                                <div className="progress-bar">
                                  <div
                                    className="progress-fill"
                                    style={{
                                      width: `${row.attendancePercentage}%`,
                                      backgroundColor: attendanceColor,
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    color: attendanceColor,
                                    fontWeight: 400,
                                    fontSize: "0.95rem",
                                    minWidth: "60px",
                                  }}
                                >
                                  {attendanceDisplay}
                                </span>
                              </>
                            ) : (
                              <span
                                style={{ color: "#999", fontStyle: "italic" }}
                              >
                                {attendanceDisplay}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* MOBILE CARD VIEW */}
        {!isLoading && (
          <div className="mobile-card-list">
            {courseData.length === 0 ? (
              <Typography
                style={{
                  textAlign: "center",
                  color: "#6B7280",
                  fontStyle: "italic",
                  padding: "30px",
                }}
              >
                {loadingCourseData
                  ? "Loading course data..."
                  : "No course data available for this term"}
              </Typography>
            ) : (
              courseData.map((row, index) => {
                const attendanceColor = getStatusColor(
                  row.attendancePercentage,
                );
                const isLowGrade = TABLE_CONFIG.lowGrades.includes(row?.grade);
                const attendanceDisplay =
                  row.attendancePercentage !== null
                    ? `${row.attendancePercentage}%`
                    : "N/A";

                return (
                  <div key={row.crn || index} className="mobile-card">
                    <div className="mobile-card-header">
                      <div className="mobile-card-title">
                        <Typography
                          variant="body1"
                          style={{ fontWeight: 700, marginBottom: "4px" }}
                        >
                          {row.crn}
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{ color: "#6B7280" }}
                        >
                          {row.courseTitle}
                        </Typography>
                      </div>
                      <div
                        className="mobile-card-grade"
                        style={{
                          color: isLowGrade ? COLOR_CONFIG.CRITICAL : "#1F2937",
                        }}
                      >
                        {row.grade}
                      </div>
                    </div>
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Credits</span>
                      <span className="mobile-card-value">{row.credit}</span>
                    </div>
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Attendance</span>
                      <div className="mobile-progress-wrapper">
                        {row.attendancePercentage !== null ? (
                          <>
                            <div className="mobile-progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${row.attendancePercentage}%`,
                                  backgroundColor: attendanceColor,
                                }}
                              />
                            </div>
                            <span
                              style={{
                                color: attendanceColor,
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                minWidth: "55px",
                                textAlign: "right",
                              }}
                            >
                              {attendanceDisplay}
                            </span>
                          </>
                        ) : (
                          <span
                            style={{
                              color: "#999",
                              fontStyle: "italic",
                              fontSize: "0.875rem",
                            }}
                          >
                            {attendanceDisplay}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

MySuccessTrackerTable.propTypes = {
  classes: PropTypes.object,
};

export default MySuccessTrackerTable;
