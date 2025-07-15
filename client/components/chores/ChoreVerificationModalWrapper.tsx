import React from "react";
import { ChoreVerificationModal } from "./ChoreVerificationModal";
import { ChoreCompletion } from "@/models/Chore";

interface ChoreVerificationModalWrapperProps {
  isVisible: boolean;
  onClose: () => void;
  completions: ChoreCompletion[];
  verifierMembershipId: number;
  isAdmin?: boolean;
}

export const ChoreVerificationModalWrapper: React.FC<
  ChoreVerificationModalWrapperProps
> = (props) => {
  if (!props.isVisible) {
    return null;
  }

  return <ChoreVerificationModal {...props} />;
};
