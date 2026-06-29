import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';

import { HomeBannerAd } from '../components/common/HomeBannerAd';
import { initDatabase } from '../db/client';
import { ThemeProvider } from '../theme/ThemeContext';

export default function RootLayout() {
  useEffect(() => {
    initDatabase().catch((error) => {
      console.error('Failed to initialize database', error);
    });
    mobileAds().initialize().catch(() => {
      // Ad SDK init failure is non-fatal — ads simply won't load
    });
  }, []);

  return (
    <ThemeProvider>
      <View style={styles.root}>
        <View style={styles.stack}>
          <Stack />
        </View>
        <HomeBannerAd />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stack: {
    flex: 1,
  },
});
