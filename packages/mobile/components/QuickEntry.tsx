import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { parseKoreanEntry } from "@haru/shared/korean-date";
import { useTasksStore } from "@/store/tasks";

export function QuickEntry() {
  const [value, setValue] = useState("");
  const addTask = useTasksStore((s) => s.addTask);
  const parsed = value.trim() ? parseKoreanEntry(value) : null;

  function handleSubmit() {
    if (!parsed) return;
    addTask({
      title: parsed.title,
      when: parsed.when ?? null,
      deadline: parsed.deadline ?? null,
      tags: parsed.tags,
    });
    setValue("");
  }

  return (
    <View className="mb-6">
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
        placeholder='예: "내일 오후 3시 팀 회의 #회의"'
        placeholderTextColor="#8E8E93"
        className="px-4 py-3 rounded-xl border border-black/10 text-[15px] text-haru-ink dark:text-haru-paper"
      />
      {parsed && (
        <View className="mt-2 p-3 rounded-lg bg-black/5 dark:bg-white/10">
          <Text className="text-xs text-haru-muted">📝 {parsed.title}</Text>
          {parsed.when && (
            <Text className="text-xs text-haru-muted mt-0.5">
              📅 {new Date(parsed.when).toLocaleString("ko-KR")}
            </Text>
          )}
          {parsed.deadline && (
            <Text className="text-xs text-haru-muted mt-0.5">
              ⏰ 마감: {new Date(parsed.deadline).toLocaleString("ko-KR")}
            </Text>
          )}
          {parsed.tags.length > 0 && (
            <Text className="text-xs text-haru-muted mt-0.5">
              {parsed.tags.map((t) => `#${t}`).join(" ")}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
