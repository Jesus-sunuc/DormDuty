import { Text, type TextProps } from "react-native";
import clsx from "clsx";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
  className?: string;
};

export function ThemedText({
  lightColor,
  darkColor,
  type = "default",
  className,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const tint = useThemeColor({}, "tint");

  const defaultStyles = clsx(
    type === "title" && "text-2xl font-bold",
    type === "subtitle" && "text-lg font-semibold",
    type === "defaultSemiBold" && "text-base font-semibold",
    type === "link" && "text-sm underline",
    type === "default" && "text-base",
    className
  );

  return (
    <Text
      className={defaultStyles}
      style={{ color: type === "link" ? tint : color }}
      {...rest}
    />
  );
}
