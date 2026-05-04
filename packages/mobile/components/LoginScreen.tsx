import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../lib/auth";

type Mode = "login" | "register";

export function LoginScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("demo@haru.app");
  const [password, setPassword] = useState("demo1234!");
  const [nickname, setNickname] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!agree) {
          setError("필수 약관에 동의해 주세요");
          setBusy(false);
          return;
        }
        await register({
          email,
          password,
          nickname,
          privacyAgreed: true,
          termsAgreed: true,
        });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-haru-paper dark:bg-haru-ink">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-8">
          <Text className="text-3xl font-semibold text-haru-ink dark:text-haru-paper tracking-tight">
            하루
          </Text>
          <Text className="mt-1 text-sm text-haru-muted">
            {mode === "login" ? "로그인하고 오늘을 시작하세요" : "계정을 만드세요"}
          </Text>

          <View className="mt-8 gap-3">
            <View>
              <Text className="text-xs text-haru-muted mb-1">이메일</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                className="px-4 py-3 rounded-xl border border-black/10 dark:border-white/15 text-[15px] text-haru-ink dark:text-haru-paper"
              />
            </View>

            {mode === "register" && (
              <View>
                <Text className="text-xs text-haru-muted mb-1">닉네임</Text>
                <TextInput
                  value={nickname}
                  onChangeText={setNickname}
                  className="px-4 py-3 rounded-xl border border-black/10 dark:border-white/15 text-[15px] text-haru-ink dark:text-haru-paper"
                />
              </View>
            )}

            <View>
              <Text className="text-xs text-haru-muted mb-1">비밀번호</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="px-4 py-3 rounded-xl border border-black/10 dark:border-white/15 text-[15px] text-haru-ink dark:text-haru-paper"
              />
            </View>

            {mode === "register" && (
              <View className="flex-row items-center gap-2 mt-1">
                <Switch
                  value={agree}
                  onValueChange={setAgree}
                  trackColor={{ true: "#FF6B35", false: "#ccc" }}
                />
                <Text className="text-xs text-haru-muted flex-1">
                  이용약관과 개인정보처리방침에 동의합니다 (필수)
                </Text>
              </View>
            )}

            {error && <Text className="text-sm text-red-500">{error}</Text>}

            <Pressable
              onPress={onSubmit}
              disabled={busy}
              className="mt-2 rounded-xl bg-haru-accent py-3 items-center"
            >
              <Text className="text-white font-medium">
                {busy
                  ? "처리 중…"
                  : mode === "login"
                    ? "이메일로 로그인"
                    : "가입하기"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMode((m) => (m === "login" ? "register" : "login"));
                setError(null);
              }}
              className="items-center py-2"
            >
              <Text className="text-xs text-haru-muted">
                {mode === "login"
                  ? "계정이 없으신가요? 회원가입"
                  : "이미 계정이 있으신가요? 로그인"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
