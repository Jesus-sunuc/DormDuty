import { QueryErrorResetBoundary } from "@tanstack/react-query";
import React, { Suspense, type FC, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button, View, Text } from "react-native";
import { Spinner } from "./ui/Spinner";

export const LoadingAndErrorHandling: FC<{
  children: ReactNode;
  isLoading?: boolean;
  error?: Error | null;
}> = ({ children, isLoading = false, error = null }) => {
  const validChildren = React.isValidElement(children) ? (
    children
  ) : typeof children === "string" ? (
    <Text>{children}</Text>
  ) : (
    children || null
  );

  if (isLoading) {
    return <Spinner text="Loading..." />;
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ marginBottom: 8, textAlign: "center" }}>
          {`Error: ${error?.message || "Something went wrong."}`}
        </Text>
        <Button
          title="Try again"
          onPress={() => {
          }}
        />
      </View>
    );
  }

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary, error }) => (
            <View style={{ padding: 16, alignItems: "center" }}>
              <Text style={{ marginBottom: 8 }}>
                {`Error: ${error?.message || (error ? String(error) : "Something went wrong.")}`}
              </Text>
              <Button title="Try again" onPress={resetErrorBoundary} />
            </View>
          )}
        >
          <Suspense fallback={<Spinner />}>{validChildren}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};
