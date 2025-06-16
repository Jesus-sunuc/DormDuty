import { View, type ViewProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import clsx from "clsx";

export interface CardProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
  className?: string;
}

export const Card = ({ style, className, lightColor, darkColor, ...otherProps }: CardProps) => {
  const backgroundColor = useThemeColor(
    { light: lightColor ?? "#ffffff", dark: darkColor ?? "#222222" },
    "background"
  );

  const borderColor = useThemeColor(
    { light: "rgba(0,0,0,0.1)", dark: "rgba(255,255,255,0.1)" },
    "background"
  );

  return (
    <View
      className={clsx(
        "rounded-xl border px-4 py-3 mb-4 shadow-sm",
        className
      )}
      style={[{ backgroundColor, borderColor, borderWidth: 1 }, style]}
      {...otherProps}
    />
  );
};
