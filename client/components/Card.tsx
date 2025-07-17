import { View, type ViewProps } from "react-native";
import clsx from "clsx";

export interface CardProps extends ViewProps {
  className?: string;
}

export const Card = ({ style, className, ...props }: CardProps) => {
  return (
    <View
      className={clsx(
        "rounded-xl border px-4 py-4 mb-2 shadow-lg",
        "bg-white border-gray-300 dark:bg-neutral-800",
        "border-gray-300 dark:border-zinc-700",
        className
      )}
      style={style}
      {...props}
    />
  );
};
