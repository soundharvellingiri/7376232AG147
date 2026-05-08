import axios, { AxiosError } from 'axios'
import type { RegisterResponse, RegistrationPayload } from '../types/auth'
import { getRequiredEnvValue, validateEnvValues } from './envConfig'

const REQUEST_TIMEOUT_MS = 10000

function getRegistrationPayload(): RegistrationPayload {
  validateEnvValues([
    'VITE_EMAIL',
    'VITE_NAME',
    'VITE_MOBILE',
    'VITE_GITHUB_USERNAME',
    'VITE_ROLLNO',
    'VITE_ACCESS_CODE',
  ])

  return {
    email: getRequiredEnvValue('VITE_EMAIL'),
    name: getRequiredEnvValue('VITE_NAME'),
    mobileNo: getRequiredEnvValue('VITE_MOBILE'),
    githubUsername: getRequiredEnvValue('VITE_GITHUB_USERNAME'),
    rollNo: getRequiredEnvValue('VITE_ROLLNO'),
    accessCode: getRequiredEnvValue('VITE_ACCESS_CODE'),
  }
}

function getReadableRegistrationError(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string }>
  const statusCode = axiosError.response?.status

  if (statusCode === 401) {
    return 'Registration unauthorized (401). Check access code and payload.'
  }

  if (statusCode === 403) {
    return 'Registration forbidden (403).'
  }

  if (axiosError.code === 'ECONNABORTED') {
    return 'Registration timed out. Please try again.'
  }

  if (!axiosError.response) {
    return 'Network error while registering user.'
  }

  return axiosError.response?.data?.message ?? 'Registration failed.'
}

export async function registerUser(): Promise<RegisterResponse> {
  const baseUrl = getRequiredEnvValue('VITE_BASE_URL')
  const payload = getRegistrationPayload()

  try {
    const response = await axios.post<RegisterResponse>(`${baseUrl}/register`, payload, {
      timeout: REQUEST_TIMEOUT_MS,
    })

    console.log('Registration success:', response.data)
    return response.data
  } catch (error) {
    const message = getReadableRegistrationError(error)
    console.error('Registration failure:', message)
    throw new Error(message)
  }
}
