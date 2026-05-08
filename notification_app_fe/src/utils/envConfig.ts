export type RequiredEnvKey =
  | 'VITE_BASE_URL'
  | 'VITE_EMAIL'
  | 'VITE_NAME'
  | 'VITE_ROLLNO'
  | 'VITE_MOBILE'
  | 'VITE_GITHUB_USERNAME'
  | 'VITE_ACCESS_CODE'
  | 'VITE_CLIENT_ID'
  | 'VITE_CLIENT_SECRET'

const envLabelMap: Record<RequiredEnvKey, string> = {
  VITE_BASE_URL: 'Base API URL',
  VITE_EMAIL: 'Email',
  VITE_NAME: 'Name',
  VITE_ROLLNO: 'Roll Number',
  VITE_MOBILE: 'Mobile Number',
  VITE_GITHUB_USERNAME: 'GitHub Username',
  VITE_ACCESS_CODE: 'Access Code',
  VITE_CLIENT_ID: 'Client ID',
  VITE_CLIENT_SECRET: 'Client Secret',
}

function getEnvValue(key: RequiredEnvKey): string {
  return (import.meta.env[key] as string) || ''
}

export function validateEnvValues(requiredKeys: RequiredEnvKey[]): void {
  const missingKeys = requiredKeys.filter((key) => !getEnvValue(key))

  if (missingKeys.length === 0) {
    return
  }

  const readableFields = missingKeys.map((key) => `${key} (${envLabelMap[key]})`)
  throw new Error(`Missing auth configuration: ${readableFields.join(', ')}`)
}

export function getRequiredEnvValue(key: RequiredEnvKey): string {
  const value = getEnvValue(key)

  if (value) {
    return value
  }

  throw new Error(`Missing auth configuration: ${key} (${envLabelMap[key]})`)
}
