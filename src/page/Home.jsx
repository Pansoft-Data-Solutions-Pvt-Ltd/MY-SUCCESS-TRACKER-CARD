import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@ellucian/react-design-system/core/styles";
import DoubleChevronIcon from "../components/DoubleChevron";
import useStudentTermCodes from "../hooks/useTermCodes";
import useStudentDetails from "../hooks/useStudentDetails";
import useStudentGpa from "../hooks/useStudentGpa";
import useStudentAttendance from "../hooks/useStudentAttendance";
import TermGpaBar from "../components/TermGpaBar";

// Ellucian provided hooks
import {
  useData,
  useCardInfo,
  usePageControl,
} from "@ellucian/experience-extension-utils";

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

import {
  spacing10,
  spacing20,
  spacing30,
  spacing40,
  widthFluid,
} from "@ellucian/react-design-system/core/styles/tokens";

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

/* ================= STYLES ================= */
const styles = {
  root: {
    width: widthFluid,
    margin: "0 auto",
    padding: `${spacing20} ${spacing20} ${spacing40}`,
    maxWidth: "1400px",
    "@media (min-width: 768px)": {
      padding: `${spacing30} ${spacing30} ${spacing40}`,
    },
  },
  backButtonWrapper: {
    marginBottom: spacing20,
    "@media (min-width: 768px)": {
      marginBottom: spacing30,
    },
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing10,
    padding: `${spacing10} ${spacing20}`,
    backgroundColor: "#FFFFFF",
    border: "2px solid #026BC8",
    borderRadius: "8px",
    color: "#026BC8",
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    "@media (min-width: 768px)": {
      fontSize: "0.95rem",
    },
    "&:hover": {
      backgroundColor: "#026BC8",
      color: "#FFFFFF",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    },
  },
  topBar: {
    display: "flex",
    flexDirection: "column",
    gap: spacing20,
    marginBottom: spacing30,
    "@media (min-width: 768px)": {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing40,
      marginBottom: spacing40,
    },
  },
  termSection: {
    display: "flex",
    flexDirection: "column",
    gap: spacing10,
    width: "100%",
    "@media (min-width: 768px)": {
      width: "auto",
    },
  },
  termLabel: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#1F2937",
    "@media (min-width: 768px)": {
      fontSize: "1.1rem",
    },
  },
  gpaTopCard: {
    padding: spacing20,
    width: "100%",
    minHeight: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    "@media (min-width: 768px)": {
      padding: spacing30,
      minWidth: "280px",
      width: "auto",
      height: "110px",
      marginLeft: "auto",
    },
  },
  gpaLeft: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    paddingRight: spacing20,
    "@media (min-width: 768px)": {
      paddingRight: "100px",
      transform: "translateY(-5px)",
    },
  },
  gpaCircle: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    border: "4px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1.2rem",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    flexShrink: 0,
    "@media (min-width: 768px)": {
      width: "80px",
      height: "80px",
      fontSize: "1.3rem",
      position: "absolute",
      right: spacing30,
      top: "50%",
      transform: "translateY(-50%)",
    },
  },
  gpaDeltaRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing10,
    marginTop: spacing10,
    flexWrap: "wrap",
    "@media (min-width: 768px)": {
      position: "relative",
      top: "-3px",
    },
  },
  gpaDeltaText: {
    fontSize: "0.875rem",
    "@media (min-width: 768px)": {
      fontSize: "1rem",
    },
  },
  card: {
    padding: spacing20,
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid #E5E7EB",
    "@media (min-width: 768px)": {
      padding: spacing30,
    },
  },
  cardHeader: {
    marginBottom: spacing20,
    paddingBottom: spacing20,
    borderBottom: "2px solid #E5E7EB",
  },
  cardTitle: {
    fontSize: "1.25rem",
    "@media (min-width: 768px)": {
      fontSize: "1.5rem",
    },
  },
  // Desktop table styles
  tableContainer: {
    display: "none",
    "@media (min-width: 768px)": {
      display: "block",
      overflowX: "auto",
    },
  },
  table: {
    width: "100%",
    tableLayout: "fixed",
    border: "1px solid #D1D5DB",
    borderCollapse: "collapse",
    borderRadius: "8px",
    overflow: "hidden",
  },
  headerCell: {
    backgroundColor: "#026BC8",
    color: "#FFFFFF",
    fontWeight: 600,
    textAlign: "center",
    height: "52px",
    borderRight: "1px solid rgba(255, 255, 255, 0.2)",
    width: "25%",
    fontSize: "1rem",
  },
  bodyCell: {
    textAlign: "center",
    borderBottom: "1px solid #E5E7EB",
    borderRight: "1px solid #E5E7EB",
    width: "25%",
    padding: spacing20,
    transition: "background-color 0.2s ease",
  },
  tableRow: {
    "&:hover": {
      backgroundColor: "#F9FAFB",
    },
  },
  lastCell: {
    borderRight: "none",
  },
  lowGrade: {
    color: COLOR_CONFIG.CRITICAL,
    fontWeight: 700,
    fontSize: "1.1rem",
  },
  progressWrapper: {
    display: "flex",
    alignItems: "center",
    gap: spacing10,
    justifyContent: "center",
  },
  progressBar: {
    flexGrow: 1,
    height: "8px",
    borderRadius: "6px",
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  // Mobile card list styles
  mobileCardList: {
    display: "flex",
    flexDirection: "column",
    gap: spacing20,
    "@media (min-width: 768px)": {
      display: "none",
    },
  },
  mobileCard: {
    padding: spacing20,
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    transition: "box-shadow 0.2s ease",
    "&:active": {
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
  },
  mobileCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing20,
    paddingBottom: spacing20,
    borderBottom: "2px solid #E5E7EB",
  },
  mobileCardTitle: {
    flex: 1,
    paddingRight: spacing10,
  },
  mobileCardGrade: {
    fontSize: "1.5rem",
    fontWeight: 700,
    minWidth: "50px",
    textAlign: "right",
  },
  mobileCardRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${spacing10} 0`,
    borderBottom: "1px solid #F3F4F6",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  mobileCardLabel: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#6B7280",
  },
  mobileCardValue: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#1F2937",
  },
  mobileProgressWrapper: {
    display: "flex",
    alignItems: "center",
    gap: spacing10,
    flex: 1,
    justifyContent: "flex-end",
  },
  mobileProgressBar: {
    flexGrow: 1,
    maxWidth: "120px",
    height: "8px",
    borderRadius: "6px",
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  legendSection: {
    marginTop: spacing20,
    marginBottom: spacing30,
  },
  legendTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#1F2937",
    marginBottom: spacing20,
    "@media (min-width: 768px)": {
      fontSize: "1rem",
    },
  },
  legendGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: spacing20,
    "@media (min-width: 640px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  },
  gradeLegendBar: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing20,
    marginTop: spacing10,
    marginBottom: spacing20,
    padding: `${spacing10} ${spacing20}`,
    borderRadius: "8px",
    flexWrap: "wrap",
    "@media (min-width: 768px)": {
      gap: spacing30,
    },
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: spacing10,
  },
  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    flexShrink: 0,
    marginLeft: "6px",
  },
  attendanceLegendCard: {
    display: "flex",
    alignItems: "center",
    gap: spacing20,
    padding: spacing20,
    backgroundColor: "#F9FAFB",
    borderRadius: "8px",
    border: "2px solid",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
  },
  attendanceLegendIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "#FFFFFF",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
    flexShrink: 0,
    "@media (min-width: 768px)": {
      width: "40px",
      height: "40px",
      fontSize: "1rem",
    },
  },
  attendanceLegendText: {
    display: "flex",
    flexDirection: "column",
  },
  attendanceLegendTitle: {
    fontSize: "0.95rem",
    "@media (min-width: 768px)": {
      fontSize: "1rem",
    },
  },
  attendanceLegendSubtitle: {
    fontSize: "0.85rem",
    "@media (min-width: 768px)": {
      fontSize: "0.9rem",
    },
  },
};

/* ================= HELPER FUNCTIONS ================= */
const transformCourseData = (apiCourses) => {
  if (!Array.isArray(apiCourses) || apiCourses.length === 0) {
    return [];
  }

  return apiCourses.map((course) => ({
    CRN: course.courseReferenceNumber,
    course: course.courseTitle,
    grade: course.grade,
    credit: course.credits?.creditHours || 0,
    attendance: null, // Will be populated by API call
    // Additional data for reference
    courseNumber: course.courseNumber,
    instructor: course.instructorFullName,
  }));
};

/* ================= COMPONENT ================= */
const MySuccessTrackerTable = ({ classes }) => {
  const [currentTerm, setCurrentTerm] = useState(null);
  const [currentBannerId, setCurrentBannerId] = useState(null);
  const [currentTermCode, setCurrentTermCode] = useState(null);
  const [currentGpa, setCurrentGpa] = useState(0);
  const [gpaDelta, setGpaDelta] = useState(0);
  const [courseData, setCourseData] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const { authenticatedEthosFetch } = useData();
  const { cardId } = useCardInfo();

  const backHref = useMemo(() => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      return `${window.location.origin}/${segments[0]}/`;
    }
    return window.location.origin;
  }, []);

  const {
    getStudentTermCodes,
    loadingTermCodes,
    errorTermCodes,
    termCodesResult,
  } = useStudentTermCodes(authenticatedEthosFetch, cardId);

  const {
    getStudentDetails,
    loadingStudentDetails,
    errorStudentDetails,
    studentDetailsResult,
  } = useStudentDetails(authenticatedEthosFetch, cardId);

  // Hook for student attendance
  const { getStudentAttendance } = useStudentAttendance(
    authenticatedEthosFetch,
    cardId,
  );

  // Fetch term codes on mount
  useEffect(() => {
    getStudentTermCodes()
      .then((data) => {
        // Set default selected term (latest / first item)
        if (Array.isArray(data) && data.length > 0) {
          setCurrentTerm(data[1]?.term);
          setCurrentTermCode(data[1]?.termCode);
          setCurrentBannerId(data[1]?.bannerId);
        }
      })
      .catch(() => {
        // error state already handled by hook
      });
  }, [getStudentTermCodes]);

  // Hook for current term GPA
  const {
    getStudentGpa: getCurrentGpa,
    loadingGpa: loadingCurrentGpa,
    errorGpa: errorCurrentGpa,
    gpaResult: currentGpaResult,
  } = useStudentGpa(
    authenticatedEthosFetch,
    cardId,
    currentBannerId,
    currentTermCode,
  );

  // Fetch current term GPA when currentTermCode changes
  useEffect(() => {
    if (!currentTermCode || !currentBannerId) return;

    getCurrentGpa()
      .then((data) => {
        console.log("Current GPA data:", data);
        // Expected payload: { termGpa, cumulativeGpa }
        const gpaValue = data?.cumulativeGpa;
        setCurrentGpa(gpaValue);
        setGpaDelta(data?.gpaIncrease);
      })
      .catch((error) => {
        console.error("Failed to fetch current GPA:", error);
        setCurrentGpa(0);
      });
  }, [currentTermCode, getCurrentGpa, currentBannerId]);

  // Fetch student course details when term changes
  useEffect(() => {
    if (!currentTermCode) return;

    getStudentDetails({ termCode: currentTermCode })
      .then((response) => {
        const courses = response;
        console.log("Course details response:", response);

        if (Array.isArray(courses) && courses.length > 0) {
          // Transform the course data
          const transformedCourses = transformCourseData(courses);
          setCourseData(transformedCourses);
        } else {
          setCourseData([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch student details:", error);
        setCourseData([]);
      });
  }, [currentTermCode, getStudentDetails]);

  // Fetch attendance for each course
  useEffect(() => {
    if (!courseData.length || !currentTermCode || !currentBannerId) return;

    const fetchAllAttendance = async () => {
      setLoadingAttendance(true);

      try {
        // Fetch attendance for all courses in parallel
        const attendancePromises = courseData.map(async (course) => {
          try {
            const attendanceData = await getStudentAttendance({
              termCode: currentTermCode,
              bannerId: currentBannerId,
              courseReferenceNumber: course.CRN,
            });

            // Extract attendance percentage from response
            const attendancePercentage = attendanceData?.attendancePercentage;

            return {
              CRN: course.CRN,
              attendance: attendancePercentage
                ? parseFloat(attendancePercentage)
                : null,
            };
          } catch (error) {
            console.error(
              `Failed to fetch attendance for CRN ${course.CRN}:`,
              error,
            );
            return {
              CRN: course.CRN,
              attendance: null,
            };
          }
        });

        const attendanceResults = await Promise.all(attendancePromises);

        // Update course data with attendance
        setCourseData((prevCourses) =>
          prevCourses.map((course) => {
            const attendanceData = attendanceResults.find(
              (result) => result.CRN === course.CRN,
            );
            return {
              ...course,
              attendance: attendanceData?.attendance ?? null,
            };
          }),
        );
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchAllAttendance();
  }, [
    courseData.length,
    currentTermCode,
    currentBannerId,
    getStudentAttendance,
  ]);

  const getStatusColor = (value) => {
    if (value === null) return "#999"; // Gray for missing data
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
    // Find the selected term's index
    const selectedIndex = termCodesResult.findIndex(
      (t) => t.termCode === term.termCode,
    );

    // Set current term
    setCurrentTerm(term.term);
    setCurrentTermCode(term.termCode);
    setCurrentBannerId(term.bannerId);
  };

  const isPositive = gpaDelta >= 0;
  const gpaCircleColor = getGpaCircleColor(currentGpa);
  const deltaColor = isPositive ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;
  const isLoading = loadingCurrentGpa || loadingStudentDetails;

  const handleBack = () => {
    window.location.assign(backHref);
  };

  return (
    <div className={classes.root}>
      <TermGpaBar />
      {/* ENHANCED BACK BUTTON */}
      <div className={classes.backButtonWrapper}>
        <Button onClick={handleBack} className={classes.backButton}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Button>
      </div>

      {/* TOP BAR */}
      <div className={classes.topBar}>
        <div className={classes.termSection}>
          <Typography className={classes.termLabel}>Select Term</Typography>
          <Button
            disabled={loadingTermCodes || !termCodesResult}
            dropdown={termCodesResult?.map((term) => (
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

        {/* ENHANCED GPA CARD */}

        <Card className={classes.gpaTopCard}>
          <div className={classes.gpaLeft}>
            <Typography
              variant="p"
              style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1F2937" }}
            >
              Term CGPA
            </Typography>

            <div className={classes.gpaDeltaRow}>
              <DoubleChevronIcon
                orientation={isPositive ? "up" : "down"}
                size={20}
                backgroundColor={deltaColor}
                style={{ transform: "translateY(4px)" }}
              />
              <Typography
                className={classes.gpaDeltaText}
                style={{ fontWeight: 500, top: "2px", position: "relative" }}
              >
                <span style={{ color: deltaColor, fontWeight: 700 }}>
                  {gpaDelta}
                </span>
                <span style={{ marginLeft: 3, color: "#6B7280" }}>
                  {" "}
                  From Last Term GPA
                </span>
              </Typography>
            </div>
          </div>

          <div
            className={classes.gpaCircle}
            style={{ borderColor: gpaCircleColor, color: gpaCircleColor }}
          >
            {loadingCurrentGpa ? "..." : currentGpa}
          </div>
        </Card>
      </div>

      {/* TABLE CARD */}
      <Card className={classes.card}>
        <div className={classes.cardHeader}>
          <Typography
            variant="h4"
            className={classes.cardTitle}
            style={{ fontWeight: 700, color: "#1F2937" }}
          >
            Academic Performance{currentTerm ? ` – ${currentTerm}` : ""}
          </Typography>
        </div>

        {isLoading && (
          <Typography
            style={{
              padding: spacing20,
              textAlign: "center",
              color: "#6B7280",
            }}
          >
            Loading student details...
          </Typography>
        )}

        {!loadingStudentDetails && (
          <>
            <div className={classes.gradeLegendBar}>
              <div className={classes.legendItem}>
                <div
                  className={classes.legendDot}
                  style={{ backgroundColor: COLOR_CONFIG.ON_TRACK }}
                />
                <Typography variant="body2">On Track</Typography>
              </div>

              <div className={classes.legendItem}>
                <div
                  className={classes.legendDot}
                  style={{ backgroundColor: COLOR_CONFIG.NEEDS_ATTENTION }}
                />
                <Typography variant="body2">Needs Attention</Typography>
              </div>

              <div className={classes.legendItem}>
                <div
                  className={classes.legendDot}
                  style={{ backgroundColor: COLOR_CONFIG.CRITICAL }}
                />
                <Typography variant="body2">Critical</Typography>
              </div>
            </div>

            <div className={classes.gradeLegendBar}>
              <div className={classes.legendItem}>
                <Typography variant="body2">F = Fail</Typography>
              </div>

              <div className={classes.legendItem}>
                <Typography variant="body2">P = Pass</Typography>
              </div>

              <div className={classes.legendItem}>
                <Typography variant="body2">
                  A, B, C, D = Standard Letter Grades
                </Typography>
              </div>
            </div>
          </>
        )}

        {(errorStudentDetails || errorCurrentGpa) && !isLoading && (
          <Typography
            style={{
              padding: spacing20,
              textAlign: "center",
              color: COLOR_CONFIG.NEEDS_ATTENTION,
              backgroundColor: "#FEF3C7",
              borderRadius: "8px",
              marginBottom: spacing20,
            }}
          >
            ⚠️ Note: Some data may be unavailable. Showing available
            information.
          </Typography>
        )}

        {/* DESKTOP TABLE VIEW */}
        {!isLoading && (
          <div className={classes.tableContainer}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.headerCell}>Course</TableCell>
                  <TableCell className={classes.headerCell}>Grade</TableCell>
                  <TableCell className={classes.headerCell}>Credits</TableCell>
                  <TableCell
                    className={`${classes.headerCell} ${classes.lastCell}`}
                  >
                    Attendance
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courseData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className={classes.bodyCell}>
                      <Typography
                        style={{ color: "#6B7280", fontStyle: "italic" }}
                      >
                        No course data available for this term
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  courseData.map((row, index) => {
                    const attendanceColor = getStatusColor(row.attendance);
                    const isLowGrade = TABLE_CONFIG.lowGrades.includes(
                      row.grade,
                    );
                    const attendanceDisplay =
                      row.attendance !== null
                        ? `${row.attendance.toFixed(2)}%`
                        : loadingAttendance
                          ? "..."
                          : "N/A";

                    return (
                      <TableRow
                        key={row.CRN || index}
                        className={classes.tableRow}
                      >
                        <TableCell className={classes.bodyCell}>
                          <Typography variant="body2">{row.CRN}</Typography>
                          <Typography
                            variant="caption"
                            style={{ color: "#6B7280" }}
                          >
                            {row.course}
                          </Typography>
                        </TableCell>

                        <TableCell
                          className={`${classes.bodyCell} ${isLowGrade ? classes.lowGrade : ""}`}
                        >
                          {row.grade}
                        </TableCell>

                        <TableCell className={classes.bodyCell}>
                          <Typography variant="body2">{row.credit}</Typography>
                        </TableCell>

                        <TableCell
                          className={`${classes.bodyCell} ${classes.lastCell}`}
                        >
                          <div className={classes.progressWrapper}>
                            {row.attendance !== null ? (
                              <>
                                <div className={classes.progressBar}>
                                  <div
                                    className={classes.progressFill}
                                    style={{
                                      width: `${row.attendance}%`,
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
          <div className={classes.mobileCardList}>
            {courseData.length === 0 ? (
              <Typography
                style={{
                  textAlign: "center",
                  color: "#6B7280",
                  fontStyle: "italic",
                  padding: spacing30,
                }}
              >
                No course data available for this term
              </Typography>
            ) : (
              courseData.map((row, index) => {
                const attendanceColor = getStatusColor(row.attendance);
                const isLowGrade = TABLE_CONFIG.lowGrades.includes(row.grade);
                const attendanceDisplay =
                  row.attendance !== null
                    ? `${row.attendance.toFixed(2)}%`
                    : loadingAttendance
                      ? "..."
                      : "N/A";

                return (
                  <div key={row.CRN || index} className={classes.mobileCard}>
                    {/* Header with course and grade */}
                    <div className={classes.mobileCardHeader}>
                      <div className={classes.mobileCardTitle}>
                        <Typography
                          variant="body1"
                          style={{ fontWeight: 700, marginBottom: "4px" }}
                        >
                          {row.CRN}
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{ color: "#6B7280" }}
                        >
                          {row.course}
                        </Typography>
                      </div>
                      <div
                        className={classes.mobileCardGrade}
                        style={{
                          color: isLowGrade ? COLOR_CONFIG.CRITICAL : "#1F2937",
                        }}
                      >
                        {row.grade}
                      </div>
                    </div>

                    {/* Credits row */}
                    <div className={classes.mobileCardRow}>
                      <span className={classes.mobileCardLabel}>Credits</span>
                      <span className={classes.mobileCardValue}>
                        {row.credit}
                      </span>
                    </div>

                    {/* Attendance row */}
                    <div className={classes.mobileCardRow}>
                      <span className={classes.mobileCardLabel}>
                        Attendance
                      </span>
                      <div className={classes.mobileProgressWrapper}>
                        {row.attendance !== null ? (
                          <>
                            <div className={classes.mobileProgressBar}>
                              <div
                                className={classes.progressFill}
                                style={{
                                  width: `${row.attendance}%`,
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
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MySuccessTrackerTable);
