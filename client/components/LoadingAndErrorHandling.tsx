import { QueryErrorResetBoundary } from "@tanstack/react-query";
import React, { Suspense, type FC, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button, View, Text } from "react-native";
import { Spinner } from "./ui/Spinner";

export const LoadingAndErrorHandling: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const validChildren = React.isValidElement(children) ? (
    children
  ) : typeof children === "string" ? (
    <Text>{children}</Text>
  ) : (
    children || null
  );

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
