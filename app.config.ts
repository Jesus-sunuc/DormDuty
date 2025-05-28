import { ExpoConfig, ConfigContext } from '@expo/config';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.com.jesus9160.DormDuty.dev';
  }

  if (IS_PREVIEW) {
    return 'com.com.jesus9160.DormDuty.preview';
  }

  return 'com.com.jesus9160.DormDuty';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'Dorm Duty (Dev)';
  }

  if (IS_PREVIEW) {
    return 'Dorm Duty (Preview)';
  }

  return 'Dorm Duty';
};


export default ({config}: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "DormDuty",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icons/icon.png",
  scheme: "dormduty",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icons/icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.jesus9160.DormDuty",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/icons/splash.png",
        imageWidth: 175,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          image: "./assets/icons/splash.png",
          imageWidth: 175,
          resizeMode: "contain",
          backgroundColor: "#000000",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "411e34e6-3329-4b94-8261-3bed4b8587f0",
    },
  },
  owner: "jesus9160",
});
