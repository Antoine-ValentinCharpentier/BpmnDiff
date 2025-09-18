import type { DiffResponse } from '../types/api/api-types';
import api from './requester'
import { API_ROUTES } from './routes'
import type { AxiosResponse } from 'axios'

const buildParams = (from: string, to: string, branch: string) => {
  if (from && to) return { from, to };
  if (branch) return { branch };
  return {}; 
};

export const getCompareResult = async (projectId: string, from: string, to: string, branch: string): Promise<DiffResponse> => {
  const url = API_ROUTES.COMPARE.replace(":projectId", projectId);

  const response: AxiosResponse<DiffResponse> = await api.get(url, {
    params: buildParams(from, to, branch),
  });

  return response.data;
};

