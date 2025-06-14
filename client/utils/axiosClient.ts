import axios from "axios";
import { camel_to_snake_serializing_date, snakeToCamel } from "./apiMapper";
import { handleDates } from "./handleDates";

const axiosClient = axios.create();
axiosClient.defaults.baseURL = process.env.EXPO_PUBLIC_API_URL;


axiosClient.interceptors.response.use((originalResponse) => {
  originalResponse.data = snakeToCamel(originalResponse.data);
  return originalResponse;
});

axiosClient.interceptors.response.use((originalResponse) => {
  handleDates(originalResponse.data);
  return originalResponse;
});

axiosClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) return config;
  config.data = camel_to_snake_serializing_date(config.data);
  return config;
});

const dateOnlyAxiosClient = axios.create();

dateOnlyAxiosClient.interceptors.response.use((originalResponse) => {
  handleDates(originalResponse.data);
  return originalResponse;
});

export { axiosClient, dateOnlyAxiosClient };
