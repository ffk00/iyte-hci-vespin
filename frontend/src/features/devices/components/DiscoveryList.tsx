import { Image, Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SurfaceProvider } from "@/providers/SurfaceProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { SPEAKER_CATALOG, type SpeakerModel } from "../catalog";

type Props = {
  selected: SpeakerModel | null;
  onSelect: (model: SpeakerModel) => void;
  onConnect: () => void;
  onCancel: () => void;
};

/**
 * Sheet body for the fake scan result: every Vespin Retro model is "found".
 * Single-select — the reference flow adds one speaker at a time — then connect.
 * The chosen speaker appears on the stand behind the sheet as it's picked.
 */
export function DiscoveryList({ selected, onSelect, onConnect, onCancel }: Props) {
  const { t } = useTranslation();

  return (
    <View className="gap-4">
      <View className="gap-1">
        <AppText variant="title">{t("devices.discover.pickTitle")}</AppText>
        <AppText variant="caption">{t("devices.discover.pickSubtitle")}</AppText>
      </View>

      <View className="gap-3">
        {SPEAKER_CATALOG.map((model) => {
          const active = selected?.deviceType === model.deviceType;
          return (
            <Pressable
              key={model.deviceType}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t(model.modelNameKey)}
              onPress={() => onSelect(model)}
              className={`flex-row items-center gap-4 rounded-xl bg-surface p-3 active:opacity-80 ${
                active ? "border-2 border-primary" : "border border-border"
              }`}
            >
              <SurfaceProvider tone="default">
                <Image source={model.image} resizeMode="contain" className="h-14 w-14" />
                <View className="flex-1">
                  <AppText variant="title">{t(model.modelNameKey)}</AppText>
                  <AppText variant="caption" tone="muted">
                    {t(model.defaultNameKey)}
                  </AppText>
                </View>
                <Icon
                  name={active ? "checkmark-circle" : "ellipse-outline"}
                  size="lg"
                  tone={active ? "default" : "muted"}
                />
              </SurfaceProvider>
            </Pressable>
          );
        })}
      </View>

      <View className="gap-2">
        <Button
          label={t("devices.discover.connect")}
          variant="secondary"
          size="lg"
          fullWidth
          labelTone="brand"
          disabled={!selected}
          onPress={onConnect}
        />
        <Button
          label={t("devices.discover.cancel")}
          variant="ghost"
          labelTone="onPrimary"
          onPress={onCancel}
        />
      </View>
    </View>
  );
}
