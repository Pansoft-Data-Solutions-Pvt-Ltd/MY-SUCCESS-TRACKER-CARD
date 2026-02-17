import { withStyles } from "@ellucian/react-design-system/core/styles";
import { spacing24 } from "@ellucian/react-design-system/core/styles/tokens";
import { Typography } from "@ellucian/react-design-system/core";
import { useCardInfo, useData } from "@ellucian/experience-extension-utils";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import SvgHollowCircle from "../components/SvgHollowCircle.jsx";
// import DoubleChevronIcon from "../components/DoubleChevron.jsx";
import useGetLatestTermInformation from "../hooks/useGetLatestTermInformation";

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
    overflow: "visible",
  },
  gpaBody: {
    display: "flex",
    gap: "1.25rem",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "70%",
  },
  gpaMessage: {
    textAlign: "center",
    fontSize: "0.75rem",
  },
  gpaCircleContainer: {
    // flexShrink: 0,
    // flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  gpaCircleInner: {
    width: "clamp(5rem, 12rem, 6rem)",
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
  attendanceHeader: {
    marginBottom: "0.25rem",
  },
  iconText: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  attendanceList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: "0.25rem 0.5rem",
  },
  attendanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.35rem 0.5rem",
    borderBottom: "1px solid #e0e0e0",
    gap: "0.5rem",
    minHeight: "32px",
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
    minWidth: 0,
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
    flexShrink: 0,
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.7rem",
      gap: "0.375rem",
    },
  },
});

/* ================= HELPERS ================= */
const getStatusColor = (value) => {
  if (value === null) return "#999";
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
  const { cardId } = useCardInfo();
  const { authenticatedEthosFetch } = useData();

  const [currentGpa, setCurrentGpa] = useState(0);
  const [termName, setTermName] = useState("");
  // const [termGpa, setTermGpa] = useState(0);
  // const [gpaDelta, setGpaDelta] = useState(0);
  // const [termCode, setTermCode] = useState(null);
  // const [bannerId, setBannerId] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  // const [loadingAttendance, setLoadingAttendance] = useState(false);

  const { getStudentDetails, loadingLatestTermInformation } =
    useGetLatestTermInformation(authenticatedEthosFetch, cardId);

  /* Fetch latest term information on mount */
  useEffect(() => {
    getStudentDetails()
      .then((data) => {
        if (data) {
          // Set GPA data
          const cumGpa = parseFloat(data.cumulativeGpa) || 0;
          setCurrentGpa(cumGpa);
          // setTermGpa(trmGpa);

          // setGpaDelta(data.cgpaDifference);

          // Store term code and banner ID for attendance calls
          // setTermCode(data.termCode);
          // setBannerId(data.bannerId);

          setTermName(data.termName);

          setAttendanceData(data.termInformation);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch latest term information:", error);
      });
  }, [getStudentDetails]);

  const gpaCircleColor = getGpaCircleColor(currentGpa);
  // const isPositive = gpaDelta >= 0;
  // const deltaColor = isPositive ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;

  return (
    <div className={classes.card}>
      <div className={classes.cardBody}>
        <section className={classes.gpaSection}>
          <Typography variant="h5">Cumulative GPA</Typography>

          <div className={classes.gpaBody}>
            <div className={classes.gpaCircleContainer}>
              <div
                className={classes.gpaCircleInner}
                style={{ border: `4px solid ${gpaCircleColor}` }}
              >
                <strong style={{ fontSize: "1.6rem", fontWeight: 600 }}>
                  {loadingLatestTermInformation ? "..." : currentGpa.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className={classes.attendanceSection}>
          <header className={classes.attendanceHeader}>
            <Typography variant="h5" style={{ textAlign: "center" }}>
              Attendance Overview
            </Typography>
            <Typography variant="body2" style={{ textAlign: "center" }}>
              {termName || "Current Term"}
            </Typography>
          </header>

          {loadingLatestTermInformation ? (
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
                const percentage = at.attendancePercentage ?? 0;
                const displayPercentage =
                  at.percentage !== null ? `${percentage}%` : "N/A";

                return (
                  <div key={index} className={classes.attendanceRow}>
                    <div className={classes.courseName} title={at.courseTitle}>
                      {at.courseTitle}
                    </div>
                    <div className={classes.attendancePercentage}>
                      <span>{displayPercentage}</span>
                      <SvgHollowCircle
                        color={getStatusColor(at.attendancePercentage)}
                      />
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
