export interface RegistrationPayload {
  email: string
  name: string
  mobileNo: string
  githubUsername: string
  rollNo: string
  accessCode: string
}

export interface AuthPayload {
  email: string
  name: string
  rollNo: string
  accessCode: string
  clientID: string
  clientSecret: string
}

export interface RegisterResponse {
  clientID: string
  clientSecret: string
}

export interface AuthResponse {
  token_type: string
  access_token: string
  expires_in: number
}
