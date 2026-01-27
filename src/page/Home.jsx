import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@ellucian/react-design-system/core/styles";
import DoubleChevronIcon from "../components/DoubleChevron";
import useStudentTermCodes from "../hooks/useTermCodes";
import useStudentDetails from "../hooks/useStudentDetails";
import useStudentGpa from "../hooks/useStudentGpa";

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
  lowGrades: [ "F"],
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

// Grade to GPA mapping
const GRADE_TO_GPA = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
  P: null, // Pass/Fail, don't count in GPA
};

// Fallback/default data
const DEFAULT_GPA = 0;
const DEFAULT_GPA_DELTA = 0;

const DEFAULT_COURSES = [];

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
  legendBar: {
  display: "flex",
  alignItems: "center",
  gap: spacing30,
  marginTop: spacing10,
  marginBottom: spacing20,
  transform: "translateY(-4px)",
},

legendItem: {
  display: "flex",
  alignItems: "center",
  gap: spacing10,
},

legendDot: {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
},


};

/* ================= HELPER FUNCTIONS ================= */
const calculateGPA = (courses) => {
  let totalPoints = 0;
  let totalCredits = 0;

  courses.forEach((course) => {
    const gradeValue = GRADE_TO_GPA[course.grade];
    const credits = course.credits?.creditHours || 0;

    // Only count grades that have a numeric value (skip P/F)
    if (gradeValue !== null && gradeValue !== undefined) {
      totalPoints += gradeValue * credits;
      totalCredits += credits;
    }
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
};

const transformCourseData = (apiCourses) => {
  if (!Array.isArray(apiCourses) || apiCourses.length === 0) {
    return [];
  }

  return apiCourses.map((course) => ({
    CRN: course.courseReferenceNumber,
    course: course.courseTitle,
    grade: course.grade,
    credit: course.credits?.creditHours || 0,
    attendance: Math.floor(Math.random() * 30) + 70, // Mock data: 70-100%
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
  const [currentGpa, setCurrentGpa] = useState(DEFAULT_GPA);
  const [gpaDelta, setGpaDelta] = useState(DEFAULT_GPA_DELTA);
  const [courseData, setCourseData] = useState(DEFAULT_COURSES);

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

  // Hook for current term GPA
  // console.log(currentBannerId, "- current term banner")
  const {
    getStudentGpa: getCurrentGpa,
    loadingGpa: loadingCurrentGpa,
    errorGpa: errorCurrentGpa,
    gpaResult: currentGpaResult,
  } = useStudentGpa(authenticatedEthosFetch, cardId, currentBannerId, currentTermCode);

  // Hook for previous term GPA
  const {
    getStudentGpa: getPreviousGpa,
    loadingGpa: loadingPreviousGpa,
    errorGpa: errorPreviousGpa,
    gpaResult: previousGpaResult,
  } = useStudentGpa(authenticatedEthosFetch, cardId, previousTermCode);

  const {
    getStudentDetails,
    loadingStudentDetails,
    errorStudentDetails,
    studentDetailsResult,
  } = useStudentDetails(authenticatedEthosFetch, cardId);

  // Fetch term codes on mount
  useEffect(() => {
    getStudentTermCodes()
      .then((data) => {
        // Set default selected term (latest / first item)
        if (Array.isArray(data) && data.length > 0) {
          setCurrentTerm(data[0].term);
          setCurrentTermCode(data[0].termCode);
          setCurrentBannerId(data[0].bannerId)
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
        setCurrentGpa(DEFAULT_GPA);
      });
  }, [currentTermCode, getCurrentGpa]);

  // Fetch previous term GPA when previousTermCode changes
  useEffect(() => {
    if (!previousTermCode) {
      setGpaDelta(0);
      return;
    }

    getPreviousGpa()
      .then((data) => {
        console.log("Previous GPA data:", data);
        // Expected payload: { termGpa, cumulativeGpa }
        const prevGpaValue = data?.termGpa || data?.cumulativeGpa || 0;

        // Calculate delta
        setGpaDelta(currentGpa - prevGpaValue);
      })
      .catch((error) => {
        console.error("Failed to fetch previous GPA:", error);
        setGpaDelta(0);
      });
  }, [previousTermCode, getPreviousGpa, currentGpa]);

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

          // Fallback: Calculate GPA from courses if API GPA is not available
          if (!loadingCurrentGpa && currentGpa === 0 && !currentGpaResult) {
            const calculatedGpa = calculateGPA(courses);
            setCurrentGpa(calculatedGpa);
          }
        } else {
          setCourseData([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch student details:", error);
        setCourseData([]);
      });
  }, [
    currentTermCode,
    getStudentDetails,
    loadingCurrentGpa,
    currentGpa,
    currentGpaResult,
  ]);

  const getStatusColor = (value) => {
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
    setCurrentBannerId(term.bannerId)

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

 <Button onClick={handleBack}>Back</Button>
    
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

        {/* LEGEND – show only when data is loaded */}
{!loadingStudentDetails && (
  <div className={classes.legendBar}>
    {/* F = Fail */}
    <div className={classes.legendItem}>
      <div
        className={classes.legendDot}
        style={{ backgroundColor: COLOR_CONFIG.CRITICAL }}
      />
      <Typography style={{ fontSize: "0.95rem", fontWeight: 500 }}>
        <span style={{ color: COLOR_CONFIG.CRITICAL, fontWeight: 600 }}>
            F
        </span>{" "}
        = Fail ,
      </Typography>
    </div>

    {/* P = Pass */}
    <div className={classes.legendItem}>
      <Typography style={{ fontSize: "0.95rem", fontWeight: 500 }}>
        <span style={{ fontWeight: 600 }}>P</span> = Pass ,
      </Typography>
    </div>

    {/* A, B, C, D = Standard Letter Grades */}
    <div className={classes.legendItem}>
      <Typography style={{ fontSize: "0.95rem", fontWeight: 500 }}>
        <span style={{ fontWeight: 600 }}> A,B,C,D</span> = Standard Letter Grades
      </Typography>
    </div>
  </div>
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
                            style={{ color: attendanceColor, fontWeight: 600 }}
                          >
                            {row.attendance}%
                          </span>
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
