import { useState, useEffect, useCallback, useMemo } from 'react';

const useFetch = (authenticatedEthosFetch, cardId, cardPrefix, url, params) => {

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);
  const [counter, setCounter] = useState(0);

  const refresh = useCallback(() => setCounter(p => p + 1), []);

  const stringifiedParams = JSON.stringify(params);
  const stableParams = useMemo(() => {
    return params && typeof params === 'object' ? params : {};
  }, [stringifiedParams]);

  useEffect(() => {
    const controller = new AbortController();

    const makeApiCall = async () => {
      setLoading(true);
      setData(null);
      setError(null);

      try {
        const queryString  = new URLSearchParams({ cardId, cardPrefix, ...stableParams }).toString();
        const resourcePath = `${url}?${queryString}`;
        const options      = {
          method  : 'GET',
          headers : {
            Accept         : 'application/json',
            'Content-Type' : 'application/json',
          },
          signal: controller.signal,
        };

        const response = await authenticatedEthosFetch(resourcePath, options);

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    makeApiCall();
    return () => controller.abort();

  }, [authenticatedEthosFetch, cardId, cardPrefix, url, stableParams, counter]);

  return { loading, data, error, refresh };
};

export default useFetch;