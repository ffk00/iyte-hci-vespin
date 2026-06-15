# Feature: Device Pairing Demo Flow & Home

## Summary

Build the **Devices (Home) experience** — the single screen the whole speaker
journey lives on — and the **scripted pairing demo flow** that adds speakers to
it. This is the centerpiece of the HCI deliverable: an evaluator taps the `+`
button, watches a "Finding your device…" scan, picks a Vespin Retro speaker, and
sees a success or failure result sheet. Connected speakers stand together on one
turntable; the screen background is a soft gradient tinted to the focused
speaker's color.

The flow is **fully simulated and local**. Per the demo brief, there is **no
backend involvement** in this feature: paired speakers live in a client-side
Zustand store, and the success/fail outcome is driven by a **fixed local
script**, not a network response. The locked demo sequence is:

1. **Add red → success** (Living Room Speaker stands alone)
2. **Add (any) → fail** ("Connection Fail", nothing added)
3. **Add yellow → success** (red + yellow stand together)

…and every attempt after the third succeeds.

This honors the root `CLAUDE.md` hardware-simulation boundary (no BLE, no radio,
`is_connected`/`battery_level`/`firmware_version` are seeded values) and pushes
it one step further for the demo: even persistence is local, so the presentation
never depends on API availability.

Scope is the **Devices tab + pairing flow + the device-detail shell**. The
richer "Choose your style" / pictogram / music-player detail screen seen in the
reference (`Piktogram seç*.png`) is **out of scope** here and tracked as an open
question.

Constraints honored: Expo managed workflow, no native builds, NativeWind for all
styling, Zustand for client state (not Redux/Jotai), no new top-level deps beyond
`expo-linear-gradient` (already in `package.json`), no dark mode, light testing
posture (HCI scope).

## Requirements

1. **Single-screen Home.** The Devices tab (`(tabs)/devices.tsx`) renders one
   `DeviceHome` feature component. The turntable stand is a constant backdrop;
   pairing happens in-place (spinner + bottom sheets layered over Home with the
   tab bar still visible), matching the reference mockups.

2. **Empty state.** With no speakers: bare turntable, a large `+` glyph with a
   hint bubble ("Tap the plus button to add and connect your speaker"), the
   power-off button, "No Name", and "No products connected yet".

3. **Scan step.** Tapping `+` shows "Finding your device…" with the animated
   dotted `LoadingRing` over the (empty) stand for a fixed delay, then reveals
   the discovery sheet. There is no real radio — the delay is theatre.

4. **Discovery sheet.** A bottom sheet (maroon, `tone="primary"`) lists the
   Vespin Retro catalog. The user selects exactly one speaker per attempt
   (single-select — the reference flow adds one speaker at a time), then taps
   **Connect**. A **Cancel** action dismisses back to idle.

5. **Naming sheet.** After Connect, a naming sheet pre-fills a suggested,
   de-duplicated name (e.g. "Living Room Speaker", "Bed Room Speaker") for the
   chosen speaker. The user can edit it, then confirm.

6. **Scripted outcome.** The success/fail result is determined by a local demo
   script (sequence `[success, fail, success]`, then success), **not** by the
   selected speaker, user input, or any network call. On a scripted **fail**,
   no device is added.

7. **Result sheet.** A result bottom sheet (`tone="notif"`, ground `#F2DADA`)
   with a scalloped badge straddling its top edge (green `ResultBadge` for
   success, red for fail), a headline, a body line, and a single full-width
   action button (`#73383C`):
   - Success → "Successful" / "Your new device is successfuly added." / **Done**
   - Fail → "Connection Fail" / "Your new device couldn't be found please try
     again." / **Done**

8. **Connected state.** After a success, the new speaker joins the others on the
   single turntable. The footer shows the focused speaker's power button,
   "Connected"/"Standby", its name, and (when >1 device) pagination dots to
   switch the focused speaker. The top slot shows a flash icon + battery `%` for
   the focused, powered speaker.

9. **Per-speaker gradient background.** The Home screen background is a vertical
   `LinearGradient` tinted to the **focused** speaker's color, fading to cream
   (`#F4E9E6`) at the bottom. Color stops at 45% / 100%. Per speaker:
   - red `#B46875`, yellow `#B4A368`, blue `#6884B4` → `#F4E9E6`.
   When no speaker is connected (empty/scan), the background is flat cream.

10. **Local-only persistence.** Paired speakers live in a Zustand store in the
    devices feature. No `/devices` API calls. The store seeds the simulated
    fields (`batteryLevel`, `firmwareVersion`, `isConnected`) at add time, with
    a stable client-generated `id`. **No** `useDevices`/`useCreateDevice`
    backend hooks are created.

11. **Per-device power toggle.** Power is frontend-only demo state (a Zustand
    map keyed by device id), defaulting to ON. Toggling never persists anywhere
    but the store and never touches an API.

12. **Device detail shell.** Tapping a connected, powered speaker opens
    `devices/[id]`, rendering a `DeviceDetail` that shows the speaker on the
    stand, its name, power toggle, and an info section (battery, firmware). The
    "Choose your style" pictogram/player UI is a placeholder ("coming soon")
    pending the out-of-scope detail spec.

13. **New theme tokens.** Add the result-sheet tokens and the `success` text/icon
    tone (see Business Logic). No raw hex in `className`.

14. **i18n.** All strings under the `devices.*` namespace in both `en.json` and
    `tr.json`. The `devices` key is currently `{}` in both.

15. **Typography / spacing / layout consistency.** All text via `AppText`
    variants; all color via semantic tokens; spacing via the Tailwind scale.
    Match the reference: centered display headings (ZenDots), generous vertical
    rhythm, full-width pill/rounded action buttons.

## Data Model Changes

**None at the database layer.** This feature does not touch Postgres, sqlc, or
migrations.

Client-side, a local `Device` shape mirrors the spec's device fields so the rest
of the app stays shape-compatible if a future change re-introduces the API:

```ts
type DemoDevice = {
  id: string;                 // client-generated (e.g. crypto.randomUUID())
  name: string;
  deviceType: "vespin_classic" | "vespin_mini" | "vespin_pro";
  batteryLevel: number;       // seeded 20–100
  firmwareVersion: string;    // seeded static string
  isConnected: boolean;       // seeded true for the demo
  createdAt: string;          // RFC 3339, set at add time
};
```

## API Endpoints

**None.** This feature deliberately makes zero HTTP calls. It does not add,
modify, or consume any endpoint in `backend/api/openapi.yaml`, and it does not
generate or use any Orval hook. (Recorded as an intentional deviation from the
usual "wrap the generated hook" pattern, justified by the local-demo decision.)

## Module Structure

### Files to create

```
frontend/
├── src/
│   ├── features/devices/
│   │   ├── catalog.ts                       Static Vespin Retro line-up + helpers
│   │   ├── store.ts                         Zustand: devices list, power, demo script
│   │   ├── simulatePairing.ts               Scan duration + scripted-outcome logic
│   │   ├── schemas/
│   │   │   └── pairDevice.ts                 Zod schema for the name field
│   │   ├── hooks/
│   │   │   └── useDevices.ts                 Selector hook over the local store
│   │   └── components/
│   │       ├── DeviceHome.tsx                Orchestrates the whole flow + steps
│   │       ├── SpeakerStage.tsx             Turntable + speakers resting on it
│   │       ├── DiscoveryList.tsx            "Found" catalog, single-select
│   │       ├── ReviewPanel.tsx              Name the chosen speaker
│   │       ├── ResultSheet.tsx              Success/fail outcome sheet
│   │       └── DeviceDetail.tsx             Detail shell (info + style placeholder)
│   └── components/
│       ├── feedback/
│       │   ├── LoadingRing.tsx              Spinning dotted ring (inlined SVG)
│       │   └── ResultBadge.tsx             Scalloped success/fail badge (inlined SVG)
│       └── layout/
│           └── BottomSheet.tsx             In-screen bottom sheet (tab bar stays visible)
```

> The four SVG assets needed by `LoadingRing` / `ResultBadge` already exist:
> `assets/loading-state.svg`, `assets/successful_notif.svg`,
> `assets/failed_notif.svg`, `assets/battery-outline.svg`. Per
> `frontend/CLAUDE.md`, Metro has no svg-transformer — the SVGs are **inlined as
> `react-native-svg` primitives** inside the components (same approach as
> `Mark`/`GoogleIcon`), using each file as the vector source of truth.

### Files to modify

```
frontend/
├── app/(app)/(tabs)/devices.tsx             Replace stub with <DeviceHome />
├── app/(app)/devices/[id].tsx               Replace stub with <DeviceDetail deviceId={id} />
├── src/theme/colors.ts                      Add notifSurface, notifAction, speaker gradient map
├── src/components/ui/AppText.tsx            Add "success" to TextTone + TONE map
├── src/components/ui/Icon.tsx               Add "success" to IconTone + TONE map
├── src/components/layout/BottomSheet.tsx    (created above; "notif" tone resolves new tokens)
├── src/i18n/translations/en.json            Fill devices.* namespace
└── src/i18n/translations/tr.json            Fill devices.* namespace
```

`app/(app)/devices/new.tsx` is **not used** by this flow (pairing is in-place on
Home, not a separate route). Leave it as-is; do not wire it.

### Files to delete

None. (The earlier WIP scaffolding has already been removed; this spec rebuilds
from the clean slate of `.gitkeep`-only feature folders.)

### Documentation updates

- Add a short note to `frontend/CLAUDE.md` under the devices feature (or a new
  "Demo flow" subsection) recording that **the pairing flow is local-only and
  intentionally bypasses the API** — so a future contributor doesn't "fix" it by
  wiring `POST /devices`. State that the success/fail outcome is scripted.

## Business Logic

### Step machine (in `DeviceHome`)

Local component state drives a small machine:

```
idle ──(+)──▶ scanning ──(timeout)──▶ discovery ──(Connect)──▶ naming
                                          │                       │
                                       (Cancel)               (Confirm)
                                          ▼                       ▼
                                        idle                    result
                                                                  │
                                                               (Done)
                                                                  ▼
                                            success → idle (device added, focus it)
                                            fail    → idle (nothing added)
```

- `scanning` runs for `SCAN_DURATION_MS` (≈2500 ms) then auto-advances.
- The `+` button is disabled while a flow is in progress (`step !== "idle"`).
- The discovery/naming sheets render via `BottomSheet`; the result renders via a
  separate `BottomSheet tone="notif"` on top.

### Scripted outcome (`simulatePairing.ts` + store)

The demo outcome is a deterministic sequence, not random and not from the
network:

```ts
// The fixed presentation script. Index advances on each *completed* attempt
// (i.e. each time the user confirms a name and reaches a result).
const OUTCOME_SCRIPT: readonly PairResult[] = ["success", "fail", "success"];
// Past the end of the script, everything succeeds.
function outcomeForAttempt(n: number): PairResult {
  return OUTCOME_SCRIPT[n] ?? "success";
}
```

- The attempt counter lives in the devices store so it survives sheet unmounts.
- On **confirm**, compute the outcome for the current attempt, then increment
  the counter regardless of outcome.
- On **success**: add a `DemoDevice` to the store (seeded fields), set it as the
  focused speaker, show the success sheet.
- On **fail**: add nothing, show the fail sheet. The chosen selection is
  discarded on Done.

> Rationale for counting attempts rather than keying off the speaker color: it
> keeps the script honest even if the presenter taps a different speaker than
> planned. The brief's "red, fail, yellow" is the *intended* tap order; the
> script guarantees the *outcome* order regardless.

### Local devices store (`store.ts`)

A single Zustand store holds three concerns:

```ts
type DevicesState = {
  devices: DemoDevice[];
  powered: Record<string, boolean>;   // device id → on/off (default ON)
  attempt: number;                    // demo script cursor

  addDevice: (input: { name: string; deviceType: DemoDevice["deviceType"] }) => DemoDevice;
  removeDevice: (id: string) => void;
  togglePower: (id: string) => void;
  recordAttempt: () => PairResult;    // returns outcome, advances cursor
};
```

- `addDevice` seeds `batteryLevel` (pseudo-random 20–100), a static
  `firmwareVersion` (e.g. `"1.4.2"`), `isConnected: true`, `createdAt: now`, and
  a fresh `id`.
- Newest-first ordering is applied in the `useDevices` selector hook, not in the
  store, so the store stays a plain source of truth.
- `useDevices()` is a thin selector hook (returns `devices` sorted newest-first)
  to keep components decoupled from the store shape — mirroring the
  domain-hook convention even though there's no API.

### Catalog (`catalog.ts`)

Static line-up (no Bluetooth — the "discoverable" set is hard-coded):

| deviceType | model (i18n) | default name (i18n) | art |
|---|---|---|---|
| `vespin_classic` | Vespin Classic | Living Room Speaker | `red-speaker.png` |
| `vespin_mini` | Vespin Mini | Bed Room Speaker | `yellow-speaker.png` |
| `vespin_pro` | Vespin Pro | Studio Speaker | `blue-speaker.png` |

Helpers: `speakerForType(deviceType)`, `uniqueDeviceName(base, existing)` (append
" 2", " 3" on collision), `STAND_IMAGE`.

### Gradient tokens (`theme/colors.ts`)

Add a speaker-gradient map alongside the semantic tokens. These are **brand art
colors**, expressed once here and consumed by `DeviceHome` via
`expo-linear-gradient` (not via NativeWind className, since RN gradients aren't a
Tailwind utility):

```ts
// Top tint per speaker → cream. Stops at 45% / 100% (top 45% is the solid tint,
// fading to cream by the bottom). Cream bottom is shared.
export const speakerGradient = {
  vespin_classic: ["#B46875", "#F4E9E6"], // red   (given)
  vespin_mini:    ["#B4A368", "#F4E9E6"], // yellow (derived to match the art)
  vespin_pro:     ["#6884B4", "#F4E9E6"], // blue   (derived to match the art)
} as const;
export const gradientLocations = [0.45, 1] as const;
```

`DeviceHome` picks `speakerGradient[focused.deviceType]` (or a flat
`background`/cream when there's no focused speaker) and renders the screen body
inside a `<LinearGradient colors={...} locations={gradientLocations}>`.

### Result-sheet + success tokens (`theme/colors.ts`, `AppText`, `Icon`)

The reference result card uses a pink ground and a deep-maroon action button
distinct from the app's `primary`:

```ts
// in semantic:
notifSurface: "#F2DADA",   // result sheet ground (Image #1)
notifAction:  "#73383C",   // result sheet button
```

`BottomSheet` gains a `"notif"` tone mapping to `bg-notifSurface` with default
(dark-on-light) text. `ResultSheet`'s action button uses `bg-notifAction` with
`onPrimary` (cream) label.

The top-slot battery readout needs a green accent that the current tone enums
don't expose. `semantic.success` (`#2E7D32`) already exists; add the tone entry:

- `AppText`: extend `TextTone` with `"success"` → `"text-success"`.
- `Icon`: extend `IconTone` with `"success"` → `semantic.success`.

### `SpeakerStage`

The black turntable drawn first, speakers painted on top. Single speaker is
large and centered; multiple speakers fan across the disc, overlapping with
front-to-back z-order (front speaker = focused). A `dimmed` prop fades speakers
during a scan. Stand asset: `speaker-stand.png`.

### `BottomSheet`

An in-screen bottom-anchored sheet (an absolutely-positioned `View`, **not** a
native `Modal`) so the tab bar stays visible beneath it, matching the mockups.
Slides up on mount (`Animated`, native driver). Props: `tone: "primary" |
"notif"`, `children`. Publishes the matching `SurfaceTone` to children via
`SurfaceProvider`.

### i18n keys (both `en` and `tr`)

```
devices.home.title            "MY DEVICE"
devices.home.infoLabel        (a11y) "About"
devices.home.addLabel         (a11y) "Add device"
devices.home.openLabel        (a11y) "Open device"
devices.home.powerLabel       (a11y) "Toggle power"
devices.home.noName           "No Name"
devices.home.noProducts       "No products connected yet"
devices.home.hint             "Tap the plus button to add and connect your speaker"
devices.home.connected        "Connected"
devices.home.standby          "Standby"

devices.discover.finding      "Finding your device..."
devices.discover.pickTitle    "Choose your speaker"
devices.discover.pickSubtitle "Select the device you want to connect"
devices.discover.connect      "Connect"
devices.discover.cancel       "Cancel"

devices.pair.reviewTitle      "Name your speaker"
devices.pair.nameField        (a11y) "Speaker name"
devices.pair.connect          "Connect"
devices.pair.connecting       "Connecting..."
devices.pair.back             "Back"
devices.pair.successTitle     "Successful"
devices.pair.successBody      "Your new device is successfuly added."
devices.pair.failTitle        "Connection Fail"
devices.pair.failBody         "Your new device couldn't be found please try again."
devices.pair.done             "Done"

devices.detail.battery        "Battery"
devices.detail.firmware       "Firmware"
devices.detail.style          "Choose your style"
devices.detail.styleSoon      "Style controls coming soon"
devices.detail.offTitle       "Speaker is off"
devices.detail.offBody        "Turn it on to see details"

devices.models.vespin_classic        "Vespin Classic"
devices.models.vespin_mini           "Vespin Mini"
devices.models.vespin_pro            "Vespin Pro"
devices.defaultNames.vespin_classic  "Living Room Speaker"
devices.defaultNames.vespin_mini     "Bed Room Speaker"
devices.defaultNames.vespin_pro      "Studio Speaker"

devices.errors.nameRequired   "Please enter a name"
devices.errors.nameTooLong    "Name is too long"
```

(Turkish translations supplied in `tr.json`; the brief's playful "successfuly"
typo is preserved in the English string to match the mockup, or corrected — see
Open Questions.)

## Edge Cases & Error Handling

| Case | Behavior |
|---|---|
| `+` tapped while a flow is already in progress | Button disabled (`step !== "idle"`); no double-start. |
| User taps **Connect** with nothing selected | Connect is disabled until a speaker is selected; no empty-attempt path. (Differs from the earlier WIP, where empty selection was the fail trigger — fail is now purely scripted.) |
| Scripted **fail** | No device added; fail sheet shown; on **Done**, selection discarded, return to idle. The attempt cursor still advanced. |
| App reloaded mid-demo | Zustand store is in-memory; reload resets devices **and** the attempt cursor to 0, replaying the script from the top. Acceptable for a demo (presenter restarts cleanly). See Open Questions if persistence-across-reload is wanted. |
| Duplicate suggested name | `uniqueDeviceName` appends " 2", " 3", … so the list stays visually distinct. |
| Empty / whitespace-only name on confirm | Zod `min(1)` (after `trim`) blocks confirm and shows `devices.errors.nameRequired`. |
| Name longer than 100 chars | Zod `max(100)` shows `devices.errors.nameTooLong`. |
| Focused speaker powered OFF | Top-slot battery/flash hidden; footer reads "Standby"; tapping the stage does **not** open detail. |
| Tapping the stage with no/focused-off speaker | No navigation; press is a no-op (guarded). |
| More devices than the script length | Attempts past index 2 always succeed (`?? "success"`). |
| Speaker art / stand asset missing | `Image` renders empty; layout holds because sizes are fixed. Documented as build-time expectation. |
| Gradient on a screen with no focused speaker | Flat cream background (no `LinearGradient` tint), matching the empty/scan mockups. |
| Very large OS font scaling | `AppText` uses fixed line-heights; result/discovery sheets use flexible heights and a scroll container for the naming list so text can't clip. |

## Security Considerations

Minimal. This feature performs **no network I/O**, reads **no** auth token, and
persists nothing outside in-memory client state. There is no user-supplied data
that leaves the device; the only input is the speaker name, which is validated
by Zod (length-bounded) and rendered as text (no HTML/markup surface in RN).

The local `id` uses `crypto.randomUUID()` (or an Expo-safe UUID) purely for React
keys and store lookups — it is not a security identifier and never reaches a
server.

## Testing Plan

Per project posture (HCI scope, frontend tests not required), no automated tests
are mandated. If the team adds a few, the only logic worth pinning is pure and
trivial to test:

1. **Scripted outcome ordering**
   - *Given* a fresh store (`attempt = 0`)
   - *When* `recordAttempt()` is called three times
   - *Then* it returns `success`, `fail`, `success` in order, and `success`
     thereafter.

2. **`addDevice` seeds simulated fields**
   - *Given* `addDevice({ name, deviceType })`
   - *Then* the returned device has `batteryLevel` in `[20,100]`, a non-empty
     `firmwareVersion`, `isConnected === true`, and a unique `id`.

3. **`uniqueDeviceName` collision handling**
   - *Given* existing `["Living Room Speaker"]`
   - *When* `uniqueDeviceName("Living Room Speaker", existing)`
   - *Then* returns `"Living Room Speaker 2"`.

Manual verification checklist (the real acceptance gate for the demo):

- [ ] Empty Home matches `Devices 5.png` (hint bubble, bare stand, "No Name").
- [ ] `+` → "Finding your device…" + spinning ring (`Devices 16/31.png`).
- [ ] Discovery sheet lists the three speakers; Connect disabled until selection.
- [ ] **1st add (red) → Success**, red speaker on stand, "Living Room Speaker",
      flash + battery %, green power button (`First device.png`).
- [ ] **2nd add → Connection Fail** sheet (`First device(2).png`), nothing added.
- [ ] **3rd add (yellow) → Success**, red + yellow on the one stand
      (`First device(4).png`).
- [ ] Pagination dots switch focus; background gradient retints per focused
      speaker; battery % follows focus.
- [ ] Result sheet ground is `#F2DADA`, button is `#73383C`.
- [ ] Tapping a powered speaker opens the detail shell; power-off hides details.
- [ ] No raw hex in any `className` (grep `className=".*#[0-9A-Fa-f]"`).
- [ ] No bare `<Text>` in `app/` or `src/features/` (all via `AppText`).
- [ ] No `fetch`/Orval/`/devices` calls anywhere in the feature.

## Open Questions

1. **"successfuly" typo** — the mockup body text reads "successfuly added." Keep
   verbatim to match the design, or correct to "successfully"? Defaulting to
   **correct it** in the string unless the design owner wants the mockup
   reproduced exactly.

2. **Persistence across reload** — the store is in-memory, so a reload replays
   the script from the top. For a live demo this is usually desirable (clean
   reset). If the team wants devices to survive reload (e.g. for screenshots),
   we'd add a lightweight persistence layer — flagged, not built.

3. **"Choose your style" detail screen** — the `Piktogram seç*.png` references
   show a full detail page (pictogram chooser + a Spotify-style player +
   EQ-preset chips: None/Jazz/Rock/Demo/Bass). This is a **separate spec**;
   `DeviceDetail` here ships only the info shell + a "coming soon" placeholder.
   Confirm that's acceptable for this PR.

4. **Blue speaker in the demo** — the scripted flow only adds red then yellow.
   Blue (`vespin_pro`) is present in the discovery list and has a gradient, but
   isn't part of the locked sequence. Keep it selectable (it just succeeds after
   attempt 3), or hide it for the demo? Defaulting to **keep it selectable**.

5. **Single vs. multi-select discovery** — this spec locks **single-select** to
   match the one-speaker-at-a-time reference flow. If the demo later wants to add
   several at once, the discovery sheet and naming panel would need to handle a
   set. Out of scope for now.

6. **Tab route filename** — the Home tab file is `devices.tsx` while the UI/tab
   reads "Home". Consistent with the design-system spec's deferral; not renamed
   here.
