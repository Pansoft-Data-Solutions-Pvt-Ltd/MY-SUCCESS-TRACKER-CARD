import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@ellucian/react-design-system/core/styles";
import DoubleChevronIcon from "../components/DoubleChevron";
import useStudentTermCodes from "../hooks/useTermCodes";
import useGetTermInformation from "../hooks/useGetTermInformation";
import useGetAcademicPerformance from "../hooks/useGetAcademicPerformance";
import TermGpaBar from "../components/TermGpaBar";

// Ellucian provided hooks
import { useData, useCardInfo } from "@ellucian/experience-extension-utils";

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
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: spacing20,
    marginBottom: spacing30,
    "@media (min-width: 768px)": {
      gridTemplateColumns: "auto 1fr",
      gap: spacing30,
      marginBottom: spacing40,
      alignItems: "stretch",
    },
    "@media (min-width: 1200px)": {
      gridTemplateColumns: "280px 1fr 1fr",
      gap: spacing30,
      alignItems: "stretch",
    },
  },
  termSection: {
    display: "flex",
    flexDirection: "column",
    gap: spacing10,
    width: "100%",
    "@media (min-width: 768px)": {
      width: "280px",
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
  gpaCardsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: spacing20,
    width: "100%",
    "@media (min-width: 768px)": {
      flexDirection: "column",
      gap: spacing20,
    },
    "@media (min-width: 1200px)": {
      gridColumn: "2",
    },
  },
  termGpaBarCard: {
    padding: 0,
    width: "100%",
    height: "210px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    background: "linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    overflow: "hidden",
    "@media (min-width: 1200px)": {
      gridColumn: "3",
      gridRow: "1",
      height: "100%",
    },
  },
  gpaTopCard: {
    padding: spacing20,
    width: "100%",
    minHeight: "110px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "@media (min-width: 768px)": {
      padding: spacing30,
      minWidth: "280px",
      flex: 1,
    },
  },
  termGpaCard: {
    padding: spacing20,
    width: "100%",
    minHeight: "110px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    background: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderRadius: "12px",
    border: "1px solid #BAE6FD",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "@media (min-width: 768px)": {
      padding: spacing30,
      minWidth: "280px",
      flex: 1,
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
    transition: "all 0.3s ease",
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
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
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
  gradeLegendBar: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing20,
    marginTop: spacing10,
    marginBottom: spacing20,
    padding: `${spacing10} ${spacing20}`,
    borderRadius: "8px",
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
    flexShrink: 0,
    marginLeft: "6px",
  },
};

/* ================= COMPONENT ================= */
const MySuccessTrackerTable = ({ classes }) => {
  const [currentTerm, setCurrentTerm] = useState(null);
  const [termData, setTermData] = useState([]);
  const [currentBannerId, setCurrentBannerId] = useState(null);
  const [currentTermCode, setCurrentTermCode] = useState(null);
  const [currentGpa, setCurrentGpa] = useState(0);
  const [termGpa, setTermGpa] = useState(0);
  const [gpaDelta, setGpaDelta] = useState(0);
  const [courseData, setCourseData] = useState([]);
  const [loadingCourseData, setLoadingCourseData] = useState(false);
  const [termGpaData, setTermGpaData] = useState([]);
  const [loadingAllTermGpas, setLoadingAllTermGpas] = useState(false);
  const [initialCourseData, setInitialCourseData] = useState([]);

  const { authenticatedEthosFetch } = useData();
  const { cardId } = useCardInfo();

  const blockedTermCodes = ["199610", "199510", "199520"];

  const backHref = useMemo(() => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      return `${window.location.origin}/${segments[0]}/`;
    }
    return window.location.origin;
  }, []);

  const { getStudentTermCodes, loadingTermCodes, termCodesResult } =
    useStudentTermCodes(authenticatedEthosFetch, cardId);

  const { getStudentDetails, loadingTermInformation } = useGetTermInformation(
    authenticatedEthosFetch,
    cardId,
  );

  const { getAcademicPerformance } = useGetAcademicPerformance(
    authenticatedEthosFetch,
    cardId,
  );

  // Fetch and filter term codes
  useEffect(() => {
    getStudentTermCodes().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const filteredTerms = data
          .filter((item) => !blockedTermCodes.includes(item.termCode))
          .sort((a, b) => a.termCode.localeCompare(b.termCode));

        setTermData(filteredTerms.map((term) => term.term));
        setCurrentTerm(filteredTerms[filteredTerms.length - 1]?.term);
        setCurrentTermCode(filteredTerms[filteredTerms.length - 1]?.termCode);
        setCurrentBannerId(filteredTerms[filteredTerms.length - 1]?.bannerId);
      }
    });
  }, [getStudentTermCodes]);

  // Fetch current term details
  useEffect(() => {
    if (!currentTermCode) return;

    getStudentDetails({ termCode: currentTermCode })
      .then((data) => {
        const cumGpa = parseFloat(data?.cumulativeGpa) || 0;
        const trmGpa = data?.termGpa;
        setCurrentGpa(cumGpa);
        setTermGpa(trmGpa);
        setCurrentBannerId(data?.bannerId);
        setGpaDelta(data?.cgpaDifference);

        // Set the initial course data from termInformation
        if (Array.isArray(data?.termInformation)) {
          setInitialCourseData(data.termInformation);
        } else {
          setInitialCourseData([]);
        }
      })
      .catch(() => {
        setCurrentGpa(0);
        setTermGpa(0);
        setInitialCourseData([]);
      });
  }, [currentTermCode, currentTerm, getStudentDetails, termCodesResult]);

  // Fetch all term GPAs at once
  useEffect(() => {
    if (!termCodesResult || termCodesResult.length === 0) return;

    const fetchAllTermGpas = async () => {
      setLoadingAllTermGpas(true);

      try {
        const filteredTerms = termCodesResult
          .filter((item) => !blockedTermCodes.includes(item.termCode))
          .sort((a, b) => a.termCode.localeCompare(b.termCode));

        const allTermGpaPromises = filteredTerms.map(async (term) => {
          try {
            const data = await getStudentDetails({ termCode: term.termCode });
            return {
              term: term.term,
              termCode: term.termCode,
              termGpa: data?.termGpa,
              cumulativeGpa: parseFloat(data?.cumulativeGpa) || 0,
            };
          } catch (error) {
            console.error(
              `Error fetching GPA for term ${term.termCode}:`,
              error,
            );
            return {
              term: term.term,
              termCode: term.termCode,
              termGpa: 0,
              cumulativeGpa: 0,
            };
          }
        });

        const allTermGpas = await Promise.all(allTermGpaPromises);
        setTermGpaData(allTermGpas);
      } catch (error) {
        console.error("Error fetching all term GPAs:", error);
      } finally {
        setLoadingAllTermGpas(false);
      }
    };

    fetchAllTermGpas();
  }, [termCodesResult, getStudentDetails]);

  // Fetch academic performance data for each course in courseData
  useEffect(() => {
    if (
      !initialCourseData ||
      initialCourseData.length === 0 ||
      !currentTermCode ||
      !currentBannerId
    ) {
      setCourseData([]);
      return;
    }

    const fetchAcademicPerformanceData = async () => {
      setLoadingCourseData(true);

      try {
        const performancePromises = initialCourseData.map(async (course) => {
          try {
            const performanceData = await getAcademicPerformance({
              termCode: currentTermCode,
              crn: course.crn,
              bannerId: currentBannerId,
            });

            return {
              courseNumber: course.courseNumber,
              subjectCode: course.subjectCode,
              crn: course.crn,
              courseTitle: course.courseTitle || "-",
              attendancePercentage: course?.attendancePercentage
                ? parseFloat(course.attendancePercentage)
                : null,
              grade: performanceData?.grade || "-",
              credit: performanceData?.earnedCreditHours || "-",
              gradeMode: performanceData?.gradeMode || "-",
            };
          } catch (error) {
            console.error(
              `Error fetching performance for CRN ${course.crn}:`,
              error,
            );
            return {
              crn: course.crn,
              courseNumber: "-",
              subjectCode: "-",
              courseTitle: course.courseTitle || "-",
              attendancePercentance: null,
              grade: "-",
              credit: course.credit || "-",
              gradeMode: "-",
            };
          }
        });

        const performanceResults = await Promise.all(performancePromises);
        setCourseData(performanceResults);
      } catch (error) {
        console.error("Error fetching academic performance data:", error);
      } finally {
        setLoadingCourseData(false);
      }
    };

    fetchAcademicPerformanceData();
  }, [
    initialCourseData,
    currentTermCode,
    currentBannerId,
    getAcademicPerformance,
  ]);

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

  const handleTermChange = (term) => {
    setCourseData([]);
    setCurrentTerm(term.term);
    setCurrentTermCode(term.termCode);
    setCurrentBannerId(term.bannerId);
  };

  const isPositive = gpaDelta >= 0;
  const gpaCircleColor = getGpaCircleColor(currentGpa);
  const termGpaCircleColor = getGpaCircleColor(termGpa);
  const deltaColor = isPositive ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;
  const isLoading = loadingTermInformation;

  const handleBack = () => {
    window.location.assign(backHref);
  };

  return (
    <div className={classes.root}>
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
        {/* TERM SELECTOR */}
        <div className={classes.termSection}>
          <Typography className={classes.termLabel}>Select Term</Typography>
          <Button
            disabled={loadingTermCodes || !termCodesResult}
            dropdown={termCodesResult
              ?.filter((item) => !blockedTermCodes.includes(item.termCode))
              .sort((a, b) => a.termCode.localeCompare(b.termCode))
              .map((term) => (
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

        {/* GPA CARDS WRAPPER */}
        <div className={classes.gpaCardsWrapper}>
          {/* CUMULATIVE GPA CARD */}
          <Card className={classes.gpaTopCard}>
            <div className={classes.gpaLeft}>
              <Typography
                variant="p"
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "#1F2937",
                }}
              >
                Cumulative GPA
              </Typography>

              {gpaDelta !== 0 && (
                <div className={classes.gpaDeltaRow}>
                  <DoubleChevronIcon
                    orientation={isPositive ? "up" : "down"}
                    size={20}
                    backgroundColor={deltaColor}
                    style={{ transform: "translateY(4px)" }}
                  />
                  <Typography
                    className={classes.gpaDeltaText}
                    style={{
                      fontWeight: 500,
                      top: "2px",
                      position: "relative",
                    }}
                  >
                    <span style={{ color: deltaColor, fontWeight: 700 }}>
                      {gpaDelta}
                    </span>
                    <span style={{ marginLeft: 3, color: "#6B7280" }}>
                      {" "}
                      From Last Term
                    </span>
                  </Typography>
                </div>
              )}
            </div>

            <div
              className={classes.gpaCircle}
              style={{
                borderColor: gpaCircleColor,
                color: gpaCircleColor,
              }}
            >
              {loadingTermInformation ? "..." : currentGpa.toFixed(2)}
            </div>
          </Card>

          {/* TERM GPA CARD */}
          <Card className={classes.termGpaCard}>
            <div className={classes.gpaLeft}>
              <Typography
                variant="p"
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "#0369A1",
                }}
              >
                Term GPA
              </Typography>

              <Typography
                variant="body2"
                style={{
                  fontSize: "0.875rem",
                  color: "#0C4A6E",
                  marginTop: spacing10,
                  fontWeight: 500,
                }}
              >
                Current term performance
              </Typography>
            </div>

            <div
              className={classes.gpaCircle}
              style={{
                borderColor: termGpaCircleColor,
                color: termGpaCircleColor,
              }}
            >
              {loadingTermInformation ? "..." : termGpa}
            </div>
          </Card>
        </div>

        {/* TERM GPA BAR CHART */}
        <Card className={classes.termGpaBarCard}>
          <TermGpaBar
            termData={termData}
            termGpaData={termGpaData}
            loading={loadingAllTermGpas}
          />
        </Card>
      </div>

      {/* TABLE CARD */}
      <Card className={classes.card}>
        <div className={classes.cardHeader}>
          <Typography
            variant="h4"
            className={classes.cardTitle}
            style={{ fontWeight: 700, color: "#1F2937" ,textAlign: "center" }}
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

        {!isLoading && (
  <div 
    style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      borderRadius: "8px",
      padding: `${spacing10} ${spacing20}`,
      marginBottom: spacing20,
      flexWrap: "wrap",
      gap: spacing20
    }}
  >
    {/* Left side - Grade legends */}
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Typography variant="body2" style={{ fontWeight: 500, color: "#1F2937" }}>
        F = Fail
      </Typography>
      <Typography variant="body2" style={{ fontWeight: 500, color: "#1F2937" }}>
        A, B, C, D = Letter Grades
      </Typography>
    </div>

    {/* Right side - Status color legends */}
    <div style={{ display: "flex", alignItems: "center", gap: spacing20, flexWrap: "wrap" }}>
      <div className={classes.legendItem}>
        <div
          className={classes.legendDot}
          style={{ backgroundColor: COLOR_CONFIG.ON_TRACK }}
        />
        <Typography variant="body2" style={{ fontWeight: 500 }}>On Track</Typography>
      </div>

      <div className={classes.legendItem}>
        <div
          className={classes.legendDot}
          style={{ backgroundColor: COLOR_CONFIG.NEEDS_ATTENTION }}
        />
        <Typography variant="body2" style={{ fontWeight: 500 }}>Needs Attention</Typography>
      </div>

      <div className={classes.legendItem}>
        <div
          className={classes.legendDot}
          style={{ backgroundColor: COLOR_CONFIG.CRITICAL }}
        />
        <Typography variant="body2" style={{ fontWeight: 500 }}>Critical</Typography>
      </div>
    </div>
  </div>
)}

        {/* DESKTOP TABLE VIEW */}
        {!isLoading && (
          <div className={classes.tableContainer}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.headerCell}>Course</TableCell>
                  <TableCell className={classes.headerCell}>Grade</TableCell>
                  <TableCell className={classes.headerCell}>
                    Credits Earned
                  </TableCell>
                  <TableCell
                    className={`${classes.headerCell} ${classes.lastCell}`}
                  >
                    Attendance
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingCourseData ? (
                  <TableRow>
                    <TableCell colSpan={4} className={classes.bodyCell}>
                      <Typography
                        style={{ color: "#6B7280", fontStyle: "italic" }}
                      >
                        {loadingCourseData
                          ? "Loading course data..."
                          : "No course data available for this term"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  courseData.map((row, index) => {
                    const attendanceColor = getStatusColor(
                      row.attendancePercentage,
                    );
                    const isLowGrade = TABLE_CONFIG.lowGrades.includes(
                      row.grade,
                    );
                    const attendanceDisplay =
                      row.attendancePercentage !== null
                        ? `${row.attendancePercentage}%`
                        : "N/A";

                    return (
                      <TableRow
                        key={row.crn || index}
                        className={classes.tableRow}
                      >
                        <TableCell className={classes.bodyCell}>
                          <Typography variant="body2">
                            {row.subjectCode}-{row.courseNumber}
                          </Typography>
                          <Typography
                            variant="caption"
                            style={{ color: "#6B7280" }}
                          >
                            {row.courseTitle}
                          </Typography>
                        </TableCell>

                        <TableCell
                          className={`${classes.bodyCell} ${isLowGrade ? classes.lowGrade : ""}`}
                        >
                          {row?.grade}
                        </TableCell>

                        <TableCell className={classes.bodyCell}>
                          <Typography variant="body2">{row?.credit}</Typography>
                        </TableCell>

                        <TableCell
                          className={`${classes.bodyCell} ${classes.lastCell}`}
                        >
                          <div className={classes.progressWrapper}>
                            {row.attendancePercentage !== null ? (
                              <>
                                <div className={classes.progressBar}>
                                  <div
                                    className={classes.progressFill}
                                    style={{
                                      width: `${row.attendancePercentage}%`,
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
                {loadingCourseData
                  ? "Loading course data..."
                  : "No course data available for this term"}
              </Typography>
            ) : (
              courseData.map((row, index) => {
                const attendanceColor = getStatusColor(
                  row.attendancePercentage,
                );
                const isLowGrade = TABLE_CONFIG.lowGrades.includes(row?.grade);
                const attendanceDisplay =
                  row.attendancePercentage !== null
                    ? `${row.attendancePercentage}%`
                    : "N/A";

                return (
                  <div key={row.crn || index} className={classes.mobileCard}>
                    {/* Header with course and grade */}
                    <div className={classes.mobileCardHeader}>
                      <div className={classes.mobileCardTitle}>
                        <Typography
                          variant="body1"
                          style={{ fontWeight: 700, marginBottom: "4px" }}
                        >
                          {row.crn}
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{ color: "#6B7280" }}
                        >
                          {row.courseTitle}
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
                        {row.attendancePercentage !== null ? (
                          <>
                            <div className={classes.mobileProgressBar}>
                              <div
                                className={classes.progressFill}
                                style={{
                                  width: `${row.attendancePercentage}%`,
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
