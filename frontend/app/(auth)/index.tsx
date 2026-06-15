import { Redirect } from "expo-router";

/** Entry point for the logged-out flow: always start at the onboarding
 *  carousel (demo behaviour — the intro shows on every launch). */
export default function AuthIndex() {
  return <Redirect href="/(auth)/onboarding" />;
}
