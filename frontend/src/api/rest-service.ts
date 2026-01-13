import type { DiffResponse } from '../types/api/api-types';
import api from './requester'
import { API_ROUTES } from './routes'
import type { AxiosResponse } from 'axios'

export const getCompareResult = async (projectId: string, params: URLSearchParams): Promise<DiffResponse> => {
  const url = API_ROUTES.COMPARE.replace(":projectId", projectId);
  console.log("API Request URL:", url);
  const response: AxiosResponse<DiffResponse> = await api.get(url, {
    params
  });
  console.log("API Response Data:", response.data);
  return response.data;
};

