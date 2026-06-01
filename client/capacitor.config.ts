import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.easyempresa.app',
  appName: 'EasyEmpresa',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1E3A5F',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1E3A5F'
    },
    LocalNotifications: {
      smallIcon: 'ic_launcher',
      iconColor: '#1E3A5F'
    }
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#1E3A5F'
  }
};

export default config;
