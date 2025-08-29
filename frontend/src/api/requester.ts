import axios, { AxiosError } from 'axios'
import keycloak from '../keycloak'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Injecte le token dans toutes les requêtes
api.interceptors.request.use(async (config) => {
  const token = keycloak.token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si token expiré → refresh → retry
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true
      try {
        const refreshed = await keycloak.updateToken(5)
        if (refreshed) {
          originalRequest.headers['Authorization'] = `Bearer ${keycloak.token}`
          return api(originalRequest)
        } else {
          keycloak.logout()
        }
      } catch (refreshErr) {
        keycloak.logout()
        return Promise.reject(refreshErr)
      }
    }
    return Promise.reject(error)
  }
)


function buildUrl<T extends string>(
  path: T,
  params: Record<ExtractRouteParams<T>, string | number>
): string {
  return path.replace(/:([a-zA-Z0-9_]+)/g, (_, key: string) => {
    if (params[key as ExtractRouteParams<T>] === undefined) {
      throw new Error(`Missing parameter: ${key}`);
    }
    return encodeURIComponent(String(params[key as ExtractRouteParams<T>]));
  });
}

type ExtractRouteParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;
      
export default api
