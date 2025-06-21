import { View, type ViewProps } from "react-native";
import clsx from "clsx";

export interface CardProps extends ViewProps {
  className?: string;
}

export const Card = ({ style, className, ...props }: CardProps) => {
  return (
    <View
      className={clsx(
        "rounded-xl border px-5 py-4 mb-2 shadow-sm",
        "bg-gray-100 border-gray-200 dark:bg-neutral-800",
        "border-zinc-200 dark:border-zinc-700",
        className
      )}
      style={style}
      {...props}
    />
  );
};
