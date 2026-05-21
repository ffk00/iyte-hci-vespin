import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-lg font-semibold text-ink">This screen does not exist.</Text>
        <Link href="/" className="mt-4 text-primary">
          Go home
        </Link>
      </View>
    </>
  );
}
