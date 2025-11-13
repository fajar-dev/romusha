import axios from 'axios'
import {
  NUSAWORK_EMPLOYEE_API_V2_URL,
  NUSAWORK_JOB_LEVEL_API_URL,
  NUSAWORK_SCHEDULE_API_URL,
  NUSAWORK_AUTH_REFRESH_MARGIN,
  NUSAWORK_AUTH_API_URL,
  NUSAWORK_AUTH_GRANT_TYPE,
  NUSAWORK_AUTH_CLIENT_ID,
  NUSAWORK_AUTH_CLIENT_SECRET,
} from './config'
import logger from './logger'

let cachedToken: null | string = null
let tokenExpiryTime: null | number = null

export async function getAuthToken(): Promise<null | string> {
  const now = Math.floor(Date.now() / 1000)
  if (
    cachedToken &&
    tokenExpiryTime &&
    now < tokenExpiryTime - NUSAWORK_AUTH_REFRESH_MARGIN
  ) {
    return cachedToken
  }
  try {
    const response = await axios.post(NUSAWORK_AUTH_API_URL, {
      grant_type: NUSAWORK_AUTH_GRANT_TYPE,
      client_id: NUSAWORK_AUTH_CLIENT_ID,
      client_secret: NUSAWORK_AUTH_CLIENT_SECRET,
    })
    cachedToken = response.data.access_token as string
    tokenExpiryTime = now + Number(response.data.expires_in)
  } catch (error) {
    logger.error('Error fetching auth token: ', error)
  }
  return cachedToken
}

export async function getAllEmployee() {
  const token = await getAuthToken()
  const formattedToday = Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(Date.now())

  const payload = {
    fields: {
      active_status: ['active'],
    },
    paginate: false,
    periods: [formattedToday, formattedToday],
  }

  try {
    const response = await axios.post(NUSAWORK_EMPLOYEE_API_V2_URL, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      cachedToken = null
    }
    logger.error(`Error get all employee: ${(error as Error).message}`)
  }
}

export async function getEmployeeSchedule(date: Date) {
  const token = await getAuthToken()
  const formattedDate = Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  const params = { type: 'day', date: formattedDate }
  try {
    const response = await axios.get(NUSAWORK_SCHEDULE_API_URL, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      cachedToken = null
    }
    logger.error(`Error get schedule: ${(error as Error).message}`)
  }
}

export async function getAllJobLevel() {
  const token = await getAuthToken()
  try {
    const response = await axios.get(NUSAWORK_JOB_LEVEL_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      cachedToken = null
    }
    logger.error(`Error get all job: ${(error as Error).message}`)
  }
}
