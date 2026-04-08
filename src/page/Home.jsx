import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import TermGpaBar from "../components/TermGpaBar";
import HomeHeader from "../components/HomeHeader";
import GpaMetrics from "../components/GpaMetrics";
import CourseDataView from "../components/CourseDataView";
import "./Home.css";

import { useData, useCardInfo } from "@ellucian/experience-extension-utils";
import useFetch from "../hooks/useFetch";
import { Typography, Card } from "@ellucian/react-design-system/core";

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

const blockedTermCodes = ["199610", "199510", "199520"];

const MySuccessTrackerTable = () => {
  const [currentTerm, setCurrentTerm]           = useState(null);
  const [termData, setTermData]                 = useState([]);
  const [currentBannerId, setCurrentBannerId]   = useState(null);
  const [currentTermCode, setCurrentTermCode]   = useState(null);
  const [latestTermCode, setLatestTermCode]     = useState(null);
  const [currentGpa, setCurrentGpa]             = useState(0);
  const [termGpa, setTermGpa]                   = useState(0);
  const [gpaDelta, setGpaDelta]                 = useState(0);
  const [courseData, setCourseData]             = useState([]);
  const [termGpaData, setTermGpaData]           = useState([]);
  const [initialCourseData, setInitialCourseData] = useState([]);
  const [avgAttendance, setAvgAttendance]       = useState(null);
  const [diffAttendance, setDiffAttendance]     = useState(null);
  const [isFirstTermFlag, setIsFirstTermFlag]   = useState(false);
  const [termCodesResult, setTermCodesResult]   = useState(null);

  const { authenticatedEthosFetch } = useData();
  const {
    cardId,
    cardConfiguration: {
      academicPerformancePipeline,
      termInformationPipeline,
      termCodesPipeline,
    },
  } = useCardInfo();

  // ── 1. Fetch term codes ──────────────────────────────────────────────────
  const {
    data: termCodesData,
    loading: loadingTermCodes,
  } = useFetch(authenticatedEthosFetch, cardId, null, termCodesPipeline, {});

  useEffect(() => {
    if (!termCodesData?.termCodeDetails) return;

    const filtered = termCodesData.termCodeDetails
      .filter((item) => !blockedTermCodes.includes(item.termCode))
      .sort((a, b) => a.termCode.localeCompare(b.termCode));

    setTermCodesResult(filtered);
    setTermData(filtered.map((t) => t.term));

    const latest = filtered[filtered.length - 1];
    if (latest) {
      setCurrentTerm(latest.term);
      setCurrentTermCode(latest.termCode);
      setLatestTermCode(latest.termCode);
      setCurrentBannerId(latest.bannerId);
    }
  }, [termCodesData]);

  // ── 2. Fetch current term details ────────────────────────────────────────
  const {
    data: termInfoData,
    loading: loadingTermInformation,
  } = useFetch(
    authenticatedEthosFetch,
    cardId,
    null,
    termInformationPipeline,
    currentTermCode ? { termCode: currentTermCode } : null,
  );

  useEffect(() => {
    if (!termInfoData) return;

    setCurrentGpa(parseFloat(termInfoData?.cumulativeGpa) || 0);
    setTermGpa(termInfoData?.termGpa);
    setCurrentBannerId(termInfoData?.bannerId);
    setGpaDelta(termInfoData?.cgpaDifference);
    setAvgAttendance(termInfoData?.averageAttendancePercentage ?? null);
    setDiffAttendance(termInfoData?.differenceInAttendance ?? null);
    setIsFirstTermFlag(termInfoData?.firstTermFlag ?? false);
    setInitialCourseData(
      Array.isArray(termInfoData?.termInformation) ? termInfoData.termInformation : []
    );
  }, [termInfoData]);

  // ── 3. Fetch all term GPAs ───────────────────────────────────────────────
  // We fan-out one useFetch per term. Since hooks can't be called in a loop,
  // we track this via a separate effect + Promise.all using authenticatedEthosFetch directly.
  const [loadingAllTermGpas, setLoadingAllTermGpas] = useState(false);

  useEffect(() => {
    if (!termCodesResult || termCodesResult.length === 0) return;

    const fetchAllTermGpas = async () => {
      setLoadingAllTermGpas(true);
      try {
        const results = await Promise.all(
          termCodesResult.map(async (term) => {
            try {
              const qs = new URLSearchParams({
                cardId,
                termCode: term.termCode,
              }).toString();
              const response = await authenticatedEthosFetch(
                `${termInformationPipeline}?${qs}`,
                { method: "GET", headers: { Accept: "application/json" } },
              );
              const data = await response.json();
              return {
                term: term.term,
                termCode: term.termCode,
                termGpa: data?.termGpa,
                cumulativeGpa: parseFloat(data?.cumulativeGpa) || 0,
              };
            } catch {
              return { term: term.term, termCode: term.termCode, termGpa: 0, cumulativeGpa: 0 };
            }
          }),
        );
        setTermGpaData(results);
      } finally {
        setLoadingAllTermGpas(false);
      }
    };

    fetchAllTermGpas();
  }, [termCodesResult, authenticatedEthosFetch, cardId, termInformationPipeline]);

  // ── 4. Fetch academic performance per course ─────────────────────────────
  // Same fan-out reason as above — can't call hooks in a loop.
  const [loadingCourseData, setLoadingCourseData] = useState(false);

  useEffect(() => {
    if (!initialCourseData.length || !currentTermCode || !currentBannerId) {
      setCourseData([]);
      return;
    }

    const fetchPerformance = async () => {
      setLoadingCourseData(true);
      try {
        const results = await Promise.all(
          initialCourseData.map(async (course) => {
            try {
              const qs = new URLSearchParams({
                cardId,
                termCode: currentTermCode,
                crn: course.crn,
                bannerId: currentBannerId,
              }).toString();
              const response = await authenticatedEthosFetch(
                `${academicPerformancePipeline}?${qs}`,
                { method: "GET", headers: { Accept: "application/json" } },
              );
              const data = await response.json();
              return {
                courseNumber: course.courseNumber,
                subjectCode: course.subjectCode,
                crn: course.crn,
                courseTitle: course.courseTitle || "-",
                attendancePercentage: course?.attendancePercentage
                  ? parseFloat(course.attendancePercentage)
                  : null,
                grade: data?.grade || "-",
                credit: data?.earnedCreditHours || "-",
                gradeMode: data?.gradeMode || "-",
              };
            } catch {
              return {
                crn: course.crn,
                courseNumber: "-",
                subjectCode: "-",
                courseTitle: course.courseTitle || "-",
                attendancePercentage: null,
                grade: "-",
                credit: course.credit || "-",
                gradeMode: "-",
              };
            }
          }),
        );
        setCourseData(results);
      } finally {
        setLoadingCourseData(false);
      }
    };

    fetchPerformance();
  }, [
    initialCourseData,
    currentTermCode,
    currentBannerId,
    authenticatedEthosFetch,
    cardId,
    academicPerformancePipeline,
  ]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getStatusColor = (value) => {
    if (value === null || value === undefined) return "#999";
    if (value >= TABLE_CONFIG.attendanceGood) return COLOR_CONFIG.ON_TRACK;
    if (value >= TABLE_CONFIG.attendanceWarning) return COLOR_CONFIG.NEEDS_ATTENTION;
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

  const isFirstTerm = useMemo(() => {
    if (!termCodesResult?.length) return false;
    const sorted = [...termCodesResult].sort((a, b) =>
      a.termCode.localeCompare(b.termCode),
    );
    return sorted[0]?.termCode === currentTermCode;
  }, [termCodesResult, currentTermCode]);

  const isZeroDelta               = parseFloat(gpaDelta) === 0;
  const isPositive                = gpaDelta >= 0;
  const gpaCircleColor            = getGpaCircleColor(currentGpa);
  const termGpaCircleColor        = getGpaCircleColor(termGpa);
  const attendanceCircleColor     = getStatusColor(avgAttendance);
  const deltaColor                = isPositive ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;
  const isLatestTerm              = currentTermCode === latestTermCode;
  const attendanceDiff            = parseFloat(diffAttendance);
  const isZeroAttendanceDiff      = attendanceDiff === 0;
  const isPositiveAttendanceDiff  = attendanceDiff > 0;
  const attendanceDiffColor       = isPositiveAttendanceDiff ? COLOR_CONFIG.ON_TRACK : COLOR_CONFIG.CRITICAL;

  const isLoading = loadingTermInformation;

  return (
    <div className="root">
      <Card className="card">
        <HomeHeader
          currentTerm={currentTerm}
          termCodesResult={termCodesResult}
          blockedTermCodes={blockedTermCodes}
          loadingTermCodes={loadingTermCodes}
          handleTermChange={handleTermChange}
        />

        {isLoading && (
          <Typography style={{ padding: "20px", textAlign: "center", color: "#02050c" }}>
            Loading student details...
          </Typography>
        )}

        {!isLoading && (
          <>
            <div className="gpa-cards-wrapper">
              <div style={{ display: "flex", gap: "20px", justifyContent: "space-between", width: "100%" }}>
                <GpaMetrics
                  loadingTermInformation={loadingTermInformation}
                  isFirstTerm={isFirstTerm}
                  isFirstTermFlag={isFirstTermFlag}
                  isZeroDelta={isZeroDelta}
                  isPositive={isPositive}
                  deltaColor={deltaColor}
                  gpaDelta={gpaDelta}
                  gpaCircleColor={gpaCircleColor}
                  currentGpa={currentGpa}
                  termGpaCircleColor={termGpaCircleColor}
                  termGpa={termGpa}
                  isLatestTerm={isLatestTerm}
                  diffAttendance={diffAttendance}
                  isZeroAttendanceDiff={isZeroAttendanceDiff}
                  isPositiveAttendanceDiff={isPositiveAttendanceDiff}
                  attendanceDiffColor={attendanceDiffColor}
                  attendanceCircleColor={attendanceCircleColor}
                  avgAttendance={avgAttendance}
                  colors={COLOR_CONFIG}
                />

                <Card className="term-gpa-bar-card">
                  <TermGpaBar
                    termData={termData}
                    termGpaData={termGpaData}
                    loading={loadingAllTermGpas}
                  />
                </Card>
              </div>
            </div>

            <CourseDataView
              loadingCourseData={loadingCourseData}
              courseData={courseData}
              getStatusColor={getStatusColor}
              tableConfig={TABLE_CONFIG}
              colors={COLOR_CONFIG}
            />
          </>
        )}
      </Card>
    </div>
  );
};

MySuccessTrackerTable.propTypes = {
  classes: PropTypes.object,
};

export default MySuccessTrackerTable;