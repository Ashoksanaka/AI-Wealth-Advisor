import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);

      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        !response.success
      ) {
        const err = new Error(response.error || "Operation failed");
        setError(err);
        setData(response);
        toast.error(err.message);
        return response;
      }

      setData(response);
      setError(null);
      return response;
    } catch (err) {
      setError(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
