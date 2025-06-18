import { View, type ViewProps } from "react-native";
import clsx from "clsx";

export type ThemedViewProps = ViewProps & {
  className?: string;
};

export function ThemedView({ className, ...rest }: ThemedViewProps) {
  return (
    <View
      className={clsx("bg-white dark:bg-neutral-900", className)}
      {...rest}
    />
  );
}
