import axios, { AxiosError } from 'axios'
import type { Notification } from '../types/notification'
import { getRequiredEnvValue } from '../utils/envConfig'
import { clearToken, getToken } from '../utils/tokenStorage'

const REQUEST_TIMEOUT_MS = 10000

export interface NotificationQueryParams {
  limit?: number
  page?: number
  notification_type?: 'Placement' | 'Result' | 'Event'
}

interface NotificationApiItem {
  id?: string
  type?: string
  message?: string
  timestamp?: string
  createdAt?: string
}

interface NotificationApiObjectResponse {
  notifications?: NotificationApiItem[]
}

function normalizeNotification(notification: NotificationApiItem, index: number): Notification {
  return {
    id: notification.id ?? `notification-${index}`,
    type: notification.type ?? 'Result',
    message: notification.message ?? 'No message provided.',
    timestamp: notification.timestamp ?? notification.createdAt ?? new Date().toISOString(),
  }
}

function getReadableApiError(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string }>
  const statusCode = axiosError.response?.status

  if (statusCode === 401) {
    return 'Session expired or unauthorized. Please authenticate again.'
  }

  if (statusCode === 403) {
    return 'Access denied for notifications API.'
  }

  if (axiosError.code === 'ECONNABORTED') {
    return 'Notification request timed out. Please try again.'
  }

  if (!axiosError.response) {
    return 'Network error while loading notifications.'
  }

  return axiosError.response?.data?.message ?? 'Unable to fetch notifications.'
}

export async function fetchNotifications(
  queryParams: NotificationQueryParams = {},
): Promise<Notification[]> {
  const baseUrl = getRequiredEnvValue('VITE_BASE_URL')
  const token = getToken()

  if (!token) {
    throw new Error('Authentication token not found. Please authenticate first.')
  }

  try {
    const response = await axios.get<NotificationApiItem[] | NotificationApiObjectResponse>(
      `${baseUrl}/notifications`,
      {
        timeout: REQUEST_TIMEOUT_MS,
        params: queryParams,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    const rawNotifications = Array.isArray(response.data)
      ? response.data
      : response.data.notifications ?? []

    const normalizedNotifications = rawNotifications.map(normalizeNotification)
    console.log('Notification fetch success:', normalizedNotifications.length)
    return normalizedNotifications
  } catch (error) {
    const message = getReadableApiError(error)

    if (message.toLowerCase().includes('unauthorized')) {
      clearToken()
    }

    console.error('Notification fetch failure:', message)
    throw new Error(message)
  }
}