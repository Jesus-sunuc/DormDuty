import { useChoresAssignedToUserQuery } from "@/hooks/choreHooks";
import { useMemo } from "react";

export const useChoreCount = () => {
  const { data: chores, isLoading, error } = useChoresAssignedToUserQuery();

  const choreCount = useMemo(() => {
    if (isLoading || error || !chores) {
      return 0;
    }

    return chores.length;
  }, [chores, isLoading, error]);

  return choreCount;
};
