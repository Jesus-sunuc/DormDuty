import { useChoresAssignedToUserQuery } from "@/hooks/choreHooks";

export const useChoreCount = () => {
  const { data: chores = [] } = useChoresAssignedToUserQuery();
  return chores.length;
};
