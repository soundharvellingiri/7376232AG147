import axios, { AxiosError } from 'axios'
import type { AuthPayload, AuthResponse } from '../types/auth'
import { getRequiredEnvValue } from '../utils/envConfig'

const REQUEST_TIMEOUT_MS = 10000

function getReadableApiError(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string }>
  const statusCode = axiosError.response?.status

  if (statusCode === 401) {
    return 'Unauthorized request. Please verify credentials.'
  }

  if (statusCode === 403) {
    return 'Forbidden request. Please check access permissions.'
  }

  if (axiosError.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.'
  }

  if (!axiosError.response) {
    return 'Network error. Please check your internet connection.'
  }

  return axiosError.response?.data?.message ?? 'Something went wrong while calling the API.'
}

export async function getAuthToken(payload: AuthPayload): Promise<AuthResponse> {
  const baseUrl = getRequiredEnvValue('VITE_BASE_URL')

  try {
    const response = await axios.post<AuthResponse>(`${baseUrl}/auth`, payload, {
      timeout: REQUEST_TIMEOUT_MS,
    })

    return response.data
  } catch (error) {
    throw new Error(getReadableApiError(error))
  }
}
