import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { useCardInfo, useData } from "@ellucian/experience-extension-utils";

import useFetch from '../hooks/useFetch.js';

import { withStyles } from "@ellucian/react-design-system/core/styles";
import { Typography } from "@ellucian/react-design-system/core";

import SvgHollowCircle from "../components/SvgHollowCircle.jsx";

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

/* ================= COMPONENT ================= */
const StudentSuccessTracker = ({ classes }) => {
  const { authenticatedEthosFetch } = useData();

  const { cardId, configuration } = useCardInfo();
  console.log("Printing card configuration:", JSON.stringify(configuration));

  const {
    excellent_performance_color_code,
    satisfactory_performance_color_code,
    poor_performance_color_code,
    minimum_threshold_for_excellent_performance,
    minimum_threshold_for_satisfactory_performance,
    minimum_threshold_for_excellent_attendance,
    minimum_threshold_for_satisfactory_attendance,
    latest_term_information_pipeline,
  } = configuration;

  // Parse config thresholds once — they arrive as strings from cardConfiguration
  const parsed_minimum_threshold_for_excellent_performance   = parseFloat(minimum_threshold_for_excellent_performance);
  const parsed_minimum_threshold_for_satisfactory_performance = parseFloat(minimum_threshold_for_satisfactory_performance);
  const parsed_minimum_threshold_for_excellent_attendance    = parseFloat(minimum_threshold_for_excellent_attendance);
  const parsed_minimum_threshold_for_satisfactory_attendance = parseFloat(minimum_threshold_for_satisfactory_attendance);

  if (parsed_minimum_threshold_for_excellent_performance <= parsed_minimum_threshold_for_satisfactory_performance) {
    throw new Error("Invalid performance configuration: excellent threshold must be greater than satisfactory threshold");
  }

  if (parsed_minimum_threshold_for_excellent_attendance <= parsed_minimum_threshold_for_satisfactory_attendance) {
    throw new Error("Invalid attendance configuration: excellent threshold must be greater than satisfactory threshold");
  }

  /* ── Helper functions ─────────────────────────────────────────────────── */

  const get_gpa_color = (gpa_value) => {
    const parsed_gpa_value = parseFloat(gpa_value);
    if (isNaN(parsed_gpa_value)) return poor_performance_color_code;
    if (parsed_gpa_value >= parsed_minimum_threshold_for_excellent_performance)   return excellent_performance_color_code;
    if (parsed_gpa_value >= parsed_minimum_threshold_for_satisfactory_performance) return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const get_attendance_color = (attendance_percentage_value) => {
    const parsed_attendance_percentage_value = parseFloat(attendance_percentage_value);
    if (isNaN(parsed_attendance_percentage_value)) return poor_performance_color_code;
    if (parsed_attendance_percentage_value >= parsed_minimum_threshold_for_excellent_attendance)   return excellent_performance_color_code;
    if (parsed_attendance_percentage_value >= parsed_minimum_threshold_for_satisfactory_attendance) return satisfactory_performance_color_code;
    return poor_performance_color_code;
  };

  const get_attendance_status_color = (attendance_percentage_value) => {
    if (attendance_percentage_value === null || attendance_percentage_value === undefined) return poor_performance_color_code;
    return get_attendance_color(attendance_percentage_value);
  };

  /* ── State ────────────────────────────────────────────────────────────── */

  const [current_gpa, set_current_gpa]         = useState(0);
  const [term_name, set_term_name]             = useState("");
  const [attendance_data, set_attendance_data] = useState([]);
  const [avg_attendance, set_avg_attendance]   = useState(null);

  /* ── Fetch latest term info ───────────────────────────────────────────── */

  const { data, loading } = useFetch(
    authenticatedEthosFetch,
    cardId,
    null,
    latest_term_information_pipeline,
    {},
  );

  /* ── React to data ────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!data) return;

    set_current_gpa(parseFloat(data.cumulativeGpa) || 0);
    set_term_name(data.termName || "");
    set_attendance_data(Array.isArray(data.termInformation) ? data.termInformation : []);

    // averageAttendancePercentage arrives as a ratio (e.g. 0.18 = 18%); convert to percentage
    const raw_average_attendance_percentage = parseFloat(data.averageAttendancePercentage);
    set_avg_attendance(
      !isNaN(raw_average_attendance_percentage)
        ? parseFloat((raw_average_attendance_percentage).toFixed(2))
        : null
    );
  }, [data]);

  const gpa_circle_color        = get_gpa_color(current_gpa);
  const attendance_circle_color = avg_attendance !== null
    ? get_attendance_color(avg_attendance)
    : poor_performance_color_code;

  /* ── Render ───────────────────────────────────────────────────────────── */

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
                style={{ border: `4px solid ${gpa_circle_color}` }}
              >
                <strong className={classes.circleValue} style={{ color: gpa_circle_color }}>
                  {loading ? "..." : current_gpa.toFixed(2)}
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
                style={{ border: `4px solid ${attendance_circle_color}` }}
              >
                <strong className={classes.circleValue} style={{ color: attendance_circle_color }}>
                  {loading ? "..." : avg_attendance !== null ? `${avg_attendance}%` : "N/A"}
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
              {term_name || "Current Term"}
            </Typography>
          </header>

          {loading ? (
            <Typography style={{ textAlign: "center", padding: "1rem" }}>
              Loading attendance data...
            </Typography>
          ) : attendance_data.length === 0 ? (
            <Typography style={{ textAlign: "center", padding: "1rem" }}>
              No attendance data available
            </Typography>
          ) : (
            <div className={classes.attendanceList}>
              {attendance_data.map((attendance_entry, index) => {
                // attendancePercentage arrives as a string; parse for comparison and display
                const parsed_course_attendance_percentage = parseFloat(attendance_entry.attendancePercentage);
                const display_attendance_percentage = !isNaN(parsed_course_attendance_percentage)
                  ? `${parsed_course_attendance_percentage}%`
                  : "N/A";

                return (
                  <div key={index} className={classes.attendanceRow}>
                    <div className={classes.courseName} title={attendance_entry.courseTitle}>
                      {attendance_entry.courseTitle}
                    </div>
                    <div className={classes.attendancePercentage}>
                      <span>{display_attendance_percentage}</span>
                      <SvgHollowCircle color={get_attendance_status_color(parsed_course_attendance_percentage)} />
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

StudentSuccessTracker.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StudentSuccessTracker);