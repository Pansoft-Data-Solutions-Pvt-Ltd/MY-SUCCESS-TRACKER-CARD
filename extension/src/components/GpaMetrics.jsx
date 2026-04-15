import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, Typography, TextField, Button } from "@ellucian/react-design-system/core";
import DoubleChevronIcon from "./DoubleChevron";
import Markdown from 'react-markdown'

const GpaMetrics = ({
  fetchGpaRecommendation,
  loadingRecommendation,
  recommendationResult,
  recommendationError,
  loadingTermInformation,
  isFirstTerm,
  isFirstTermFlag,
  isZeroDelta,
  isPositive,
  deltaColor,
  gpaDelta,
  gpaCircleColor,
  currentGpa,
  termGpaCircleColor,
  termGpa,
  isLatestTerm,
  diffAttendance,
  isZeroAttendanceDiff,
  isPositiveAttendanceDiff,
  attendanceDiffColor,
  attendanceCircleColor,
  avgAttendance,
  colors,
}) => {
  const [targetGpa, setTargetGpa] = useState("");

  return (
    <div className="gpa-cards-column">
      <div style={{ display: "flex", gap: "20px" }}>
        {/* CUMULATIVE GPA CARD */}
        <Card className="gpa-top-card">
          <div className="gpa-left">
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
            {!isFirstTerm && (
              <div className="gpa-delta-row">
                {isZeroDelta ? (
                  <Typography
                    className="gpa-delta-text"
                    style={{ fontWeight: 500 }}
                  >
                    <span style={{ color: "#6B7280", fontWeight: 700 }}>
                      Same as Last Term
                    </span>
                  </Typography>
                ) : (
                  <>
                    <DoubleChevronIcon
                      orientation={isPositive ? "up" : "down"}
                      size={20}
                      backgroundColor={deltaColor}
                      style={{ transform: "translateY(4px)" }}
                    />
                    <Typography
                      className="gpa-delta-text"
                      style={{
                        fontWeight: 500,
                        top: "2px",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          color: deltaColor,
                          fontWeight: 700,
                        }}
                      >
                        {gpaDelta != null ? Number(gpaDelta).toFixed(2) : gpaDelta}
                      </span>
                      <span style={{ marginLeft: 3, color: "#6B7280" }}>
                        {" "}
                        From Last Term
                      </span>
                    </Typography>
                  </>
                )}
              </div>
            )}
          </div>
          <div
            className="gpa-circle"
            style={{
              borderColor: gpaCircleColor,
              color: gpaCircleColor,
            }}
          >
            {loadingTermInformation ? "..." : currentGpa.toFixed(2)}
          </div>
        </Card>

        {/* TERM GPA CARD */}
        <Card className="term-gpa-card">
          <div className="gpa-left">
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
                marginTop: "10px",
                fontWeight: 500,
              }}
            >
              Current term performance
            </Typography>
          </div>
          <div
            className="gpa-circle"
            style={{
              borderColor: termGpaCircleColor,
              color: termGpaCircleColor,
            }}
          >
            {loadingTermInformation ? "..." : (termGpa != null && !isNaN(termGpa) ? Number(termGpa).toFixed(2) : termGpa)}
          </div>
        </Card>

        {/* TERM ATTENDANCE CARD */}
        <Card className="term-attendance-card">
          <div className="gpa-left">
            <Typography
              variant="p"
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#065F46",
              }}
            >
              Term Attendance
            </Typography>
            {isLatestTerm && (
              <div className="gpa-delta-row">
                <Typography
                  className="gpa-delta-text"
                  style={{
                    fontWeight: 500,
                    top: "2px",
                    position: "relative",
                  }}
                >
                  Attendance Till Date
                </Typography>
              </div>
            )}
            {!isFirstTermFlag && !isLatestTerm && diffAttendance != null && (
              <div className="gpa-delta-row">
                {isZeroAttendanceDiff ? (
                  <Typography
                    className="gpa-delta-text"
                    style={{ fontWeight: 500 }}
                  >
                    <span style={{ color: "#6B7280", fontWeight: 700 }}>
                      Same as Last Term
                    </span>
                  </Typography>
                ) : (
                  <>
                    <DoubleChevronIcon
                      orientation={isPositiveAttendanceDiff ? "up" : "down"}
                      size={20}
                      backgroundColor={attendanceDiffColor}
                      style={{ transform: "translateY(4px)" }}
                    />
                    <Typography
                      className="gpa-delta-text"
                      style={{
                        fontWeight: 500,
                        top: "2px",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          color: attendanceDiffColor,
                          fontWeight: 700,
                        }}
                      >
                        {Math.abs(diffAttendance).toFixed(2)}%
                      </span>
                      <span style={{ marginLeft: 3, color: "#6B7280" }}>
                        {" "}
                        From Last Term
                      </span>
                    </Typography>
                  </>
                )}
              </div>
            )}
          </div>
          <div
            className="gpa-circle"
            style={{
              borderColor: attendanceCircleColor,
              color: attendanceCircleColor,
            }}
          >
            {loadingTermInformation
              ? "..."
              : avgAttendance != null
                ? `${avgAttendance.toFixed(2)}%`
                : "N/A"}
          </div>
        </Card>
      </div>

      <div className="legends-container">
        <div style={{ display: "flex", gap: "10px" }}>
          <div className="legend-item">
            <div
              className="legend-dot"
              style={{ backgroundColor: colors.ON_TRACK }}
            />
            <Typography variant="body2" style={{ fontWeight: 500 }}>
              On Track
            </Typography>
          </div>
          <div className="legend-item">
            <div
              className="legend-dot"
              style={{
                backgroundColor: colors.NEEDS_ATTENTION,
              }}
            />
            <Typography variant="body2" style={{ fontWeight: 500 }}>
              Needs Attention
            </Typography>
          </div>
          <div className="legend-item">
            <div
              className="legend-dot"
              style={{ backgroundColor: colors.CRITICAL }}
            />
            <Typography variant="body2" style={{ fontWeight: 500 }}>
              Critical
            </Typography>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Typography
            variant="body2"
            style={{ fontWeight: 500, color: "#1F2937" }}
          >
            A, B, C, D = Letter Grades
          </Typography>
          <Typography
            variant="body2"
            style={{ fontWeight: 500, color: "#1F2937" }}
          >
            F = Fail
          </Typography>
          <Typography
            variant="body2"
            style={{ fontWeight: 500, color: "#03060c" }}
          >
            N/A = Not Applicable
          </Typography>
        </div>
      </div>
      <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <TextField
          label="Target GPA"
          value={targetGpa}
          onChange={(event) => setTargetGpa(event.target.value)}
          placeholder="e.g. 3.5"
        />
        <Button onClick={() => fetchGpaRecommendation(targetGpa)} disabled={loadingRecommendation || !targetGpa}>
          {loadingRecommendation ? "Submitting..." : "Submit"}
        </Button>
      </div>

      {/* Recommendation Results */}
      {(loadingRecommendation || recommendationResult || recommendationError) && (
        <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          {loadingRecommendation && (
            <Typography variant="body2" style={{ color: "#4b5563" }}>
              Loading recommendation...
            </Typography>
          )}
          {recommendationError && (
            <Typography variant="body2" style={{ color: "#dc2626", fontWeight: 600 }}>
              Error: {recommendationError}
            </Typography>
          )}
          {recommendationResult && !loadingRecommendation && (
            <Typography variant="body2" style={{ color: "#1f2937", whiteSpace: "pre-wrap", fontWeight: 500, lineHeight: 1.5 }}>
              <Markdown>
                {recommendationResult}
              </Markdown>
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};

GpaMetrics.propTypes = {
  fetchGpaRecommendation: PropTypes.func.isRequired,
  loadingRecommendation: PropTypes.bool,
  recommendationResult: PropTypes.string,
  recommendationError: PropTypes.string,
  loadingTermInformation: PropTypes.bool.isRequired,
  isFirstTerm: PropTypes.bool.isRequired,
  isFirstTermFlag: PropTypes.bool.isRequired,
  isZeroDelta: PropTypes.bool.isRequired,
  isPositive: PropTypes.bool.isRequired,
  deltaColor: PropTypes.string.isRequired,
  gpaDelta: PropTypes.number,
  gpaCircleColor: PropTypes.string.isRequired,
  currentGpa: PropTypes.number.isRequired,
  termGpaCircleColor: PropTypes.string.isRequired,
  termGpa: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isLatestTerm: PropTypes.bool.isRequired,
  diffAttendance: PropTypes.number,
  isZeroAttendanceDiff: PropTypes.bool.isRequired,
  isPositiveAttendanceDiff: PropTypes.bool.isRequired,
  attendanceDiffColor: PropTypes.string.isRequired,
  attendanceCircleColor: PropTypes.string.isRequired,
  avgAttendance: PropTypes.number,
  colors: PropTypes.object.isRequired,
};

export default GpaMetrics;
