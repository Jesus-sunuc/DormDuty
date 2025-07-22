import { firebaseConfig as developmentConfig } from "./firebase.development";
import { firebaseConfig as previewConfig } from "./firebase.preview";
import { firebaseConfig as productionConfig } from "./firebase.production";

const getEnvironment = () => {
  return process.env.APP_ENV || "development";
};

const getFirebaseConfig = () => {
  const environment = getEnvironment();

  switch (environment) {
    case "preview":
      return previewConfig;
    case "production":
      return productionConfig;
    case "development":
    default:
      return developmentConfig;
  }
};

export { getFirebaseConfig, getEnvironment };
