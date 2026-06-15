import { useLocalSearchParams } from "expo-router";
import { EqEditor } from "@/features/eq-profiles/components/EqEditor";
import { EqScreen } from "@/features/eq-profiles/components/EqScreen";
import { EmptyState } from "@/components/layout/EmptyState";
import { useEqProfile } from "@/features/eq-profiles/store";

export default function EqProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useEqProfile(id);

  if (!profile) {
    return (
      <EqScreen>
        <EmptyState
          title="Preset not found"
          description="This preset may have been deleted."
        />
      </EqScreen>
    );
  }

  return <EqEditor profile={profile} />;
}
