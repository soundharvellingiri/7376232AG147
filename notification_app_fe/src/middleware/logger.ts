import axios, { AxiosError } from 'axios'
import { getRequiredEnvValue } from '../utils/envConfig'
import { getToken } from '../utils/tokenStorage'

const REQUEST_TIMEOUT_MS = 10000

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'fatal'
export type LogPackage =
  | 'api'
  | 'component'
  | 'hook'
  | 'page'
  | 'state'
  | 'style'
  | 'auth'
  | 'config'
  | 'middleware'
  | 'utils'

export interface LogParams {
  stack: string
  level: LogLevel
  package: LogPackage
  message: string
}

interface LogResponse {
  success?: boolean
  message?: string
}

export async function Log({
  stack,
  level,
  package: packageName,
  message,
}: LogParams): Promise<boolean> {
  const baseUrl = getRequiredEnvValue('VITE_BASE_URL')
  const logApiUrl = `${baseUrl}/logs`
  const token = getToken()

  if (!token) {
    console.warn('Logger failure: auth token not available.')
    return false
  }

  try {
    await axios.post<LogResponse>(
      logApiUrl,
      {
        stack,
        level,
        package: packageName,
        message,
      },
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('Logger success: log sent.')
    return true
  } catch (error) {
    const axiosError = error as AxiosError<LogResponse>
    const statusCode = axiosError.response?.status

    if (statusCode === 401) {
      console.error('Logger failure: unauthorized (401).')
      return false
    }

    if (statusCode === 403) {
      console.error('Logger failure: forbidden (403).')
      return false
    }

    if (axiosError.code === 'ECONNABORTED') {
      console.error('Logger failure: request timed out.')
      return false
    }

    if (!axiosError.response) {
      console.error('Logger failure: network error.')
      return false
    }

    const errorMessage = axiosError.response?.data?.message ?? axiosError.message
    console.error('Logger failure:', errorMessage)
    return false
  }
}
