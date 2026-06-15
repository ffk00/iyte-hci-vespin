import { AppText } from "@/components/ui/AppText";
import { useTranslation } from "@/providers/I18nProvider";

/** "By continuing, you agree to Term of Use and Privacy Policy." footnote. */
export function TermsNote() {
  const { t } = useTranslation();
  return (
    <AppText variant="caption" tone="brandMuted" className="text-center">
      {t("auth.terms.prefix")}
      <AppText variant="caption" tone="brand" className="font-semibold">
        {t("auth.terms.use")}
      </AppText>
      {t("auth.terms.and")}
      <AppText variant="caption" tone="brand" className="font-semibold">
        {t("auth.terms.privacy")}
      </AppText>
    </AppText>
  );
}
