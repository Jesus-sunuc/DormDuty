import Toast from "react-native-toast-message";

export const toastSuccess = (message: string) => {
  Toast.show({
    type: "success",
    text1: message,
    position: "bottom",
  });
};

export const toastError = (message: string) => {
  Toast.show({
    type: "error",
    text1: message,
    position: "bottom",
  });
};

export const toastInfo = (message: string) => {
  Toast.show({
    type: "info",
    text1: message,
    position: "bottom",
  });
};