import { Text, View } from "react-native";

export function EmptyState({
  emoji,
  message,
  hint,
}: {
  emoji: string;
  message: string;
  hint?: string;
}) {
  return (
    <View className="items-center justify-center py-12">
      <Text className="text-5xl">{emoji}</Text>
      <Text className="text-base text-haru-muted text-center mt-3">{message}</Text>
      {hint && (
        <Text className="text-xs text-haru-muted text-center mt-1 opacity-60">{hint}</Text>
      )}
    </View>
  );
}
