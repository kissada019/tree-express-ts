import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

const httpKeepAliveAgent = new HttpAgent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

const httpsKeepAliveAgent = new HttpsAgent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

const defaultConfig: AxiosRequestConfig = {
  timeout: 30000,
  httpAgent: httpKeepAliveAgent,
  httpsAgent: httpsKeepAliveAgent,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  maxRedirects: 5,
};

export const httpClient: AxiosInstance = axios.create(defaultConfig);

// Optional: Global response interceptor for logging
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    // Future: integrate with req.log
    return Promise.reject(error);
  }
);