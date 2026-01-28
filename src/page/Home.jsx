import React, { useState, useEffect } from "react";
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
  lowGrades: ["C", "D", "F", "C1", "C2", "D1", "D2"],
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
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: spacing40,
    marginBottom: spacing40,
  },
  termSection: {
    display: "flex",
    flexDirection: "column",
  },
  gpaTopCard: {
    padding: spacing20,
    minWidth: "220px",
    height: "90px",
    display: "flex",
    alignItems: "center",
    position: "relative",
    marginLeft: "auto",
  },
  gpaLeft: {
    display: "flex",
    flexDirection: "column",
    paddingRight: "90px",
    transform: "translateY(-7px)",
  },
  gpaCircle: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    border: "3px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: "1rem",
    position: "absolute",
    right: spacing40,
    top: "50%",
    transform: "translateY(-50%)",
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
    padding: spacing20,
  },
  legendBar: {
    display: "flex",
    alignItems: "center",
    gap: spacing30,
    marginTop: spacing20,
    marginBottom: spacing20,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: spacing10,
    fontSize: "0.85rem",
  },
  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
  table: {
    width: "100%",
    tableLayout: "fixed",
    border: "1px solid #D1D5DB",
    borderCollapse: "collapse",
  },
  headerCell: {
    backgroundColor: "#026BC8",
    color: "#FFFFFF",
    fontWeight: 600,
    textAlign: "center",
    height: "48px",
    borderRight: "1px solid #D1D5DB",
    width: "25%",
  },
  bodyCell: {
    textAlign: "center",
    borderBottom: "1px solid #E5E7EB",
    borderRight: "1px solid #E5E7EB",
    width: "25%",
    padding: spacing20,
  },
  lastCell: {
    borderRight: "none",
  },
  lowGrade: {
    color: COLOR_CONFIG.CRITICAL,
    fontWeight: 600,
  },
  progressWrapper: {
    display: "flex",
    alignItems: "center",
    gap: spacing10,
    justifyContent: "center",
  },
  progressBar: {
    flexGrow: 1,
    height: "6px",
    borderRadius: "4px",
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
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

  const {
    getStudentTermCodes,
    loadingTermCodes,
    errorTermCodes,
    termCodesResult,
  } = useStudentTermCodes(authenticatedEthosFetch, cardId);

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
          setCurrentTerm(data[0].term);
          setCurrentTermCode(data[0].termCode);
          setCurrentBannerId(data[0].bannerId);
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

  // Fetch current term GPA when currentTermCode changes
  useEffect(() => {
    if (!currentTermCode) return;

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
  }, [currentTermCode, getCurrentGpa]);

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
    courseData,
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

  return (
    <div className={classes.root}>
      {/* TOP BAR */}
      <div className={classes.topBar}>
        <div className={classes.termSection}>
          <Typography variant="h3">Select Term</Typography>
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

        {/* GPA CARD */}
        <Card className={classes.gpaTopCard}>
          <div className={classes.gpaLeft}>
            <Typography
              variant="p"
              style={{ fontSize: "1.1rem", fontWeight: 600 }}
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
                <span style={{ color: deltaColor }}>
                  {Math.abs(gpaDelta).toFixed(2)}
                </span>
                <span style={{ marginLeft: 3 }}> From Last Term GPA</span>
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

      {/* TABLE */}
      <Card className={classes.card}>
        <Typography variant="h4">
          Academic Performance{currentTerm ? ` – ${currentTerm}` : ""}
        </Typography>

        {isLoading && (
          <Typography style={{ padding: spacing20, textAlign: "center" }}>
            Loading student details...
          </Typography>
        )}

        {(errorStudentDetails || errorCurrentGpa) && !isLoading && (
          <Typography
            style={{
              padding: spacing20,
              textAlign: "center",
              color: COLOR_CONFIG.NEEDS_ATTENTION,
            }}
          >
            Note: Some data may be unavailable. Showing available information.
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
                    <Typography>
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
                    <TableRow key={row.CRN || index}>
                      <TableCell className={classes.bodyCell}>
                        <Typography style={{ fontWeight: 600 }}>
                          {row.CRN}
                        </Typography>
                        <Typography variant="caption">{row.course}</Typography>
                      </TableCell>

                      <TableCell
                        className={`${classes.bodyCell} ${isLowGrade ? classes.lowGrade : ""}`}
                      >
                        {row.grade}
                      </TableCell>

                      <TableCell className={classes.bodyCell}>
                        {row.credit}
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
                                  fontWeight: 600,
                                }}
                              >
                                {attendanceDisplay}
                              </span>
                            </>
                          ) : (
                            <span style={{ color: "#999" }}>
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
