import { getAuthToken } from '../api/authApi'
import { Log } from '../middleware/logger'
import type { AuthPayload } from '../types/auth'
import { getRequiredEnvValue, validateEnvValues } from '../utils/envConfig'
import { getToken, saveToken } from '../utils/tokenStorage'

function getAuthPayloadFromEnv(): AuthPayload {
  validateEnvValues([
    'VITE_BASE_URL',
    'VITE_EMAIL',
    'VITE_NAME',
    'VITE_ROLLNO',
    'VITE_ACCESS_CODE',
    'VITE_CLIENT_ID',
    'VITE_CLIENT_SECRET',
  ])

  return {
    email: getRequiredEnvValue('VITE_EMAIL'),
    name: getRequiredEnvValue('VITE_NAME'),
    rollNo: getRequiredEnvValue('VITE_ROLLNO'),
    accessCode: getRequiredEnvValue('VITE_ACCESS_CODE'),
    clientID: getRequiredEnvValue('VITE_CLIENT_ID'),
    clientSecret: getRequiredEnvValue('VITE_CLIENT_SECRET'),
  }
}

export async function initializeAuth(): Promise<string> {
  const existingToken = getToken()

  if (existingToken) {
    console.log('Auth success: reusing stored token.')
    void Log({
      stack: 'frontend',
      level: 'info',
      package: 'auth',
      message: 'Reused stored authentication token.',
    })
    return existingToken
  }

  try {
    const payload = getAuthPayloadFromEnv()

    const authResponse = await getAuthToken(payload)
    saveToken(authResponse.access_token)

    console.log('Auth success: token generated and saved.')
    void Log({
      stack: 'frontend',
      level: 'info',
      package: 'auth',
      message: 'Authentication completed successfully.',
    })
    return authResponse.access_token
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown auth error'
    console.error('Auth failure:', message)
    throw new Error(message)
  }
}
