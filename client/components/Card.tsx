import { View, type ViewProps } from "react-native";
import clsx from "clsx";

export interface CardProps extends ViewProps {
  className?: string;
}

export const Card = ({ style, className, ...props }: CardProps) => {
  return (
    <View
      className={clsx(
        "rounded-2xl border px-4 py-3 mb-4 shadow-sm",
        "bg-white dark:bg-zinc-900",
        "border-zinc-100 dark:border-zinc-700",
        className
      )}
      style={style}
      {...props}
    />
  );
};
