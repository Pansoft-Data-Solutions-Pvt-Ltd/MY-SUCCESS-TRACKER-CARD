import { withStyles } from "@ellucian/react-design-system/core/styles";
import { spacing24 } from "@ellucian/react-design-system/core/styles/tokens";
import {
  Typography,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from "@ellucian/react-design-system/core";
import { useCardInfo, useData } from "@ellucian/experience-extension-utils";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import SvgHollowCircle from "../components/SvgHollowCircle.jsx";
import DoubleChevronIcon from "../components/DoubleChevron.jsx";
import useStudentTermCodes from "../hooks/useTermCodes";
import useStudentDetails from "../hooks/useStudentDetails";
import useStudentGpa from "../hooks/useStudentGpa";
import useStudentAttendance from "../hooks/useStudentAttendance";

/* ================= CONFIG ================= */
const TABLE_CONFIG = {
  attendanceGood: 75,
  attendanceWarning: 60,
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

const styles = (theme) => ({
  card: {
    padding: "0 1rem",
    display: "flex",
    flexDirection: "column",
    gap: spacing24,
    overflow: "hidden",
    width: "100%",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #e0e0e0",
    margin: "1rem 0",
  },
  cardBody: {
    display: "flex",
    flexDirection: "row",
    gap: "0rem",

    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  gpaSection: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    [theme.breakpoints.down("md")]: {
      alignItems: "center",
    },
  },
  attendanceSection: {
    flex: 2,
    minWidth: 0,
    paddingLeft: "0.25rem",
    paddingRight: "0.5rem",
    overflow: "visible", // ⬅️ important
  },

  gpaHeader: {},
  gpaBody: {
    display: "flex",
    gap: "1.25rem",
    flexDirection: "column",
    alignItems: "center",
  },
  gpaMessage: {
    textAlign: "center",
    fontSize: "0.75rem",
  },
  gpaCircleContainer: {
    flexShrink: 0,
    flex: 1,
    display: "flex",
  },
  gpaCircleInner: {
    width: "clamp(4rem, 10rem, 5rem)",
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "3px solid #006114",
  },
  gpaDelta: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    alignItems: "center",
  },
  verticalDivider: {
    display: "none",
    [theme.breakpoints.down("md")]: {
      display: "block",
      padding: "1rem",
    },
  },
  attendanceHeader: {
    marginBottom: "0.25rem",
  },
  attendanceTable: {},
  iconText: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  icon: {
    width: "1rem",
    height: "1rem",
  },
  attendanceList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem", // ⬅️ smaller gap
    padding: "0.25rem 0.5rem", // ⬅️ reduce padding
  },
  attendanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.35rem 0.5rem", // ⬅️ reduced vertical padding
    borderBottom: "1px solid #e0e0e0",
    gap: "0.5rem",
    minHeight: "32px", // ⬅️ smaller row height
    "&:last-child": {
      borderBottom: "none",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "0.5rem",
      gap: "0.5rem",
      minHeight: "40px",
    },
  },
  courseName: {
    flex: 1,
    fontSize: "0.7rem",
    minWidth: 0, // Critical for text truncation
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.2",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.75rem",
    },
  },
  attendancePercentage: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.7rem",
    fontWeight: 400,
    flexShrink: 0, // Prevent shrinking on small screens
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.7rem",
      gap: "0.375rem",
    },
  },
});

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
  P: null,
};

const transformAttendanceData = (apiCourses) => {
  if (!Array.isArray(apiCourses) || apiCourses.length === 0) {
    return [];
  }

  return apiCourses.map((course) => ({
    CRN: course.courseReferenceNumber,
    courseName: course.courseTitle || course.courseNumber || "Unknown Course",
    percentage: null, // Will be populated by API call
  }));
};

/* ================= HELPER FUNCTIONS ================= */
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

const MySuccessTrackerCard = ({ classes }) => {
  const {
    configuration: {
      goodAttendanceColorCode,
      decentAttendanceColorCode,
      poorAttendanceColorCode,
      gpaIncreaseChevronColorCode,
      gpaDecreaseChevronColorCode,
      gpaCircleColorCode,
    } = {},
    cardId,
  } = useCardInfo();

  const { authenticatedEthosFetch } = useData();
  const [isFirstTerm, setIsFirstTerm] = useState(false);
  const [currentTermCode, setCurrentTermCode] = useState(null);
  const [currentBannerId, setCurrentBannerId] = useState(null);
  const [currentGpa, setCurrentGpa] = useState(0);
  const [gpaDelta, setGpaDelta] = useState(0);
  const [attendanceData, setAttendanceData] = useState([]);
  const [gpaMessage, setGpaMessage] = useState("");
  const [loadingAttendance, setLoadingAttendance] = useState(false);

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
        if (Array.isArray(data) && data.length > 0) {
          // Set the latest term (first item)
          setCurrentTermCode(data[0].termCode);
          setCurrentBannerId(data[0].bannerId);
        }
      })
      .catch(() => {
        // Error handled by hook
      });
  }, [getStudentTermCodes]);

  // Fetch current term GPA when currentTermCode changes
  useEffect(() => {
    if (!currentTermCode || !currentBannerId) return;
    console.log(currentBannerId);

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
  }, [currentBannerId, currentTermCode, getCurrentGpa]);

  // Fetch student details when term changes
  useEffect(() => {
    if (!currentTermCode) return;

    getStudentDetails({
      termCode: currentTermCode,
    })
      .then((response) => {
        const courses = response;
        console.log("Student details response:", response);

        if (Array.isArray(courses) && courses.length > 0) {
          // Transform attendance data
          const transformedAttendance = transformAttendanceData(courses);
          setAttendanceData(transformedAttendance);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch student details:", error);
      });
  }, [currentTermCode, getStudentDetails]);

  // Fetch attendance for each course
  useEffect(() => {
    if (!attendanceData.length || !currentTermCode || !currentBannerId) return;

    const fetchAllAttendance = async () => {
      setLoadingAttendance(true);

      try {
        // Fetch attendance for all courses in parallel
        const attendancePromises = attendanceData.map(async (course) => {
          try {
            const attendanceDataResponse = await getStudentAttendance({
              termCode: currentTermCode,
              bannerId: currentBannerId,
              courseReferenceNumber: course.CRN,
            });

            // Extract attendance percentage from response
            const attendancePercentage =
              attendanceDataResponse?.attendancePercentage;

            return {
              CRN: course.CRN,
              percentage: attendancePercentage
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
              percentage: null,
            };
          }
        });

        const attendanceResults = await Promise.all(attendancePromises);

        // Update attendance data with fetched percentages
        setAttendanceData((prevAttendance) =>
          prevAttendance.map((course) => {
            const attendanceResult = attendanceResults.find(
              (result) => result.CRN === course.CRN,
            );
            return {
              ...course,
              percentage: attendanceResult?.percentage ?? null,
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
    attendanceData.length,
    currentTermCode,
    currentBannerId,
    getStudentAttendance,
  ]);

  // Calculate GPA circle color based on current GPA
  const gpaCircleColor = getGpaCircleColor(currentGpa);
  const isPositive = gpaDelta >= 0;
  const deltaColor = isPositive ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;

  return (
    <div className={classes.card}>
      <div className={classes.cardBody}>
        <section className={classes.gpaSection}>
          <header className={classes.gpaHeader}>
            <Typography variant="h5">Cumulative GPA</Typography>
          </header>
          <div className={classes.gpaBody}>
            <div className={classes.gpaCircleContainer}>
              <div
                className={classes.gpaCircleInner}
                style={{
                  border: `4px solid ${gpaCircleColor}`,
                }}
              >
                <strong style={{ fontSize: "1.6rem", fontWeight: 600 }}>
                  {loadingCurrentGpa ? "..." : currentGpa}
                </strong>
              </div>
            </div>
            {!isFirstTerm && gpaDelta !== null && (
              <div className={classes.gpaDelta}>
                <div className={classes.iconText}>
                  <DoubleChevronIcon
                    backgroundColor={deltaColor}
                    orientation={gpaDelta >= 0 ? "up" : "down"}
                    size="1rem"
                  />
                  <strong style={{ fontSize: "1rem" }}>
                    {gpaDelta}
                  </strong>
                </div>
                <Typography
                  variant="p"
                  style={{ fontSize: "0.6rem" }}
                  className={classes.deltaText}
                >
                  from last term
                </Typography>
              </div>
            )}
          </div>
          <div className={classes.gpaMessage}>{gpaMessage}</div>
        </section>

        <section className={classes.attendanceSection}>
          <header className={classes.attendanceHeader}>
            <Typography variant="h5" style={{ textAlign: "center" }}>
              Attendance Overview
            </Typography>
            <Typography variant="body2" style={{ textAlign: "center" }}>
              {loadingTermCodes
                ? "Loading..."
                : termCodesResult?.[0]?.term || "Current Term"}
            </Typography>
          </header>

          {loadingStudentDetails || loadingAttendance ? (
            <Typography style={{ textAlign: "center", padding: "1rem" }}>
              Loading attendance data...
            </Typography>
          ) : attendanceData.length === 0 ? (
            <Typography style={{ textAlign: "center", padding: "1rem" }}>
              No attendance data available
            </Typography>
          ) : (
            <div className={classes.attendanceList}>
              {attendanceData.map((at, index) => {
                const percentage = at.percentage ?? 0;
                const displayPercentage =
                  at.percentage !== null ? `${percentage.toFixed(2)}%` : "N/A";

                const circleColor = getStatusColor(at.percentage);

                return (
                  <div key={index} className={classes.attendanceRow}>
                    <div
                      className={classes.courseName}
                      title={at.courseName} // Show full name on hover
                    >
                      {at.courseName}
                    </div>
                    <div className={classes.attendancePercentage}>
                      <span>{displayPercentage}</span>
                      <SvgHollowCircle color={circleColor} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

MySuccessTrackerCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MySuccessTrackerCard);
