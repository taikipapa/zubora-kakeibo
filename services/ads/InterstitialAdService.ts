import { Platform } from 'react-native';
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

const UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      android: 'ca-app-pub-2833241675946579/5834489608',
      ios: TestIds.INTERSTITIAL, // TODO: replace with iOS production interstitial unit ID
    }) ?? TestIds.INTERSTITIAL;

const RECORD_INTERVAL = 3;                     // show every N records
const TIME_INTERVAL_MS = 3 * 60 * 1000;        // at least 3 minutes between shows

const interstitial = InterstitialAd.createForAdRequest(UNIT_ID);

let loaded = false;
let recordCount = 0;
let lastShownAt = 0;

// Persistent listeners — reuse the same instance throughout the app session
interstitial.addAdEventListener(AdEventType.LOADED, () => {
  loaded = true;
});

interstitial.addAdEventListener(AdEventType.CLOSED, () => {
  loaded = false;
  lastShownAt = Date.now();
  interstitial.load(); // preload next ad
});

interstitial.addAdEventListener(AdEventType.ERROR, () => {
  loaded = false;
  // Do not retry immediately to avoid hammering the ad server
});

// Preload on module init (app startup)
interstitial.load();

/**
 * Call after a successful transaction save.
 * Increments the record counter and shows the interstitial when:
 *   - the counter hits a multiple of RECORD_INTERVAL
 *   - at least TIME_INTERVAL_MS has elapsed since the last show
 *   - the ad is already loaded
 * Failures are silently ignored so they never block the user.
 */
export function maybeShowInterstitial(): void {
  recordCount += 1;

  const now = Date.now();
  const enoughRecords = recordCount % RECORD_INTERVAL === 0;
  const enoughTime =
    lastShownAt === 0 || now - lastShownAt >= TIME_INTERVAL_MS;

  if (!enoughRecords || !enoughTime || !loaded) return;

  interstitial.show().catch(() => {
    // Show failed — continue silently
  });
}
