import { useEffect, useState } from "react";
import axios from "axios";
import useEmptyObject from "@/hooks/useEmptyObject";

const initialState = {
  isLoading: false,
  error: {},
  serialNum: "",
};

const SerialNumber = () => {
  const [state, setState] = useState(initialState);
  const { isLoading, error, serialNum } = state;

  useEffect(() => {
    const fetchSerialNumber = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const { data = {} } = await axios.get("/api/uuid");
        setState((prev) => ({ ...prev, serialNum: data?.serialNumber }));
      } catch (err) {
        setState((prev) => ({ ...prev, error: err }));
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
        console.error(error);
      }
    };

    fetchSerialNumber();
  }, []);

  return (
    <div className="space-y-2 bg-slate-100 shadow rounded-md w-80 p-5">
      <h1 className="font-semibold text-2xl text-black/70 text-center">
        User Id
      </h1>
      <div className=" font-semibold w-50">
        {isLoading || !serialNum ? (
          <p className="w-full bg-red-400 h-8 rounded-md animate-pulse"></p>
        ) : useEmptyObject(error) ? (
          <p
            title={serialNum || "no value"}
            className="h-8 grid place-items-center tracking-wide text-red-600 rounded-md min-w-fit max-w-full truncate"
          >
            Un expected error occurred.
          </p>
        ) : (
          <p
            title={serialNum || "no value"}
            className="h-8 grid place-items-center tracking-wide bg-red-400 text-white rounded-md min-w-fit max-w-full truncate"
          >
            {serialNum}
          </p>
        )}
      </div>
    </div>
  );
};

export default SerialNumber;
