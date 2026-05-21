import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/features/auth/store";

export default function AppLayout() {
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (!isHydrated) return null;
  if (!token) return <Redirect href="/(auth)/chooser" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
