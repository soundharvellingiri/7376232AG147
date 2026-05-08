import { Stack, Typography } from '@mui/material'
import NotificationCard from './NotificationCard'
import type { Notification } from '../types/notification'

interface NotificationListProps {
  notifications: Notification[]
}

function NotificationList({ notifications }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No notifications available.
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </Stack>
  )
}

export default NotificationList