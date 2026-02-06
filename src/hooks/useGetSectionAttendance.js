import { useCallback, useState } from "react";

const useGetSectionAttendance = (authenticatedEthosFetch, cardId) => {
  const [loadingSectionAttendance, setLoadingSectionAttendance] =
    useState(true);
  const [errorSectionAttendance, setErrorSectionAttendance] = useState(null);
  const [sectionAttendanceResult, setSectionAttendanceResult] = useState(null);

  const getSectionAttendance = useCallback(
    async (payload) => {
      const required = ["termCode", "sectionId", "bannerId"];
      const missing = required.filter((key) => !payload?.[key]);

      if (missing.length > 0) {
        const msg = `Missing required fields: ${missing.join(", ")}`;
        setErrorSectionAttendance(msg);
        return Promise.reject(new Error(msg));
      }

      if (!cardId) {
        const msg = "Missing cardId";
        setErrorSectionAttendance(msg);
        return Promise.reject(new Error(msg));
      }

      setLoadingSectionAttendance(true);
      setErrorSectionAttendance(null);

      try {
        const url = `get-section-details?cardId=${encodeURIComponent(
          cardId,
        )}&termCode=${encodeURIComponent(payload.termCode)}&bannerId=${encodeURIComponent(
          payload.bannerId,
        )}&sectionId=${encodeURIComponent(payload.sectionId)}`;

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

        setSectionAttendanceResult(data);
        return data; 
      } catch (error) {
        setErrorSectionAttendance(
          error instanceof Error ? error.message : String(error),
        );
        throw error;
      } finally {
        setLoadingSectionAttendance(false);
      }
    },
    [authenticatedEthosFetch, cardId],
  );

  return {
    getSectionAttendance,
    loadingSectionAttendance,
    errorSectionAttendance,
    sectionAttendanceResult,
  };
};

export default useGetSectionAttendance;
