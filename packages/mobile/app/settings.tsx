import { Pressable, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { useAuth } from "../lib/auth";
import { useTheme, type ColorScheme, type FontScale } from "../lib/theme";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { scheme, setScheme, fontScale, setFontScale } = useTheme();

  return (
    <Screen title="설정" subtitle={user?.nickname ?? ""}>
      <View className="rounded-xl border border-black/5 dark:border-white/10 p-4 mb-4">
        <Text className="text-xs text-haru-muted uppercase tracking-widest mb-2">
          색 모드
        </Text>
        <View className="flex-row gap-2">
          {(["system", "light", "dark"] as ColorScheme[]).map((s) => (
            <Choice
              key={s}
              active={scheme === s}
              onPress={() => setScheme(s)}
              label={s === "system" ? "시스템" : s === "light" ? "라이트" : "다크"}
            />
          ))}
        </View>

        <Text className="text-xs text-haru-muted uppercase tracking-widest mb-2 mt-5">
          글자 크기
        </Text>
        <View className="flex-row gap-2">
          {(["default", "senior"] as FontScale[]).map((f) => (
            <Choice
              key={f}
              active={fontScale === f}
              onPress={() => setFontScale(f)}
              label={f === "default" ? "기본" : "큰 글자"}
            />
          ))}
        </View>
      </View>

      <Pressable
        onPress={() => logout()}
        className="mt-6 px-4 py-3 rounded-xl border border-black/10 dark:border-white/15"
      >
        <Text className="text-haru-accent text-center">로그아웃</Text>
      </Pressable>
    </Screen>
  );
}

function Choice({
  active,
  onPress,
  label,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-2 rounded-md border ${
        active ? "border-haru-accent" : "border-black/10 dark:border-white/15"
      }`}
    >
      <Text className={active ? "text-haru-accent text-sm" : "text-sm"}>{label}</Text>
    </Pressable>
  );
}
