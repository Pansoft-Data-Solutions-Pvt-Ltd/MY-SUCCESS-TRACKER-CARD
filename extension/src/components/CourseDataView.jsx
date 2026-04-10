import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from "@ellucian/react-design-system/core";

const CourseDataView = ({
  loadingCourseData,
  courseData,
  getStatusColor,
  tableConfig,
  colors,
}) => {
  return (
    <>
      {/* DESKTOP TABLE VIEW */}
      <div className="table-container">
        <Table className="table">
          <TableHead>
            <TableRow>
              <TableCell className="header-cell">Course</TableCell>
              <TableCell className="header-cell">Grade</TableCell>
              <TableCell className="header-cell">Credits Earned</TableCell>
              <TableCell className="header-cell last-cell">
                Attendance
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingCourseData || courseData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="body-cell">
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
                const attendanceColor = getStatusColor(row.attendancePercentage);
                const isLowGrade = tableConfig.lowGrades.includes(row.grade);
                const attendanceDisplay =
                  row.attendancePercentage !== null
                    ? `${row.attendancePercentage}%`
                    : "N/A";

                return (
                  <TableRow key={row.crn || index} className="table-row">
                    <TableCell className="body-cell">
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Typography variant="body2">
                          {row.subjectCode}-{row.courseNumber}
                        </Typography>
                        <Typography
                          variant="caption"
                          style={{ color: "#6B7280" }}
                        >
                          {row.courseTitle}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`body-cell ${isLowGrade ? "low-grade" : ""}`}
                    >
                      {row?.grade}
                    </TableCell>
                    <TableCell className="body-cell">
                      <Typography variant="body2">{row?.credit}</Typography>
                    </TableCell>
                    <TableCell className="body-cell last-cell">
                      <div className="progress-wrapper">
                        {row.attendancePercentage !== null ? (
                          <>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
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

      {/* MOBILE CARD VIEW */}
      <div className="mobile-card-list">
        {loadingCourseData || courseData.length === 0 ? (
          <Typography
            style={{
              textAlign: "center",
              color: "#6B7280",
              fontStyle: "italic",
              padding: "30px",
            }}
          >
            {loadingCourseData
              ? "Loading course data..."
              : "No course data available for this term"}
          </Typography>
        ) : (
          courseData.map((row, index) => {
            const attendanceColor = getStatusColor(row.attendancePercentage);
            const isLowGrade = tableConfig.lowGrades.includes(row?.grade);
            const attendanceDisplay =
              row.attendancePercentage !== null
                ? `${row.attendancePercentage}%`
                : "N/A";

            return (
              <div key={row.crn || index} className="mobile-card">
                <div className="mobile-card-header">
                  <div className="mobile-card-title">
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
                    className="mobile-card-grade"
                    style={{
                      color: isLowGrade ? colors.CRITICAL : "#1F2937",
                    }}
                  >
                    {row.grade}
                  </div>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Credits</span>
                  <span className="mobile-card-value">{row.credit}</span>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Attendance</span>
                  <div className="mobile-progress-wrapper">
                    {row.attendancePercentage !== null ? (
                      <>
                        <div className="mobile-progress-bar">
                          <div
                            className="progress-fill"
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
    </>
  );
};

CourseDataView.propTypes = {
  loadingCourseData: PropTypes.bool.isRequired,
  courseData: PropTypes.array.isRequired,
  getStatusColor: PropTypes.func.isRequired,
  tableConfig: PropTypes.object.isRequired,
  colors: PropTypes.object.isRequired,
};

export default CourseDataView;
