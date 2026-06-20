import { Platform } from 'react-native';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : Platform.select({
      android: 'ca-app-pub-2833241675946579/7864500969',
      ios: TestIds.REWARDED, // TODO: replace with iOS production rewarded unit ID
    }) ?? TestIds.REWARDED;

/**
 * Load and show a rewarded ad.
 * Returns true if the user earned the reward (watched to completion).
 * Returns false if the ad failed to load, failed to show, or was dismissed early.
 */
export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    const rewarded = RewardedAd.createForAdRequest(AD_UNIT_ID);
    let rewardEarned = false;

    function cleanup() {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      unsubError();
    }

    const unsubLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewarded.show().catch(() => {
        cleanup();
        resolve(false);
      });
    });

    const unsubEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      rewardEarned = true;
    });

    const unsubClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      cleanup();
      resolve(rewardEarned);
    });

    const unsubError = rewarded.addAdEventListener(AdEventType.ERROR, () => {
      cleanup();
      resolve(false);
    });

    rewarded.load();
  });
}
