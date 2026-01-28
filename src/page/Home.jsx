import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@ellucian/react-design-system/core/styles";
import DoubleChevronIcon from "../components/DoubleChevron";
import useStudentTermCodes from "../hooks/useTermCodes";
import useStudentDetails from "../hooks/useStudentDetails";
import useStudentGpa from "../hooks/useStudentGpa";
import useStudentAttendance from "../hooks/useStudentAttendance";

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
    margin: spacing30,
    paddingBottom: spacing40,
  },
  backButtonWrapper: {
    marginBottom: spacing30,
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
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    "&:hover": {
      backgroundColor: "#026BC8",
      color: "#FFFFFF",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    },
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: spacing40,
    marginBottom: spacing40,
    flexWrap: "wrap",
  },
  termSection: {
    display: "flex",
    flexDirection: "column",
    gap: spacing10,
  },
  termLabel: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#1F2937",
  },
  gpaTopCard: {
    padding: spacing30,
    minWidth: "280px",
    height: "110px",
    display: "flex",
    alignItems: "center",
    position: "relative",
    marginLeft: "auto",
    background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
  },
  gpaLeft: {
    display: "flex",
    flexDirection: "column",
    paddingRight: "100px",
    transform: "translateY(-5px)",
  },
  gpaCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "4px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1.3rem",
    position: "absolute",
    right: spacing30,
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  gpaDeltaRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing10,
    marginTop: spacing10,
    position: "relative",
    top: "-3px",
  },
  card: {
    padding: spacing30,
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid #E5E7EB",
  },
  cardHeader: {
    marginBottom: spacing20,
    paddingBottom: spacing20,
    borderBottom: "2px solid #E5E7EB",
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
  legendSection: {
    marginTop: spacing20,
    marginBottom: spacing30,
  },
  legendTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#1F2937",
    marginBottom: spacing20,
  },
  legendGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: spacing20,
  },
  gradeLegendBar: {
    display: "flex",
    alignItems: "center",
    gap: spacing30,
    marginTop: spacing10,
    marginBottom: spacing20,
    flexWrap: "wrap",
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
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1rem",
    color: "#FFFFFF",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
  },
  attendanceLegendText: {
    display: "flex",
    flexDirection: "column",
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
  const [previousTermCode, setPreviousTermCode] = useState(null);
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
          // Store previous term code for GPA delta calculation
          if (data.length > 1) {
            setPreviousTermCode(data[1].termCode);
          }
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
    if (!currentTermCode && !currentBannerId) return;

    getCurrentGpa()
      .then((data) => {
        console.log("Current GPA data:", data);
        // Expected payload: { termGpa, cumulativeGpa }
        const gpaValue = data?.cumulativeGpa;
        setCurrentGpa(gpaValue);
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

    // Set previous term (next item in the array, since newest is first)
    if (selectedIndex >= 0 && selectedIndex < termCodesResult.length - 1) {
      setPreviousTermCode(termCodesResult[selectedIndex + 1].termCode);
    } else {
      setPreviousTermCode(null);
    }
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
              style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1F2937" }}
            >
              Term GPA
            </Typography>

            <div className={classes.gpaDeltaRow}>
              <DoubleChevronIcon
                orientation={isPositive ? "up" : "down"}
                size={21}
                backgroundColor={deltaColor}
                style={{ transform: "translateY(4px)" }}
              />
              <Typography
                style={{ fontWeight: 500, top: "2px", position: "relative" }}
              >
                <span style={{ color: deltaColor, fontWeight: 700 }}>
                  {Math.abs(gpaDelta).toFixed(2)}
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

        {/* GRADE LEGEND */}
        {!loadingStudentDetails && (
          <div className={classes.gradeLegendBar}>
            <div className={classes.legendItem}>
              <div
                className={classes.legendDot}
                style={{ backgroundColor: COLOR_CONFIG.CRITICAL }}
              />
              <Typography style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                <span style={{ color: COLOR_CONFIG.CRITICAL, fontWeight: 700 }}>
                  F
                </span>{" "}
                = Fail
              </Typography>
            </div>

            <div className={classes.legendItem}>
              <Typography style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                <span style={{ fontWeight: 700 }}>P</span> = Pass
              </Typography>
            </div>

            <div className={classes.legendItem}>
              <Typography style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                <span style={{ fontWeight: 700 }}>A, B, C, D</span> = Standard
                Letter Grades
              </Typography>
            </div>
          </div>
        )}

        {/* ATTENDANCE PERCENTAGE LEGENDS */}
        {!loadingStudentDetails && (
          <div className={classes.legendSection}>
            <Typography className={classes.legendTitle}>
              Attendance Status Guide
            </Typography>
            <div className={classes.legendGrid}>
              {/* On Track */}
              <div
                className={classes.attendanceLegendCard}
                style={{ borderColor: COLOR_CONFIG.ON_TRACK }}
              >
                <div
                  className={classes.attendanceLegendIcon}
                  style={{ backgroundColor: COLOR_CONFIG.ON_TRACK }}
                >
                  ✓
                </div>
                <div className={classes.attendanceLegendText}>
                  <Typography
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: COLOR_CONFIG.ON_TRACK,
                    }}
                  >
                    On Track
                  </Typography>
                  <Typography style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                    ≥ 75% Attendance
                  </Typography>
                </div>
              </div>

              {/* Needs Attention */}
              <div
                className={classes.attendanceLegendCard}
                style={{ borderColor: COLOR_CONFIG.NEEDS_ATTENTION }}
              >
                <div
                  className={classes.attendanceLegendIcon}
                  style={{ backgroundColor: COLOR_CONFIG.NEEDS_ATTENTION }}
                >
                  !
                </div>
                <div className={classes.attendanceLegendText}>
                  <Typography
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: COLOR_CONFIG.NEEDS_ATTENTION,
                    }}
                  >
                    Needs Attention
                  </Typography>
                  <Typography style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                    60% - 74% Attendance
                  </Typography>
                </div>
              </div>

              {/* Critical */}
              <div
                className={classes.attendanceLegendCard}
                style={{ borderColor: COLOR_CONFIG.CRITICAL }}
              >
                <div
                  className={classes.attendanceLegendIcon}
                  style={{ backgroundColor: COLOR_CONFIG.CRITICAL }}
                >
                  ✕
                </div>
                <div className={classes.attendanceLegendText}>
                  <Typography
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: COLOR_CONFIG.CRITICAL,
                    }}
                  >
                    Critical
                  </Typography>
                  <Typography style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                    &lt; 60% Attendance
                  </Typography>
                </div>
              </div>
            </div>
          </div>
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

        {!isLoading && (
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
                  const isLowGrade = TABLE_CONFIG.lowGrades.includes(row.grade);
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
                        <Typography
                          style={{
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: "#1F2937",
                          }}
                        >
                          {row.CRN}
                        </Typography>
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
                        <Typography
                          style={{ fontWeight: 600, color: "#1F2937" }}
                        >
                          {row.credit}
                        </Typography>
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
                                  fontWeight: 700,
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
        )}
      </Card>
    </div>
  );
};

MySuccessTrackerTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MySuccessTrackerTable);
