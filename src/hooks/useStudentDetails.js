import { useCallback, useState } from "react";

const useStudentDetails = (authenticatedEthosFetch, cardId) => {
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(true);
  const [errorStudentDetails, setErrorStudentDetails] = useState(null);
  const [studentDetailsResult, setStudentDetailsResult] = useState(null);

  const getStudentDetails = useCallback(
    async (payload) => {
      const required = ["termCode"];
      const missing = required.filter((key) => !payload?.[key]);

      if (missing.length > 0) {
        const msg = `Missing required fields: ${missing.join(", ")}`;
        setErrorStudentDetails(msg);
        return Promise.reject(new Error(msg));
      }

      if (!cardId) {
        const msg = "Missing cardId";
        setErrorStudentDetails(msg);
        return Promise.reject(new Error(msg));
      }

      setLoadingStudentDetails(true);
      setErrorStudentDetails(null);

      try {
        const url = `Get-StudentDetails?cardId=${encodeURIComponent(
          cardId,
        )}&termCode=${encodeURIComponent(payload.termCode)}`;

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

        setStudentDetailsResult(data);
        return data; // allows `.then(data => …)`
      } catch (error) {
        setErrorStudentDetails(
          error instanceof Error ? error.message : String(error),
        );
        throw error; // allows `.catch(err => …)`
      } finally {
        setLoadingStudentDetails(false);
      }
    },
    [authenticatedEthosFetch, cardId],
  );

  return {
    getStudentDetails,
    loadingStudentDetails,
    errorStudentDetails,
    studentDetailsResult,
  };
};

export default useStudentDetails;
