import { useCallback, useState } from "react";

const useStudentGpa = (authenticatedEthosFetch, cardId, bannerId, termCode) => {
  const [loadingGpa, setLoadingGpa] = useState(false);
  const [errorGpa, setErrorGpa] = useState(null);
  const [gpaResult, setGpaResult] = useState(null);

  const getStudentGpa = useCallback(async () => {
    setLoadingGpa(true);
    setErrorGpa(null);
    if (!cardId || !termCode) {
      const msg = "Missing cardId or termCode";
      setErrorGpa(msg);
      setLoadingGpa(false);
      return Promise.reject(new Error(msg));
    }
    try {
      const url = `Get-StudentGPA?cardId=${encodeURIComponent(
        cardId,
      )}&term=${encodeURIComponent(termCode)}&id=${encodeURIComponent(bannerId)}`;
      const response = await authenticatedEthosFetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      if (!response) {
        throw new Error("No response from server");
      }
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          data?.message || response.statusText || "Fetch student GPA failed",
        );
      }
      setGpaResult(data);
      return data;
    } catch (error) {
      setErrorGpa(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setLoadingGpa(false);
    }
  }, [authenticatedEthosFetch, cardId, termCode, bannerId]);

  return {
    getStudentGpa,
    loadingGpa,
    errorGpa,
    gpaResult,
  };
};

export default useStudentGpa;
