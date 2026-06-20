import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const BANNER_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: 'ca-app-pub-2833241675946579/8460652943',
      ios: TestIds.BANNER, // TODO: replace with iOS production banner unit ID
    }) ?? TestIds.BANNER;

export function HomeBannerAd() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 4,
  },
});
