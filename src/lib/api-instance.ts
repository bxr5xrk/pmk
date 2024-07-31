import axios, { AxiosError } from "axios";

interface RequestProps {
  url: string; method: 'GET' | 'POST', data: object, headers?: object;
  name: string;
  host: string;
}

export async function apiInstance<T>(props: RequestProps): Promise<T | null> {
  const { url, method, data, headers, name, host } = props;

  try {
    const res = await axios.request<T>({
      url: `${host}${url}`,
      method,
      data,
      headers
    });

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`${name} ERROR:`, `${error.response?.statusText} ${error.response?.data}`);
      return null;
    }

    console.error(`${name} ERROR:`, error);
    return null;
  }
}
