import Toast from "react-native-toast-message";
import { SuccessToast, ErrorToast, InfoToast } from "./CustomToast";

export const toastSuccess = (message: string) => {
  Toast.show({
    type: "success",
    text1: message,
    position: "bottom",
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 40,
  });
};

export const toastError = (message: string) => {
  Toast.show({
    type: "error",
    text1: message,
    position: "bottom",
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 40,
  });
};

export const toastInfo = (message: string) => {
  Toast.show({
    type: "info",
    text1: message,
    position: "bottom",
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 40,
  });
};

export const toastConfig = {
  success: (props: any) => <SuccessToast {...props} />,
  error: (props: any) => <ErrorToast {...props} />,
  info: (props: any) => <InfoToast {...props} />,
};
