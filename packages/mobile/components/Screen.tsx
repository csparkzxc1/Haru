import { SafeAreaView, ScrollView, Text, View } from "react-native";

export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <SafeAreaView className="flex-1 bg-haru-paper dark:bg-haru-ink">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        <Text className="text-3xl font-semibold text-haru-ink dark:text-haru-paper tracking-tight">
          {title}
        </Text>
        {subtitle && (
          <Text className="mt-1 text-sm text-haru-muted">{subtitle}</Text>
        )}
        <View className="mt-8">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
