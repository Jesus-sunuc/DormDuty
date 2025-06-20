import { View, type ViewProps } from "react-native";
import clsx from "clsx";

export interface CardProps extends ViewProps {
  className?: string;
}

export const Card = ({ style, className, ...props }: CardProps) => {
  return (
    <View
      className={clsx(
        "rounded-xl border px-5 py-4 mb-4 shadow-sm",
        "bg-gray-50 border-gray-200 dark:bg-neutral-800",
        "border-zinc-100 dark:border-zinc-700",
        className
      )}
      style={style}
      {...props}
    />
  );
};
