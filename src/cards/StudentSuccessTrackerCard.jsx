import { withStyles } from "@ellucian/react-design-system/core/styles";
import { Typography } from "@ellucian/react-design-system/core";
import { useCardInfo, useData } from "@ellucian/experience-extension-utils";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import SvgHollowCircle from "../components/SvgHollowCircle.jsx";
import useFetch from "../hooks/useFetch.js";

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
    padding: "0 0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
  },
  cardBody: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  gpaSection: {
    flex: "0 0 38%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    overflow: "hidden",
  },
  attendanceSection: {
    flex: "1 1 62%",
    minWidth: 0,
    paddingLeft: "0.5rem",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  metricBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.2rem",
    width: "100%",
  },
  circleContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  circleInner: {
    width: "4.5rem",
    height: "4.5rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  circleValue: {
    fontSize: "1.1rem",
    fontWeight: 600,
    lineHeight: 1,
  },
  metricFooter: {
    height: "1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  subLabel: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    fontSize: "0.62rem",
    whiteSpace: "nowrap",
  },
  circleDivider: {
    width: "70%",
    margin: "0",
  },
  attendanceHeader: {
    marginBottom: "0.1rem",
  },
  iconText: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  attendanceList: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    padding: "0 0.25rem",
  },
  attendanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.2rem 0.25rem",
    borderBottom: "1px solid #e0e0e0",
    gap: "0.25rem",
    minHeight: "0",
    flex: 1,
    "&:last-child": {
      borderBottom: "none",
    },
  },
  courseName: {
    flex: 1,
    fontSize: "0.68rem",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.2",
  },
  attendancePercentage: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    fontSize: "0.68rem",
    fontWeight: 400,
    flexShrink: 0,
  },
});

/* ================= HELPERS ================= */
const getStatusColor = (value) => {
  if (value === null || value === undefined) return "#999";
  if (value >= TABLE_CONFIG.attendanceGood) return COLOR_CONFIG.ON_TRACK;
  if (value >= TABLE_CONFIG.attendanceWarning) return COLOR_CONFIG.NEEDS_ATTENTION;
  return COLOR_CONFIG.CRITICAL;
};

const getGpaCircleColor = (gpa) => {
  if (gpa === null || gpa === undefined || gpa === 0) return "#999";
  if (gpa >= GPA_CONFIG.GOOD) return COLOR_CONFIG.ON_TRACK;
  if (gpa >= GPA_CONFIG.MEDIUM) return COLOR_CONFIG.NEEDS_ATTENTION;
  return COLOR_CONFIG.CRITICAL;
};

/* ================= COMPONENT ================= */
const MySuccessTrackerCard = ({ classes }) => {
  const { authenticatedEthosFetch } = useData();
  const { cardId, cardConfiguration } = useCardInfo();
  const latestTermInformationPipeline = cardConfiguration?.latestTermInformationPipeline;

  const [currentGpa, setCurrentGpa]       = useState(0);
  const [termName, setTermName]           = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [avgAttendance, setAvgAttendance] = useState(null);

  // ── Fetch latest term info ───────────────────────────────────────────────
  const { data, loading } = useFetch(
    authenticatedEthosFetch,
    cardId,
    null,
    latestTermInformationPipeline,
    {},
  );

  // ── React to data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!data) return;

    setCurrentGpa(parseFloat(data.cumulativeGpa) || 0);
    setTermName(data.termName || "");
    setAttendanceData(Array.isArray(data.termInformation) ? data.termInformation : []);
    setAvgAttendance(data.averageAttendancePercentage ?? null);
  }, [data]);

  const gpaCircleColor        = getGpaCircleColor(currentGpa);
  const attendanceCircleColor = getStatusColor(avgAttendance);

  return (
    <div className={classes.card}>
      <div className={classes.cardBody}>

        {/* ── Left: GPA + Attendance circles ── */}
        <section className={classes.gpaSection}>

          <div className={classes.metricBlock}>
            <Typography variant="h5">Cumulative GPA</Typography>
            <div className={classes.circleContainer}>
              <div
                className={classes.circleInner}
                style={{ border: `4px solid ${gpaCircleColor}` }}
              >
                <strong className={classes.circleValue} style={{ color: gpaCircleColor }}>
                  {loading ? "..." : currentGpa.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          <div className={classes.circleDivider} />

          <div className={classes.metricBlock}>
            <Typography variant="h5">Term Attendance</Typography>
            <div className={classes.circleContainer}>
              <div
                className={classes.circleInner}
                style={{ border: `4px solid ${attendanceCircleColor}` }}
              >
                <strong className={classes.circleValue} style={{ color: attendanceCircleColor }}>
                  {loading ? "..." : avgAttendance != null ? `${avgAttendance}%` : "N/A"}
                </strong>
              </div>
            </div>
          </div>

        </section>

        {/* ── Right: per-course attendance list ── */}
        <section className={classes.attendanceSection}>
          <header className={classes.attendanceHeader}>
            <Typography variant="h5" style={{ textAlign: "center" }}>
              Attendance Overview
            </Typography>
            <Typography variant="body2" style={{ textAlign: "center" }}>
              {termName || "Current Term"}
            </Typography>
          </header>

          {loading ? (
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
                const percentage        = at.attendancePercentage ?? 0;
                const displayPercentage = at.attendancePercentage !== null ? `${percentage}%` : "N/A";
                return (
                  <div key={index} className={classes.attendanceRow}>
                    <div className={classes.courseName} title={at.courseTitle}>
                      {at.courseTitle}
                    </div>
                    <div className={classes.attendancePercentage}>
                      <span>{displayPercentage}</span>
                      <SvgHollowCircle color={getStatusColor(at.attendancePercentage)} />
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