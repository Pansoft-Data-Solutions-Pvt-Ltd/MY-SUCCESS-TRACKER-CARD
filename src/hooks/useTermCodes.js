import { useCallback, useState } from "react";

const useStudentTermCodes = (authenticatedEthosFetch, cardId) => {
  const [loadingTermCodes, setLoadingTermCodes] = useState(false);
  const [errorTermCodes, setErrorTermCodes] = useState(null);
  const [termCodesResult, setTermCodesResult] = useState(null);

  const getStudentTermCodes = useCallback(async () => {
    setLoadingTermCodes(true);
    setErrorTermCodes(null);

    if (!cardId) {
      const msg = "Missing cardId";
      setErrorTermCodes(msg);
      return Promise.reject(new Error(msg));
    }

    try {
      const url = `Get-Student-Term-codes?cardId=${encodeURIComponent(cardId)}`;

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
          data?.message ||
            response.statusText ||
            "Fetch student term codes failed",
        );
      }

      setTermCodesResult(data.termCodeDetails);
      return data.termCodeDetails;
    } catch (error) {
      setErrorTermCodes(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setLoadingTermCodes(false);
    }
  }, [authenticatedEthosFetch]);

  return {
    getStudentTermCodes,
    loadingTermCodes,
    errorTermCodes,
    termCodesResult,
  };
};

export default useStudentTermCodes;
