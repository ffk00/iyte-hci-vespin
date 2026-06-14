import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/providers/I18nProvider";
import { uniqueDeviceName, type SpeakerModel } from "../catalog";
import { pairDeviceSchema, type PairDeviceInput } from "../schemas/pairDevice";

type Props = {
  selected: SpeakerModel;
  existingNames: string[];
  onConfirm: (name: string) => void;
  onBack: () => void;
};

/**
 * Sheet body for naming the chosen speaker before pairing. The name defaults to
 * the model's suggestion, de-duplicated against existing devices. The speaker
 * itself is shown on the stand behind the sheet.
 */
export function ReviewPanel({ selected, existingNames, onConfirm, onBack }: Props) {
  const { t } = useTranslation();

  const defaultName = useMemo(
    () => uniqueDeviceName(t(selected.defaultNameKey), existingNames),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, existingNames],
  );

  const form = useForm<PairDeviceInput>({
    resolver: zodResolver(pairDeviceSchema),
    defaultValues: { name: defaultName },
  });

  const submit = form.handleSubmit((values) => onConfirm(values.name.trim()));

  return (
    <View className="gap-4">
      <AppText variant="title" className="text-center">
        {t("devices.pair.reviewTitle")}
      </AppText>

      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <View className="gap-1.5">
            <AppText variant="caption">{t(selected.modelNameKey)}</AppText>
            <TextInput
              accessibilityLabel={t("devices.pair.nameField")}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              value={field.value}
              returnKeyType="done"
              onSubmitEditing={submit}
              className="rounded-xl border border-border bg-surface px-4 py-3 text-ink"
            />
            {fieldState.error?.message ? (
              <AppText variant="caption" tone="danger">
                {t(fieldState.error.message)}
              </AppText>
            ) : null}
          </View>
        )}
      />

      <View className="gap-2">
        <Button
          label={t("devices.pair.connect")}
          variant="secondary"
          size="lg"
          fullWidth
          labelTone="brand"
          onPress={submit}
        />
        <Button
          label={t("devices.pair.back")}
          variant="ghost"
          labelTone="onPrimary"
          onPress={onBack}
        />
      </View>
    </View>
  );
}
