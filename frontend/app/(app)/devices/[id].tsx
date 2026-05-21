import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-ink">Device {id}</Text>
    </View>
  );
}
