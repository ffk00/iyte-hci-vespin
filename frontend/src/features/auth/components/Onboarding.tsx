import { useState } from "react";
import { Image, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Mark } from "@/components/brand/Mark";
import { WaveDivider } from "@/components/layout/WaveDivider";
import { useTranslation } from "@/providers/I18nProvider";

const SLIDE_IMAGES = [
  require("../../../../assets/onboarding/onborading_first.png"),
  require("../../../../assets/onboarding/onboarding_second.png"),
  require("../../../../assets/onboarding/onboarding_third.png"),
] as const;

/** Floating control chips shown over the speaker on the final slide. */
const SLIDE3_CHIPS: { icon: IconName; key: "sound" | "ambiance" | "volume" }[] = [
  { icon: "musical-note", key: "sound" },
  { icon: "pulse", key: "ambiance" },
  { icon: "volume-high", key: "volume" },
];

export function Onboarding() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const last = SLIDE_IMAGES.length - 1;

  const titles = [t("auth.onboarding.slide1Title"), t("auth.onboarding.slide2Title"), t("auth.onboarding.slide3Title")];
  const bodies = [t("auth.onboarding.slide1Body"), t("auth.onboarding.slide2Body"), t("auth.onboarding.slide3Body")];

  const finish = () => router.replace("/(auth)/welcome");

  const next = () => (index >= last ? finish() : setIndex((i) => i + 1));
  const back = () => (index <= 0 ? finish() : setIndex((i) => i - 1));

  return (
    <Screen tone="default" padded={false} edges={["top", "bottom"]}>
      <WaveDivider className="absolute inset-x-0 top-0 h-[42%]" />

      <View className="flex-1 px-6">
        <View className="pt-2">
          <Mark size="sm" />
        </View>

        {/* Speaker art with the slide-3 control chips overlaid. */}
        <View className="flex-1 justify-center">
          <View className="relative">
            <Image
              source={SLIDE_IMAGES[index]}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel={titles[index]}
              className="h-72 w-full"
            />
            {index === last ? (
              <View className="absolute inset-y-0 left-0 justify-center gap-4">
                {SLIDE3_CHIPS.map((chip) => (
                  <View
                    key={chip.key}
                    className="flex-row items-center gap-2 rounded-2xl bg-primaryMuted/15 px-3 py-2"
                  >
                    <Icon name={chip.icon} size="sm" tone="brandMuted" />
                    <View className="gap-1">
                      <AppText variant="caption" tone="brandMuted" className="font-semibold">
                        {t(`auth.onboarding.${chip.key}`)}
                      </AppText>
                      <View className="h-1 w-16 overflow-hidden rounded-pill bg-primaryMuted/25">
                        <View className="h-full w-2/3 rounded-pill bg-primaryMuted" />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        {/* Copy */}
        <View className="gap-3 pb-2">
          <AppText variant="headline" tone="brand">
            {titles[index]}
          </AppText>
          <View className="h-0.5 w-16 rounded-pill bg-primary" />
          <AppText variant="body" tone="brandMuted">
            {bodies[index]}
          </AppText>
        </View>

        {/* Progress dots */}
        <View className="flex-row justify-center gap-2 py-4">
          {SLIDE_IMAGES.map((_, i) => (
            <View
              key={i}
              className={`h-2.5 rounded-pill ${i === index ? "w-2.5 bg-primary" : "w-2.5 bg-primaryMuted/40"}`}
            />
          ))}
        </View>

        {/* Actions */}
        <View className="gap-1 pb-2">
          <Button
            label={index >= last ? t("auth.onboarding.getStarted") : t("auth.onboarding.next")}
            variant="primary"
            size="lg"
            fullWidth
            onPress={next}
          />
          <Button
            label={t("auth.onboarding.back")}
            variant="ghost"
            size="lg"
            fullWidth
            labelTone="brand"
            onPress={back}
          />
        </View>
      </View>
    </Screen>
  );
}
