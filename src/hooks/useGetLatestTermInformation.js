import { useCallback, useState } from "react";

const useGetLatestTermInformation = (authenticatedEthosFetch, cardId) => {
  const [loadingLatestTermInformation, setLoadingLatestTermInformation] = useState(true);
  const [errorLatestTermInformation, setErrorLatestTermInformation] = useState(null);
  const [LatestTermInfo, setLatestTermInfo] = useState(null);

  const getStudentDetails = useCallback(
    async () => {
      if (!cardId) {
        const msg = "Missing cardId";
        setErrorLatestTermInformation(msg);
        return Promise.reject(new Error(msg));
      }

      setLoadingLatestTermInformation(true);
      setErrorLatestTermInformation(null);

      try {
        const url = `get-latest-term-information?cardId=${encodeURIComponent(
          cardId,
        )}`;

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

        setLatestTermInfo(data);
        return data; // allows `.then(data => …)`
      } catch (error) {
        setErrorLatestTermInformation(
          error instanceof Error ? error.message : String(error),
        );
        throw error; // allows `.catch(err => …)`
      } finally {
        setLoadingLatestTermInformation(false);
      }
    },
    [authenticatedEthosFetch, cardId],
  );

  return {
    getStudentDetails,
    loadingLatestTermInformation,
    errorLatestTermInformation,
    LatestTermInfo,
  };
};

export default useGetLatestTermInformation;
