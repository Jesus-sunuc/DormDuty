import { useChoresAssignedWithStatusQuery } from "@/hooks/choreHooks";
import { useMemo } from "react";

export const useChoreCount = () => {
  const {
    data: choreData,
    isLoading,
    error,
  } = useChoresAssignedWithStatusQuery();

  const choreCount = useMemo(() => {
    if (isLoading || error || !choreData) {
      return 0;
    }

    // Use the filtered chores count (excludes approved chores)
    return choreData.chores.length;
  }, [choreData, isLoading, error]);

  return choreCount;
};
