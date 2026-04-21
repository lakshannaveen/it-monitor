import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBarcodeTimes } from "../store/slices/barcodeSlice";
import { selectLoading, selectError, selectLastFetched } from "../store/selectors";

export const useFetch = (autoFetch = true) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const lastFetched = useSelector(selectLastFetched);

  const refetch = () => dispatch(fetchBarcodeTimes());

  useEffect(() => {
    if (autoFetch && !lastFetched) {
      dispatch(fetchBarcodeTimes());
    }
  }, [autoFetch, lastFetched, dispatch]);

  return { loading, error, lastFetched, refetch };
};
