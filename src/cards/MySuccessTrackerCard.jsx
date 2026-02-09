import { withStyles } from "@ellucian/react-design-system/core/styles";
import { spacing24 } from "@ellucian/react-design-system/core/styles/tokens";
import { Typography } from "@ellucian/react-design-system/core";
import { useCardInfo, useData } from "@ellucian/experience-extension-utils";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import SvgHollowCircle from "../components/SvgHollowCircle.jsx";
import DoubleChevronIcon from "../components/DoubleChevron.jsx";
import useGetLatestTermInformation from "../hooks/useGetLatestTermInformation";
import useGetSectionAttendance from "../hooks/useGetSectionAttendance";

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
  GOOD: 3.0,
  MEDIUM: 2.5,
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
  if (gpa >= 3 && gpa <= 4) {
    return COLOR_CONFIG.ON_TRACK;        // Green
  }
  if (gpa >= 2 && gpa < 3) {
    return COLOR_CONFIG.NEEDS_ATTENTION; // Yellow
  }
  if (gpa >= 1 && gpa < 2) {
    return COLOR_CONFIG.CRITICAL;        // Red
  }
  return "#999999"; // For 0, null, or invalid GPA
};

const MySuccessTrackerCard = ({ classes }) => {
  const { cardId } = useCardInfo();
  const { authenticatedEthosFetch } = useData();

  const [currentGpa, setCurrentGpa] = useState(0);
  const [termName, setTermName] = useState("");
  // const [termGpa, setTermGpa] = useState(0);
  const [gpaDelta, setGpaDelta] = useState(0);
  const [termCode, setTermCode] = useState(null);
  const [bannerId, setBannerId] = useState(null);
  const [sectionIds, setSectionIds] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const { getStudentDetails, loadingLatestTermInformation } =
    useGetLatestTermInformation(authenticatedEthosFetch, cardId);

  const { getSectionAttendance } = useGetSectionAttendance(
    authenticatedEthosFetch,
    cardId,
  );

  /* Fetch latest term information on mount */
  useEffect(() => {
    getStudentDetails()
      .then((data) => {
        if (data) {
          // Set GPA data
          const cumGpa = parseFloat(data.cumulativeGpa) || 0;
          const trmGpa = parseFloat(data.termGpa) || 0;
          setCurrentGpa(cumGpa);
          // setTermGpa(trmGpa);

          // Calculate GPA delta (term GPA - cumulative GPA)
          setGpaDelta(0);

          // Store term code and banner ID for attendance calls
          setTermCode(data.termCode);
          setBannerId(data.bannerId);

          setTermName(data.termName)

          // Store section IDs for later attendance API calls
          if (Array.isArray(data.sectionIds)) {
            setSectionIds(data.sectionIds);
          }
        }
      })
      .catch((error) => {
        console.error("Failed to fetch latest term information:", error);
      });
  }, [getStudentDetails]);

  /* Fetch attendance data using sectionIds */
  useEffect(() => {
    if (sectionIds.length === 0 || !termCode || !bannerId) return;

    const fetchAllAttendance = async () => {
      setLoadingAttendance(true);
      try {
        const results = await Promise.all(
          sectionIds.map(async (sectionId) => {
            try {
              const data = await getSectionAttendance({
                termCode,
                bannerId,
                sectionId,
              });

              // API returns an array, get the first item
              const sectionData = Array.isArray(data) ? data[0] : data;

              return {
                courseName: sectionData?.title || "Unknown Course",
                crn: sectionData?.crn || sectionId,
                percentage: sectionData?.attendancePercentage
                  ? parseFloat(sectionData.attendancePercentage)
                  : null,
              };
            } catch (error) {
              console.error(
                `Failed to fetch attendance for section ${sectionId}:`,
                error,
              );
              return {
                courseName: "Unknown Course",
                crn: sectionId,
                percentage: null,
              };
            }
          }),
        );

        setAttendanceData(results);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchAllAttendance();
  }, [sectionIds, termCode, bannerId, getSectionAttendance]);

  const gpaCircleColor = getGpaCircleColor(currentGpa);
  const isPositive = gpaDelta >= 0;
  const deltaColor = isPositive ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;

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

            {gpaDelta !== null && (
              <div className={classes.gpaDelta}>
                <div className={classes.iconText}>
                  <DoubleChevronIcon
                    backgroundColor={deltaColor}
                    orientation={isPositive ? "up" : "down"}
                    size="1rem"
                  />
                  <strong style={{ fontSize: "1rem" }}>{gpaDelta}</strong>
                </div>
                <Typography variant="p" style={{ fontSize: "0.6rem" }}>
                  from last term
                </Typography>
              </div>
            )}
          </div>
        </section>

        <section className={classes.attendanceSection}>
          <header className={classes.attendanceHeader}>
            <Typography variant="h5" style={{ textAlign: "center" }}>
              Attendance Overview
            </Typography>
            <Typography variant="body2" style={{ textAlign: "center" }}>
              { termName || "Current Term" }
            </Typography>
          </header>

          {loadingLatestTermInformation || loadingAttendance ? (
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

                return (
                  <div key={index} className={classes.attendanceRow}>
                    <div className={classes.courseName} title={at.courseName}>
                      {at.courseName}
                    </div>
                    <div className={classes.attendancePercentage}>
                      <span>{displayPercentage}</span>
                      <SvgHollowCircle color={getStatusColor(at.percentage)} />
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
