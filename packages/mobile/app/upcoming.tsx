import { Screen } from "@/components/Screen";
import { QuickEntry } from "@/components/QuickEntry";

export default function UpcomingScreen() {
  return (
    <Screen title="예정" subtitle="앞으로의 할 일">
      <QuickEntry />
    </Screen>
  );
}
