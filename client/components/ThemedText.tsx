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

  const fontClass = clsx(
    (type === "title" || type === "subtitle") && "font-grotesk",
    (type === "default" || type === "defaultSemiBold" || type === "link") && "font-inter"
  );

  return (
    <Text
      className={clsx(fontClass, className)}
      style={{ color: type === "link" ? tint : color }}
      {...rest}
    />
  );
}
