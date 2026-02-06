import { useCallback, useState } from "react";

const useGetTermInformation = (authenticatedEthosFetch, cardId) => {
  const [loadingTermInformation, setLoadingTermInformation] = useState(true);
  const [errorTermInformation, setErrorTermInformation] = useState(null);
  const [termInformation, setTermInformation] = useState(null);

  const getStudentDetails = useCallback(
    async (payload) => {
      const required = ["termCode"];
      const missing = required.filter((key) => !payload?.[key]);

      if (missing.length > 0) {
        const msg = `Missing required fields: ${missing.join(", ")}`;
        setErrorTermInformation(msg);
        return Promise.reject(new Error(msg));
      }

      if (!cardId) {
        const msg = "Missing cardId";
        setErrorTermInformation(msg);
        return Promise.reject(new Error(msg));
      }

      setLoadingTermInformation(true);
      setErrorTermInformation(null);

      try {
        const url = `get-term-information?cardId=${encodeURIComponent(
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

        setTermInformation(data);
        return data; // allows `.then(data => …)`
      } catch (error) {
        setErrorTermInformation(
          error instanceof Error ? error.message : String(error),
        );
        throw error; // allows `.catch(err => …)`
      } finally {
        setLoadingTermInformation(false);
      }
    },
    [authenticatedEthosFetch, cardId],
  );

  return {
    getStudentDetails,
    loadingTermInformation,
    errorTermInformation,
    termInformation,
  };
};

export default useGetTermInformation;
