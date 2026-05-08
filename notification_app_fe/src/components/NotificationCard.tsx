import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import type { Notification } from '../types/notification'

interface NotificationCardProps {
  notification: Notification
}

function formatTimestamp(timestamp?: string) {
  if (!timestamp) {
    return 'Unknown time'
  }

  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return timestamp
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function NotificationCard({ notification }: NotificationCardProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack spacing={1.25}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
            }}
          >
            <Chip label={notification.type ?? 'Notification'} size="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              {formatTimestamp(notification.timestamp)}
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {notification.message ?? 'No message provided.'}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default NotificationCard