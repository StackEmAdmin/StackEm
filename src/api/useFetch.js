import { useState, useEffect } from 'react';

/**
 * Custom React hook for fetching data from the specified URL.
 *
 * @param {string} url - The URL to fetch data from.
 * @returns {Object} - An object containing:
 *   - data: The fetched data, or null if not yet fetched.
 *   - loading: A boolean indicating if the request is still in progress.
 *   - error: An error object if the request failed, or null if successful.
 *
 * This hook automatically handles aborting the fetch request when the component
 * using it unmounts or the URL changes. It performs the fetch request with CORS
 * mode enabled.
 */
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetch(url, { mode: 'cors', signal })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(
            `HTTP error ${response.status}: ${response.statusText}`
          );
        }
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

export default useFetch;
