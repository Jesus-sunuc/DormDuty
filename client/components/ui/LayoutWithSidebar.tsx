import React from "react";
import { View } from "react-native";
import { Sidebar } from "@/components/ui/Sidebar";
import { SidebarProvider, useSidebar } from "@/hooks/useSidebar";

interface LayoutWithSidebarProps {
  children: React.ReactNode;
}

const LayoutWithSidebarContent: React.FC<LayoutWithSidebarProps> = ({
  children,
}) => {
  const { isSidebarOpen, closeSidebar } = useSidebar();

  return (
    <View className="flex-1">
      {children}
      <Sidebar isVisible={isSidebarOpen} onClose={closeSidebar} />
    </View>
  );
};

export const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({
  children,
}) => {
  return (
    <SidebarProvider>
      <LayoutWithSidebarContent>{children}</LayoutWithSidebarContent>
    </SidebarProvider>
  );
};
