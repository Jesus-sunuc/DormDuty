import { ExpoConfig, ConfigContext } from "@expo/config";

const EAS_PROJECT_ID = "c4a90e48-51ae-4279-85e6-b63750655d0c";
const PROJECT_SLUG = "DormDuty";
const OWNER = "jesus9160";

export default ({ config }: ConfigContext): ExpoConfig => {
  console.log("Building app for environment:", process.env.APP_ENV);
  const { name, bundleIdentifier, icon, adaptiveIcon, packageName, schema } =
    getDynamicConfig(
      (process.env.APP_ENV as "development" | "preview" | "production") ||
        "development"
    );

  return {
    ...config,
    name: name,
    slug: PROJECT_SLUG,
    version: "1.1.0",
    orientation: "portrait",
    icon: icon,
    scheme: schema,
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleIdentifier,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: adaptiveIcon,
        backgroundColor: "#ffffff",
      },
      package: packageName,
    },
    updates: {
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    extra: {
      eas: {
        projectId: EAS_PROJECT_ID,
      },
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

    owner: OWNER,
  };
};

// App production configuration
const APP_NAME = "Dorm Duty";
const BUNDLE_IDENTIFIER = "com.jesus9160.DormDuty";
const PACKAGE_NAME = "com.jesus9160.DormDuty";
const ICON = "./assets/icons/iOS.png";
const ADAPTATIVE_ICON = "./assets/icons/Android.png";
const SCHEMA = "dormduty";

export const getDynamicConfig = (
  environment: "development" | "preview" | "production"
) => {
  if (environment === "production") {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      packageName: PACKAGE_NAME,
      icon: ICON,
      adaptiveIcon: ADAPTATIVE_ICON,
      schema: SCHEMA,
    };
  }

  if (environment === "preview") {
    return {
      name: `${APP_NAME} (Prev)`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      packageName: `${PACKAGE_NAME}.preview`,
      icon: "./assets/icons/iOS-prev.png",
      adaptiveIcon: "./assets/icons/Android-prev.png",
      schema: `${SCHEMA}-prev`,
    };
  }
  return {
    name: `${APP_NAME} (Dev)`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.dev`,
    packageName: `${PACKAGE_NAME}.dev`,
    icon: "./assets/icons/iOS-dev.png",
    adaptiveIcon: "./assets/icons/Android-dev.png",
    schema: `${SCHEMA}-dev`,
  };
};
