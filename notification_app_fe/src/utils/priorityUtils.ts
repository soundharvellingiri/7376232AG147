import type { Notification } from '../types/notification'

const priorityOrder = ['Placement', 'Result', 'Event'] as const

function getPriority(type: string) {
  const priorityIndex = priorityOrder.indexOf(type as (typeof priorityOrder)[number])

  return priorityIndex === -1 ? priorityOrder.length : priorityIndex
}

export function sortNotificationsByPriority(
  notifications: Notification[],
): Notification[] {
  return [...notifications].sort((firstNotification, secondNotification) => {
    return getPriority(firstNotification.type) - getPriority(secondNotification.type)
  })
}