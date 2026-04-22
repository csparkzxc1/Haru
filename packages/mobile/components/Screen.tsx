import { SafeAreaView, ScrollView, Text, View } from "react-native";

export function Screen({
  title,
  subtitle,
  count,
  children,
}: {
  title?: string;
  subtitle?: string;
  count?: number;
  children?: React.ReactNode;
}) {
  return (
    <SafeAreaView className="flex-1 bg-haru-paper dark:bg-haru-ink">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        {title && (
          <>
            <View className="flex-row items-baseline">
              <Text className="text-3xl font-semibold text-haru-ink dark:text-haru-paper tracking-tight">
                {title}
              </Text>
              {count != null && count > 0 && (
                <Text className="text-xl text-haru-muted ml-2">{count}</Text>
              )}
            </View>
            {subtitle && (
              <Text className="mt-1 text-sm text-haru-muted">{subtitle}</Text>
            )}
          </>
        )}
        <View className="mt-8">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
