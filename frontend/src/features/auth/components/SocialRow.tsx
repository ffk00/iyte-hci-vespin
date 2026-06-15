import { Image, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Icon } from "@/components/ui/Icon";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { SocialButton } from "@/components/ui/SocialButton";
import { useTranslation } from "@/providers/I18nProvider";

const SPOTIFY = require("../../../../assets/spotify-logo.png");

/**
 * The "or continue with" divider + Google/Apple/Spotify buttons. Decorative:
 * the backend implements email/password only (no OAuth), so these are inert,
 * present for the HCI deliverable per the root CLAUDE.md scope note.
 */
export function SocialRow() {
  const { t } = useTranslation();
  return (
    <View className="gap-5">
      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-primary/20" />
        <AppText variant="caption" tone="brandMuted">
          {t("auth.chooser.or")}
        </AppText>
        <View className="h-px flex-1 bg-primary/20" />
      </View>

      <View className="flex-row items-center justify-center gap-5">
        <SocialButton accessibilityLabel="Google">
          <GoogleIcon size={26} />
        </SocialButton>
        <SocialButton accessibilityLabel="Apple">
          <Icon name="logo-apple" size="lg" />
        </SocialButton>
        <SocialButton accessibilityLabel="Spotify">
          <Image source={SPOTIFY} resizeMode="contain" className="h-7 w-7" />
        </SocialButton>
      </View>
    </View>
  );
}
