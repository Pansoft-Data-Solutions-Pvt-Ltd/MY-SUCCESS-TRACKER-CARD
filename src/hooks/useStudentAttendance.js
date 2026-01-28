import { useCallback, useState } from "react";

const useStudentAttendance = (authenticatedEthosFetch, cardId) => {
  const [loadingStudentAttendance, setLoadingStudentAttendance] =
    useState(true);
  const [errorStudentAttendance, setErrorStudentAttendance] = useState(null);
  const [studentAttendanceResult, setStudentAttendanceResult] = useState(null);

  const getStudentAttendance = useCallback(
    async (payload) => {
      const required = ["termCode"];
      const missing = required.filter((key) => !payload?.[key]);

      if (missing.length > 0) {
        const msg = `Missing required fields: ${missing.join(", ")}`;
        setErrorStudentAttendance(msg);
        return Promise.reject(new Error(msg));
      }

      if (!cardId) {
        const msg = "Missing cardId";
        setErrorStudentAttendance(msg);
        return Promise.reject(new Error(msg));
      }

      setLoadingStudentAttendance(true);
      setErrorStudentAttendance(null);

      try {
        const url = `Get-StudentAttendance?cardId=${encodeURIComponent(
          cardId,
        )}&term=${encodeURIComponent(payload.termCode)}&id=${encodeURIComponent(
          payload.bannerId,
        )}&crn=${encodeURIComponent(payload.courseReferenceNumber)}`;

        const response = await authenticatedEthosFetch(url, {
          method: "GET",
        });

        if (!response) {
          throw new Error("No response from server");
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              response.statusText ||
              "Fetch student details failed",
          );
        }

        setStudentAttendanceResult(data);
        return data; // allows `.then(data => …)`
      } catch (error) {
        setErrorStudentAttendance(
          error instanceof Error ? error.message : String(error),
        );
        throw error; // allows `.catch(err => …)`
      } finally {
        setLoadingStudentAttendance(false);
      }
    },
    [authenticatedEthosFetch, cardId],
  );

  return {
    getStudentAttendance,
    loadingStudentAttendance,
    errorStudentAttendance,
    studentAttendanceResult,
  };
};

export default useStudentAttendance;
