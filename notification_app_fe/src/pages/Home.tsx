import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material'
import NotificationList from '../components/NotificationList'
import { fetchNotifications } from '../api/notificationApi'
import { Log } from '../middleware/logger'
import { initializeAuth } from '../services/authInitializer'
import type { Notification } from '../types/notification'
import { sortNotificationsByPriority } from '../utils/priorityUtils'
import { clearToken, getToken } from '../utils/tokenStorage'

const STACK_NAME = 'frontend'
const POLL_INTERVAL_MS = 15000
const LIMIT_OPTIONS = [5, 10, 20, 30]
const NOTIFICATION_TYPES = ['All', 'Placement', 'Result', 'Event'] as const

function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isSendingLog, setIsSendingLog] = useState(false)
  const [tokenStatus, setTokenStatus] = useState('Missing')
  const [debugMessage, setDebugMessage] = useState('No debug action yet.')
  const [selectedType, setSelectedType] = useState<(typeof NOTIFICATION_TYPES)[number]>('All')
  const [selectedLimit, setSelectedLimit] = useState('10')
  const [selectedPage, setSelectedPage] = useState('1')

  const isFetchingRef = useRef(false)

  const refreshTokenStatus = () => {
    const token = getToken()
    setTokenStatus(token ? 'Available' : 'Missing')
  }

  const handleAuthenticateUser = async () => {
    setIsAuthenticating(true)

    try {
      const token = await initializeAuth()
      refreshTokenStatus()
      setDebugMessage(`Authentication successful. Token length: ${token.length}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown auth error'
      setDebugMessage(`Authentication failed: ${message}`)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleSendTestLog = async () => {
    setIsSendingLog(true)

    const logSent = await Log({
      stack: STACK_NAME,
      level: 'info',
      package: 'page',
      message: 'Manual test log from Home page debug section',
    })

    setDebugMessage(logSent ? 'Logger success: test log sent.' : 'Logger failure: check console details.')
    setIsSendingLog(false)
  }

  const handleTypeChange = (event: SelectChangeEvent) => {
    setSelectedType(event.target.value as (typeof NOTIFICATION_TYPES)[number])
  }

  const handleLimitChange = (event: SelectChangeEvent) => {
    setSelectedLimit(event.target.value)
  }

  const handlePageChange = (event: SelectChangeEvent) => {
    setSelectedPage(event.target.value)
  }

  const getNotificationQuery = () => {
    const limit = Number(selectedLimit)
    const page = Number(selectedPage)

    return {
      limit,
      page,
      ...(selectedType === 'All' ? {} : { notification_type: selectedType }),
    }
  }

  const fetchAndRenderNotifications = async (retryCount = 0): Promise<void> => {
    if (isFetchingRef.current) {
      return
    }

    isFetchingRef.current = true
    setLoading(true)
    setErrorMessage('')

    try {
      await initializeAuth()
      refreshTokenStatus()

      const notificationList = await fetchNotifications(getNotificationQuery())

      setNotifications(sortNotificationsByPriority(notificationList))
      setDebugMessage(`Notification fetch successful. Total: ${notificationList.length}`)
      console.log('Notification fetch success: data rendered on Home page.')
      console.log('Sorting completed: notifications ordered by priority.')

      void Log({
        stack: STACK_NAME,
        level: 'info',
        package: 'page',
        message: 'Notifications fetched successfully',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const lowerMessage = message.toLowerCase()

      if (
        retryCount === 0 &&
        (lowerMessage.includes('unauthorized') ||
          lowerMessage.includes('session expired') ||
          lowerMessage.includes('timed out') ||
          lowerMessage.includes('network error'))
      ) {
        if (lowerMessage.includes('unauthorized') || lowerMessage.includes('session expired')) {
          clearToken()
          setDebugMessage('Token expired. Trying to authenticate again...')
          console.log('Auth failure detected during notifications fetch. Re-authenticating...')
          isFetchingRef.current = false
          await fetchAndRenderNotifications(retryCount + 1)
          return
        }

        setDebugMessage('Temporary API issue. Retrying once...')
        isFetchingRef.current = false
        await fetchAndRenderNotifications(retryCount + 1)
        return
      }

      setErrorMessage(message)
      setNotifications([])
      console.error('Notification fetch failure on Home page:', message)

      void Log({
        stack: STACK_NAME,
        level: 'error',
        package: 'page',
        message: `Failed to fetch notifications: ${message}`,
      })
    } finally {
      isFetchingRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTokenStatus()

    console.log('Polling started: notifications refresh every 15 seconds.')
    void fetchAndRenderNotifications()
    const intervalId = window.setInterval(() => {
      void fetchAndRenderNotifications()
    }, POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
      console.log('Polling stopped: notifications interval cleared.')
    }
  }, [selectedType, selectedLimit, selectedPage])

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5, md: 8 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Notifications are refreshed automatically every 15 seconds.
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Typography variant="h6">Filters</Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="notification-type-label">Type</InputLabel>
                <Select
                  labelId="notification-type-label"
                  value={selectedType}
                  label="Type"
                  onChange={handleTypeChange}
                >
                  {NOTIFICATION_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="limit-label">Limit</InputLabel>
                <Select labelId="limit-label" value={selectedLimit} label="Limit" onChange={handleLimitChange}>
                  {LIMIT_OPTIONS.map((limit) => (
                    <MenuItem key={limit} value={String(limit)}>
                      {limit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="page-label">Page</InputLabel>
                <Select labelId="page-label" value={selectedPage} label="Page" onChange={handlePageChange}>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <MenuItem key={page} value={String(page)}>
                      {page}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack>

          {loading ? (
            <Box
              sx={{
                minHeight: 240,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading notifications...
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
              <NotificationList notifications={notifications} />
            </Stack>
          )}
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            <Typography variant="h6">API Debug Controls</Typography>
            <Typography variant="body2" color="text.secondary">
              Token status: {tokenStatus}
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                onClick={handleAuthenticateUser}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? 'Authenticating...' : 'Authenticate User'}
              </Button>
              <Button variant="outlined" onClick={() => void fetchAndRenderNotifications()}>
                Fetch Notifications
              </Button>
              <Button
                variant="outlined"
                onClick={handleSendTestLog}
                disabled={isSendingLog}
              >
                {isSendingLog ? 'Sending Log...' : 'Send Test Log'}
              </Button>
            </Stack>

            <Divider />
            <Typography variant="body2" color="text.secondary">
              {debugMessage}
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}

export default Home