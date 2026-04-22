import { useState } from "react";
import { Alert, Keyboard, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasksStore } from "@/store/tasks";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const task = useTasksStore((s) => s.tasks.find((t) => t.id === id));
  const updateTask = useTasksStore((s) => s.updateTask);
  const toggleDone = useTasksStore((s) => s.toggleDone);
  const toggleStar = useTasksStore((s) => s.toggleStar);
  const deleteTask = useTasksStore((s) => s.deleteTask);
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  function addTag() {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    const currentTags = task?.tags ?? [];
    if (currentTags.includes(trimmed)) {
      setNewTag("");
      return;
    }
    updateTask(task!.id, { tags: [...currentTags, trimmed] });
    setNewTag("");
  }

  function removeTag(tag: string) {
    const currentTags = task?.tags ?? [];
    updateTask(task!.id, { tags: currentTags.filter((t) => t !== tag) });
  }

  if (!task) {
    return (
      <SafeAreaView className="flex-1 bg-haru-paper dark:bg-haru-ink items-center justify-center">
        <Text className="text-haru-muted">할 일을 찾을 수 없어요</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-haru-paper dark:bg-haru-ink">
      {/* 네비게이션 바 */}
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="mr-4 py-1">
          <Text className="text-haru-accent text-base">← 뒤로</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8 }}>
        {/* 제목 */}
        <TextInput
          value={task.title}
          onChangeText={(v) => updateTask(task.id, { title: v })}
          placeholder="할 일 제목"
          placeholderTextColor="#8E8E93"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
          multiline={false}
          className={`text-2xl font-semibold tracking-tight text-haru-ink dark:text-haru-paper ${
            task.done ? "line-through text-haru-muted" : ""
          }`}
        />

        {/* 배지 행 (토글 버튼) */}
        <View className="flex-row flex-wrap gap-2 mt-3">
          {/* 완료 */}
          <Pressable
            onPress={() => toggleDone(task.id)}
            className={`px-3 py-1.5 rounded-full border ${
              task.done
                ? "bg-haru-accent/10 border-haru-accent"
                : "border-haru-muted"
            }`}
          >
            <Text className={`text-xs font-medium ${task.done ? "text-haru-accent" : "text-haru-muted"}`}>
              ✓ 완료
            </Text>
          </Pressable>

          {/* 별표 */}
          <Pressable
            onPress={() => toggleStar(task.id)}
            className={`px-3 py-1.5 rounded-full border ${
              task.star
                ? "bg-yellow-400/10 border-yellow-400"
                : "border-haru-muted"
            }`}
          >
            <Text className={`text-xs font-medium ${task.star ? "text-yellow-500" : "text-haru-muted"}`}>
              ★ 중요
            </Text>
          </Pressable>

          {/* 우선순위 */}
          <Pressable
            onPress={() => updateTask(task.id, { priority: task.priority === "high" ? undefined : "high" })}
            className={`px-3 py-1.5 rounded-full border ${
              task.priority === "high"
                ? "bg-[#E04E2A]/10 border-[#E04E2A]"
                : "border-haru-muted"
            }`}
          >
            <Text className={`text-xs font-medium ${task.priority === "high" ? "text-[#E04E2A]" : "text-haru-muted"}`}>
              !! 높음
            </Text>
          </Pressable>

          {/* 언젠가 */}
          <Pressable
            onPress={() => updateTask(task.id, { someday: !task.someday })}
            className={`px-3 py-1.5 rounded-full border ${
              task.someday
                ? "bg-black/5 border-black/10"
                : "border-haru-muted"
            }`}
          >
            <Text className="text-xs font-medium text-haru-muted">
              💭 언젠가
            </Text>
          </Pressable>
        </View>

        {/* 날짜 정보 */}
        <View className="mt-6 gap-2">
          {task.when && (
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-haru-muted w-16">예정일</Text>
              <Text className="text-sm text-haru-ink dark:text-haru-paper">
                {new Date(task.when).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </Text>
            </View>
          )}
          {task.deadline && (
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-haru-muted w-16">마감일</Text>
              <Text className="text-sm text-[#E04E2A]">
                {new Date(task.deadline).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </Text>
            </View>
          )}
          {task.doneAt && (
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-haru-muted w-16">완료일</Text>
              <Text className="text-sm text-haru-ink dark:text-haru-paper">
                {new Date(task.doneAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          )}
        </View>

        {/* 태그 */}
        <View className="flex-row flex-wrap gap-2 mt-6 items-center">
          {task.tags?.map((tag) => (
            <View key={tag} className="flex-row items-center bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full">
              <Text className="text-xs text-haru-muted">#{tag}</Text>
              <Pressable onPress={() => removeTag(tag)} className="ml-1">
                <Text className="text-xs text-haru-muted">×</Text>
              </Pressable>
            </View>
          ))}
          {isAddingTag ? (
            <TextInput
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={() => { addTag(); setIsAddingTag(false); }}
              onBlur={() => { addTag(); setIsAddingTag(false); }}
              autoFocus
              placeholder="태그"
              placeholderTextColor="#8E8E93"
              className="text-xs px-2 py-1 bg-black/5 dark:bg-white/10 rounded-full min-w-[60px] text-haru-ink dark:text-haru-paper"
            />
          ) : (
            <Pressable
              onPress={() => setIsAddingTag(true)}
              className="px-2 py-1 rounded-full border border-dashed border-haru-muted"
            >
              <Text className="text-xs text-haru-muted">+ 추가</Text>
            </Pressable>
          )}
        </View>

        {/* 메모 */}
        <View className="mt-6">
          <Text className="text-sm text-haru-muted mb-2">메모</Text>
          <TextInput
            value={task.note ?? ""}
            onChangeText={(v) => updateTask(task.id, { note: v })}
            placeholder="메모 추가..."
            placeholderTextColor="#8E8E93"
            multiline
            style={{ minHeight: 80, textAlignVertical: "top" }}
            className="text-base text-haru-ink dark:text-haru-paper"
          />
        </View>

        {/* 생성일 */}
        {task.createdAt && (
          <Text className="text-xs text-haru-muted mt-8">
            {new Date(task.createdAt).toLocaleDateString("ko-KR")}에 추가됨
          </Text>
        )}

        {/* 삭제 버튼 */}
        <Pressable
          onPress={() => {
            Alert.alert(
              "할 일 삭제",
              `"${task.title}"을(를) 삭제하시겠어요?`,
              [
                { text: "취소", style: "cancel" },
                {
                  text: "삭제",
                  style: "destructive",
                  onPress: () => {
                    deleteTask(task.id);
                    router.back();
                  },
                },
              ]
            );
          }}
          className="mt-10 py-3 rounded-xl bg-[#E04E2A]/10 items-center"
        >
          <Text className="text-[#E04E2A] font-medium">🗑️ 할 일 삭제</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
