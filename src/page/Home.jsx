import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@ellucian/react-design-system/core/styles";
import DoubleChevronIcon from "../components/DoubleChevron";
import useStudentTermCodes from "../hooks/useTermCodes";

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
  lowGrades: ["C1", "C2", "D1", "D2"],
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

// Fallback/default data - will be used if API data is not available
const DEFAULT_GPA = 3.2;
const DEFAULT_GPA_DELTA = 0.15;

const DEFAULT_COURSES = [
  {
    CRN: "ABC123",
    course: "Sample Course 1",
    grade: "B1",
    credit: 3,
    attendance: 85,
  },
  {
    CRN: "DEF456",
    course: "Sample Course 2",
    grade: "A",
    credit: 4,
    attendance: 92,
  },
  {
    CRN: "GHI789",
    course: "Sample Course 3",
    grade: "C1",
    credit: 3,
    attendance: 68,
  },
];

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

/* ================= COMPONENT ================= */
const MySuccessTrackerTable = ({ classes }) => {
  const [currentTerm, setCurrentTerm] = useState(null);
  const [currentGpa, setCurrentGpa] = useState(DEFAULT_GPA);
  const [gpaDelta, setGpaDelta] = useState(DEFAULT_GPA_DELTA);
  const [courseData, setCourseData] = useState(DEFAULT_COURSES);

  const { authenticatedEthosFetch } = useData();
 const { cardId } = useCardInfo();

  const {
    getStudentTermCodes,
    loadingTermCodes,
    errorTermCodes,
    termCodesResult,
  } = useStudentTermCodes(authenticatedEthosFetch, cardId);

  useEffect(() => {
    getStudentTermCodes()
      .then((data) => {
        // Set default selected term (latest / first item)
        if (Array.isArray(data) && data.length > 0) {
          setCurrentTerm(data[0].termDescription);
        }
      })
      .catch(() => {
        // error state already handled by hook
      });
  }, [getStudentTermCodes]);

  // When term changes, you would fetch the actual data here
  // For now, using default data
  useEffect(() => {
    if (currentTerm) {
      // TODO: Fetch actual GPA and course data based on currentTerm
      // Example:
      // fetchGpaForTerm(currentTerm).then(data => {
      //   setCurrentGpa(data.gpa);
      //   setGpaDelta(data.delta);
      // });
      // fetchCoursesForTerm(currentTerm).then(data => {
      //   setCourseData(data);
      // });

      // For now, using defaults
      setCurrentGpa(DEFAULT_GPA);
      setGpaDelta(DEFAULT_GPA_DELTA);
      setCourseData(DEFAULT_COURSES);
    }
  }, [currentTerm]);

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

  const isPositive = gpaDelta >= 0;
  const gpaCircleColor = getGpaCircleColor(currentGpa);
  const deltaColor = isPositive ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;

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
                onClick={() => setCurrentTerm(term.term)}
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
              Cumulative GPA
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
            {currentGpa.toFixed(2)}
          </div>
        </Card>
      </div>

      {/* TABLE */}
      <Card className={classes.card}>
        <Typography variant="h4">
          Academic Performance{currentTerm ? ` – ${currentTerm}` : ""}
        </Typography>

        <Table className={classes.table}>
          <TableBody>
            {courseData.map((row, index) => {
              const attendanceColor = getStatusColor(row.attendance);
              const isLowGrade = TABLE_CONFIG.lowGrades.includes(row.grade);

              return (
                <TableRow key={index}>
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
                      <span style={{ color: attendanceColor, fontWeight: 600 }}>
                        {row.attendance}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

MySuccessTrackerTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MySuccessTrackerTable);
