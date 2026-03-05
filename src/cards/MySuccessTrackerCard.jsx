import { Typography } from "@ellucian/react-design-system/core";
import { useCardInfo, useData } from "@ellucian/experience-extension-utils";
import React, { useState, useEffect } from "react";
import DoubleChevronIcon from "../components/DoubleChevron";
import useGetLatestTermInformation from "../hooks/useGetLatestTermInformation";
import "./style.css";

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

/* ================= HELPERS ================= */
const getAttendanceColor = (value) => {
  if (value === null || value === undefined) return "#999";
  if (value >= TABLE_CONFIG.attendanceGood) return COLOR_CONFIG.ON_TRACK;
  if (value >= TABLE_CONFIG.attendanceWarning)
    return COLOR_CONFIG.NEEDS_ATTENTION;
  return COLOR_CONFIG.CRITICAL;
};

const getGpaCircleColor = (gpa) => {
  if (gpa === null || gpa === undefined) return "#999";
  if (gpa >= GPA_CONFIG.GOOD) return COLOR_CONFIG.ON_TRACK;
  if (gpa >= GPA_CONFIG.MEDIUM) return COLOR_CONFIG.NEEDS_ATTENTION;
  return COLOR_CONFIG.CRITICAL;
};

/* ================= COMPONENT ================= */
const MySuccessTrackerCard = () => {
  const { cardId } = useCardInfo();
  const { authenticatedEthosFetch } = useData();
  const [currentGpa, setCurrentGpa] = useState(null);
  const [avgAttendance, setAvgAttendance] = useState(null);
  const [termName, setTermName] = useState("");
  const [isFirstTerm, setIsFirstTerm] = useState(true);
  // const [attendanceData, setAttendanceData] = useState([]);
  const [diffAttendance, setDiffAttendance] = useState(null);

  const { getStudentDetails, loadingLatestTermInformation } =
    useGetLatestTermInformation(authenticatedEthosFetch, cardId);

  useEffect(() => {
    getStudentDetails()
      .then((data) => {
        if (data) {
          const cumGpa = parseFloat(data.cumulativeGpa) || 0;
          setCurrentGpa(cumGpa);
          setTermName(data.termName);
          // setAttendanceData(data.termInformation);
          setAvgAttendance(data.averageAttendancePercentage);
          setDiffAttendance(data.differenceInAttendance);
          setIsFirstTerm(data.flag);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch latest term information:", error);
      });
  }, [getStudentDetails]);

  const gpaCircleColor = getGpaCircleColor(currentGpa);
  const attendanceCircleColor = getAttendanceColor(avgAttendance);
  const loading = loadingLatestTermInformation;

  const diff = parseFloat(diffAttendance);
  const isZeroDiff = diff === 0;
  const isPositiveDiff = diff > 0;
  const diffColor = isPositiveDiff
    ? COLOR_CONFIG.ON_TRACK
    : COLOR_CONFIG.CRITICAL;

  return (
    <div className="card">
      <div className="cardBody">
        {/* ── Cumulative GPA ── */}
        <section className="metricSection">
          <div className="metricHeading">
            <Typography variant="h5">Cumulative GPA</Typography>
          </div>

          <div className="metricCircleArea">
            <div className="circleWrapper">
              <div
                className="metricCircle"
                style={{ border: `4px solid ${gpaCircleColor}` }}
              >
                <strong
                  className="metricValue"
                  style={{ color: gpaCircleColor }}
                >
                  {loading ? "…" : currentGpa?.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          {/* Empty footer to match height of attendance footer */}
          <div className="metricFooter" />
        </section>

        {/* ── Attendance Overview ── */}
        <section className="metricSection">
          <div className="metricHeading">
            <Typography variant="h5">Attendance Overview</Typography>

            {termName && (
              <Typography variant="body3" className="termName">
                {termName}
              </Typography>
            )}
          </div>

          <div className="metricCircleArea">
            <div className="circleWrapper">
              <div
                className="metricCircle"
                style={{ border: `4px solid ${attendanceCircleColor}` }}
              >
                <strong
                  className="metricValue"
                  style={{ color: attendanceCircleColor }}
                >
                  {loading
                    ? "…"
                    : avgAttendance != null
                      ? `${avgAttendance}%`
                      : "N/A"}
                </strong>
              </div>
            </div>
          </div>

          {/* Footer: diff + term name stacked */}
          <div
            className="metricFooter"
            style={{ flexDirection: "column", height: "auto", gap: "2px" }}
          >
            {!loading && !isFirstTerm && diffAttendance != null && (
              <span className="subLabel">
                {isZeroDiff ? (
                  <span style={{ color: "#6B7280", fontWeight: 600 }}>
                    Same as last term
                  </span>
                ) : (
                  <>
                    <DoubleChevronIcon
                      orientation={isPositiveDiff ? "up" : "down"}
                      size={14}
                      backgroundColor={diffColor}
                    />
                    <span style={{ color: diffColor, fontWeight: 700 }}>
                      {Math.abs(diff)}%
                    </span>
                    <span style={{ color: "#6B7280" }}>from last term</span>
                  </>
                )}
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

MySuccessTrackerCard.propTypes = {};
export default MySuccessTrackerCard;
