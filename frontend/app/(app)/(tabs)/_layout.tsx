import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="devices" options={{ title: "Devices" }} />
      <Tabs.Screen name="eq" options={{ title: "EQ" }} />
      <Tabs.Screen name="party" options={{ title: "Party" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
