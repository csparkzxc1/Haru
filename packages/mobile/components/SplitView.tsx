import { Pressable, Text, View } from "react-native";
import { Link, usePathname } from "expo-router";
import { useIsTablet } from "../lib/responsive";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV: NavItem[] = [
  { href: "/", label: "오늘", icon: "☀︎" },
  { href: "/this-week", label: "이번주", icon: "▦" },
  { href: "/upcoming", label: "예정", icon: "▷" },
  { href: "/anytime", label: "언제든지", icon: "∞" },
  { href: "/someday", label: "언젠가", icon: "✧" },
  { href: "/settings", label: "설정", icon: "⚙" },
];

/**
 * iPad / 갤럭시 탭 가로 모드용 사이드바.
 * 폰 / 세로 모드에선 null 반환 → 기존 하단 탭 사용.
 */
export function TabletSidebar() {
  const isTablet = useIsTablet();
  const pathname = usePathname();
  if (!isTablet) return null;

  return (
    <View className="w-60 bg-haru-paper dark:bg-haru-ink border-r border-black/5 dark:border-white/10 px-4 py-6">
      <Text className="text-xl font-semibold tracking-tight text-haru-ink dark:text-haru-paper mb-6">
        하루
      </Text>
      <View className="gap-0.5">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href === "/" && pathname === "/index");
          return (
            <Link key={item.href} href={item.href as never} asChild>
              <Pressable
                className={`flex-row items-center gap-3 px-3 py-2.5 rounded-md ${
                  active ? "bg-black/5 dark:bg-white/5" : ""
                }`}
              >
                <Text
                  className={`text-haru-muted w-4 text-center ${
                    active ? "text-haru-accent" : ""
                  }`}
                >
                  {item.icon}
                </Text>
                <Text
                  className={`text-[15px] ${
                    active
                      ? "text-haru-accent font-medium"
                      : "text-haru-ink dark:text-haru-paper"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

/**
 * 콘텐츠 영역 래퍼. 태블릿이면 사이드바 옆 column 으로, 폰이면 그대로 통과.
 */
export function ResponsiveShell({ children }: { children: React.ReactNode }) {
  const isTablet = useIsTablet();
  if (!isTablet) return <>{children}</>;
  return (
    <View className="flex-1 flex-row">
      <TabletSidebar />
      <View className="flex-1">{children}</View>
    </View>
  );
}
