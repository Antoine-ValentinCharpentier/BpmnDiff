import type { DiffResponse } from '../types/api/api-types';
import api from './requester'
import { API_ROUTES } from './routes'
import type { AxiosResponse } from 'axios'

export const getCompareResult = async (projectId: String, from: String, to: String): Promise<DiffResponse> => {
  let url = API_ROUTES.COMPARE
    .replace(":projectId", `${projectId}`)
    .replace(":from", `${from}`)
    .replace(":to", `${to}`);
  const response: AxiosResponse<DiffResponse> = await api.get(url)
  return response.data
}
