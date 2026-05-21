import { Tabs } from "expo-router";
import { BottomTabBar } from "@/components/layout/BottomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tabs.Screen name="devices" options={{ title: "Home" }} />
      <Tabs.Screen name="eq" options={{ title: "EQ" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
