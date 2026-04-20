import React from "react";
import PropTypes from "prop-types";
import { Card, Typography, Button } from "@ellucian/react-design-system/core";
import DoubleChevronIcon from "./DoubleChevron";
// import Markdown from 'react-markdown'

const GpaMetrics = ({
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
  handleOpenModal,
}) => {
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
                        {gpaDelta != null
                          ? Number(gpaDelta).toFixed(2)
                          : gpaDelta}
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
            {loadingTermInformation ? "..." : currentGpa}
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
            {loadingTermInformation
              ? "..."
              : termGpa != null && !isNaN(termGpa)
                ? Number(termGpa).toFixed(2)
                : termGpa}
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
                ? `${avgAttendance}%`
                : "N/A"}
          </div>
        </Card>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          justifyContent: "",
        }}
      >
        <div className="legends-container" style={{ width: "58%" }}>
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
              style={{
                fontWeight: 500,
                color: "#1F2937",
                whiteSpace: "nowrap",
              }}
            >
              A, B, C, D = Letter Grades
            </Typography>
            <Typography
              variant="body2"
              style={{
                fontWeight: 500,
                color: "#1F2937",
                whiteSpace: "nowrap",
              }}
            >
              F = Fail
            </Typography>
            <Typography
              variant="body2"
              style={{
                fontWeight: 500,
                color: "#03060c",
                whiteSpace: "nowrap",
              }}
            >
              N/A = Not Applicable
            </Typography>
          </div>
        </div>
        {/* Target GPA Button */}
        <div
          style={{ display: "flex", width: "100%", justifyContent: "center" }}
        >
          <Button
            onClick={handleOpenModal}
            disabled={!isLatestTerm}
            style={{ paddingLeft: "8px" }}
            variant="contained"
            color="primary"
          >
            <img
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE3NTFfNzg4NSkiPgo8cGF0aCBkPSJNMTYgMzJDMjQuODM2NiAzMiAzMiAyNC44MzY2IDMyIDE2QzMyIDcuMTYzNDQgMjQuODM2NiAwIDE2IDBDNy4xNjM0NCAwIDAgNy4xNjM0NCAwIDE2QzAgMjQuODM2NiA3LjE2MzQ0IDMyIDE2IDMyWiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzE3NTFfNzg4NSkiLz4KPHBhdGggZD0iTTE3LjU0OTEgOS4zOTk5MkMxNy4zNzkxIDkuNDU5OTIgMTcuMjY5MSA5LjYyOTkyIDE3LjI2OTEgOS44MDk5MkMxNy4yNjkxIDkuOTg5OTIgMTcuMzc5MSAxMC4xNTk5IDE3LjU0OTEgMTAuMjE5OUwxOS4zMzkxIDEwLjg4OTlDMTkuNTY5MSAxMC45Nzk5IDE5Ljc0OTEgMTEuMTU5OSAxOS44MjkxIDExLjM3OTlMMjAuNDk5MSAxMy4xNjk5QzIwLjU1OTEgMTMuMzM5OSAyMC43MjkxIDEzLjQ0OTkgMjAuOTA5MSAxMy40NDk5QzIxLjA4OTEgMTMuNDQ5OSAyMS4yNTkxIDEzLjMzOTkgMjEuMzE5MSAxMy4xNjk5TDIxLjk4OTEgMTEuMzc5OUMyMi4wNzkxIDExLjE0OTkgMjIuMjU5MSAxMC45Njk5IDIyLjQ3OTEgMTAuODg5OUwyNC4yNjkxIDEwLjIxOTlDMjQuNDM5MSAxMC4xNTk5IDI0LjU0OTEgOS45ODk5MiAyNC41NDkxIDkuODA5OTJDMjQuNTQ5MSA5LjYyOTkyIDI0LjQzOTEgOS40NTk5MiAyNC4yNjkxIDkuMzk5OTJMMjIuNDc5MSA4LjcyOTkyQzIyLjI0OTEgOC42Mzk5MiAyMi4wNjkxIDguNDU5OTIgMjEuOTg5MSA4LjIzOTkyTDIxLjMxOTEgNi40NDk5MkMyMS4yNTkxIDYuMjc5OTIgMjEuMDg5MSA2LjE2OTkyIDIwLjkwOTEgNi4xNjk5MkMyMC43MjkxIDYuMTY5OTIgMjAuNTU5MSA2LjI3OTkyIDIwLjQ5OTEgNi40NDk5MkwxOS44MjkxIDguMjM5OTJDMTkuNzM5MSA4LjQ2OTkyIDE5LjU1OTEgOC42NDk5MiAxOS4zMzkxIDguNzI5OTJMMTcuNTQ5MSA5LjM5OTkyWk01LjQ2OTE0IDE1LjI3OTlDNS4yNDkxNCAxNS4zNzk5IDUuMTE5MTQgMTUuNTk5OSA1LjExOTE0IDE1LjgyOTlDNS4xMTkxNCAxNi4wNTk5IDUuMjU5MTQgMTYuMjc5OSA1LjQ2OTE0IDE2LjM3OTlMNi4xMTkxNCAxNi42Nzk5TDYuNDI5MTQgMTYuODE5OUg2LjQ0OTE0TDkuNTE5MTQgMTguMjQ5OUM5LjY5OTE0IDE4LjMyOTkgOS44NDkxNCAxOC40Nzk5IDkuOTI5MTQgMTguNjU5OUwxMS4zNDkxIDIxLjcyOTlWMjEuNzQ5OUwxMS40OTkxIDIyLjA1OTlMMTEuNzk5MSAyMi43MDk5QzExLjg5OTEgMjIuOTI5OSAxMi4xMTkxIDIzLjA1OTkgMTIuMzQ5MSAyMy4wNTk5QzEyLjU3OTEgMjMuMDU5OSAxMi43OTkxIDIyLjkxOTkgMTIuODk5MSAyMi43MDk5TDEzLjE5OTEgMjIuMDU5OUwxMy4zMzkxIDIxLjc0OTlWMjEuNzI5OUwxNC43NjkxIDE4LjY1OTlDMTQuODQ5MSAxOC40Nzk5IDE0Ljk5OTEgMTguMzI5OSAxNS4xNzkxIDE4LjI0OTlMMTguMjQ5MSAxNi44Mjk5SDE4LjI2OTFMMTguNTc5MSAxNi42Nzk5TDE5LjIyOTEgMTYuMzc5OUMxOS40NDkxIDE2LjI3OTkgMTkuNTc5MSAxNi4wNTk5IDE5LjU3OTEgMTUuODI5OUMxOS41NzkxIDE1LjU5OTkgMTkuNDM5MSAxNS4zNzk5IDE5LjIyOTEgMTUuMjc5OUwxOC41NzkxIDE0Ljk3OTlMMTguMjY5MSAxNC44Mzk5SDE4LjI0OTFMMTUuMTc5MSAxMy40MDk5QzE0Ljk5OTEgMTMuMzI5OSAxNC44NDkxIDEzLjE3OTkgMTQuNzY5MSAxMi45OTk5TDEzLjM0OTEgOS45Mjk5MlY5LjkwOTkyTDEzLjE5OTEgOS41OTk5MkwxMi44OTkxIDguOTQ5OTJDMTIuNzk5MSA4LjcyOTkyIDEyLjU3OTEgOC41OTk5MiAxMi4zNDkxIDguNTk5OTJDMTIuMTE5MSA4LjU5OTkyIDExLjg5OTEgOC43Mzk5MiAxMS43OTkxIDguOTQ5OTJMMTEuNDk5MSA5LjU5OTkyTDExLjM1OTEgOS45MDk5MlY5LjkyOTkyTDkuOTI5MTQgMTIuOTk5OUM5Ljg0OTE0IDEzLjE3OTkgOS42OTkxNCAxMy4zMjk5IDkuNTE5MTQgMTMuNDA5OUw2LjQ0OTE0IDE0LjgyOTlINi40MjkxNEw2LjExOTE0IDE0Ljk3OTlMNS40NjkxNCAxNS4yNzk5Wk04LjYxOTE0IDE1LjgyOTlMMTAuMjc5MSAxNS4wNTk5QzEwLjg1OTEgMTQuNzg5OSAxMS4zMTkxIDE0LjMyOTkgMTEuNTg5MSAxMy43NDk5QzExLjg4OTEgMTMuMDk5OSAxMi44MTkxIDEzLjA5OTkgMTMuMTE5MSAxMy43NDk5QzEzLjM4OTEgMTQuMzI5OSAxMy44NDkxIDE0Ljc4OTkgMTQuNDI5MSAxNS4wNTk5QzE1LjA3OTEgMTUuMzU5OSAxNS4wNzkxIDE2LjI4OTkgMTQuNDI5MSAxNi41ODk5QzEzLjg0OTEgMTYuODU5OSAxMy4zODkxIDE3LjMxOTkgMTMuMTE5MSAxNy44OTk5QzEyLjgxOTEgMTguNTQ5OSAxMS44ODkxIDE4LjU0OTkgMTEuNTg5MSAxNy44OTk5QzExLjMxOTEgMTcuMzE5OSAxMC44NTkxIDE2Ljg1OTkgMTAuMjc5MSAxNi41ODk5TDguNjE5MTQgMTUuODI5OVpNMTkuODI5MSAyMC4zODk5QzE5LjczOTEgMjAuNjE5OSAxOS41NTkxIDIwLjc5OTkgMTkuMzM5MSAyMC44Nzk5TDE3LjU0OTEgMjEuNTQ5OUMxNy4zNzkxIDIxLjYwOTkgMTcuMjY5MSAyMS43Nzk5IDE3LjI2OTEgMjEuOTU5OUMxNy4yNjkxIDIyLjEzOTkgMTcuMzc5MSAyMi4zMDk5IDE3LjU0OTEgMjIuMzY5OUwxOS4zMzkxIDIzLjAzOTlDMTkuNTY5MSAyMy4xMjk5IDE5Ljc0OTEgMjMuMzA5OSAxOS44MjkxIDIzLjUyOTlMMjAuNDk5MSAyNS4zMTk5QzIwLjU1OTEgMjUuNDg5OSAyMC43MjkxIDI1LjU5OTkgMjAuOTA5MSAyNS41OTk5QzIxLjA4OTEgMjUuNTk5OSAyMS4yNTkxIDI1LjQ4OTkgMjEuMzE5MSAyNS4zMTk5TDIxLjk4OTEgMjMuNTI5OUMyMi4wNzkxIDIzLjI5OTkgMjIuMjU5MSAyMy4xMTk5IDIyLjQ3OTEgMjMuMDM5OUwyNC4yNjkxIDIyLjM2OTlDMjQuNDM5MSAyMi4zMDk5IDI0LjU0OTEgMjIuMTM5OSAyNC41NDkxIDIxLjk1OTlDMjQuNTQ5MSAyMS43Nzk5IDI0LjQzOTEgMjEuNjA5OSAyNC4yNjkxIDIxLjU0OTlMMjIuNDc5MSAyMC44Nzk5QzIyLjI0OTEgMjAuNzg5OSAyMi4wNjkxIDIwLjYwOTkgMjEuOTg5MSAyMC4zODk5TDIxLjMxOTEgMTguNTk5OUMyMS4yNTkxIDE4LjQyOTkgMjEuMDg5MSAxOC4zMTk5IDIwLjkwOTEgMTguMzE5OUMyMC43MjkxIDE4LjMxOTkgMjAuNTU5MSAxOC40Mjk5IDIwLjQ5OTEgMTguNTk5OUwxOS44MjkxIDIwLjM4OTlaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTc1MV83ODg1IiB4MT0iMTYiIHkxPSIwIiB4Mj0iMTYiIHkyPSIyOS41IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMzNjAxNDAiLz4KPHN0b3Agb2Zmc2V0PSIwLjIiIHN0b3AtY29sb3I9IiM0ODBBNTQiLz4KPHN0b3Agb2Zmc2V0PSIwLjQ1IiBzdG9wLWNvbG9yPSIjNUExMzY2Ii8+CjxzdG9wIG9mZnNldD0iMC43MiIgc3RvcC1jb2xvcj0iIzY1MTk3MiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM2OTFCNzYiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xNzUxXzc4ODUiPgo8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=="
              alt=""
              style={{ marginRight: "5px" }}
            />
            Get Target GPA Recommendation
          </Button>
        </div>
      </div>
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
  handleOpenModal: PropTypes.func,
};

export default GpaMetrics;
