import { useCallback, useState } from "react";

const useGetAcademicPerformance = (authenticatedEthosFetch, cardId) => {
  const [loadingAcademicPerformance, setLoadingAcademicPerformance] =
    useState(true);
  const [errorAcademicPerformance, setErrorAcademicPerformance] =
    useState(null);
  const [academicPerformanceResult, setAcademicPerformanceResult] =
    useState(null);

  const getAcademicPerformance = useCallback(
    async (payload) => {
      const required = ["termCode", "crn", "bannerId"];
      const missing = required.filter((key) => !payload?.[key]);
      if (missing.length > 0) {
        const msg = `Missing required fields: ${missing.join(", ")}`;
        setErrorAcademicPerformance(msg);
        return Promise.reject(new Error(msg));
      }
      if (!cardId) {
        const msg = "Missing cardId";
        setErrorAcademicPerformance(msg);
        return Promise.reject(new Error(msg));
      }

      setLoadingAcademicPerformance(true);
      setErrorAcademicPerformance(null);

      try {
        const url = `get-academic-performance?cardId=${encodeURIComponent(
          cardId,
        )}&termCode=${encodeURIComponent(payload.termCode)}&crn=${encodeURIComponent(
          payload.crn,
        )}&bannerId=${encodeURIComponent(payload.bannerId)}`;

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
              "Fetch academic performance failed",
          );
        }

        setAcademicPerformanceResult(data);
        return data;
      } catch (error) {
        setErrorAcademicPerformance(
          error instanceof Error ? error.message : String(error),
        );
        throw error;
      } finally {
        setLoadingAcademicPerformance(false);
      }
    },
    [authenticatedEthosFetch, cardId],
  );

  return {
    getAcademicPerformance,
    loadingAcademicPerformance,
    errorAcademicPerformance,
    academicPerformanceResult,
  };
};

export default useGetAcademicPerformance;
