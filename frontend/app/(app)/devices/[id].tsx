import { useLocalSearchParams } from "expo-router";
import { DeviceDetail } from "@/features/devices/components/DeviceDetail";

export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DeviceDetail deviceId={id} />;
}
