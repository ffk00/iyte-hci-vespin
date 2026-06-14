import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { BottomSheet } from "@/components/layout/BottomSheet";
import { ResultBadge } from "@/components/feedback/ResultBadge";
import { useTranslation } from "@/providers/I18nProvider";
import type { PairResult } from "../simulatePairing";

type Props = {
  result: PairResult;
  onDone: () => void;
};

/** Pairing outcome sheet — pink ground, badge straddling the top edge. */
export function ResultSheet({ result, onDone }: Props) {
  const { t } = useTranslation();
  const isSuccess = result === "success";

  return (
    <BottomSheet tone="notif">
      <View className="items-center gap-4">
        <View style={{ marginTop: -68 }}>
          <ResultBadge variant={isSuccess ? "success" : "fail"} size={112} />
        </View>

        <AppText variant="headline" className="text-center">
          {isSuccess ? t("devices.pair.successTitle") : t("devices.pair.failTitle")}
        </AppText>
        <AppText variant="body" className="text-center">
          {isSuccess ? t("devices.pair.successBody") : t("devices.pair.failBody")}
        </AppText>

        <Pressable
          accessibilityRole="button"
          onPress={onDone}
          className="mt-2 w-full items-center rounded-xl bg-notifAction py-4 active:opacity-90"
        >
          <AppText variant="button" tone="onPrimary">
            {t("devices.pair.done")}
          </AppText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
