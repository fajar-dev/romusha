import axios from 'axios'
import { type RowDataPacket } from 'mysql2'
import { pool as nisDB } from './nis.mysql'
import { getAuthToken } from './nusawork'
import { sendWaNotif } from './nusawa'
import {
  visitCardSummaryApiUrl,
  visitCardToken,
  nusaworkAttendanceApiUrl
} from './config'


interface EngineerData {
  name: string
  visitcardUserId: string
  tickets: number[]
}

interface TicketData {
  status: string
  statusPriority: number
  visitTime: Date | null
  updatedTime: Date
}

interface VisitCardTicket {
  id: string
  last_update_time: string
  status_ticket_detail: {
    status: string
    time: string
  }
  ca_id: string
}


const IGNORED_ENGINEERS = [
  '0202403', '0200601', '0200615', '0200617',
  '0201217', '0201308', '0201216', '0202127'
]

const EMPLOYEE_NICKNAMES: Record<string, string> = {
  '0201324': '🛎️Mansyur', '0201632': '🚨Heri', '0202171': '🚨Hilmi',
  '0202426': '🚨Efen', '0202037': '🛎️Ray', '0202105': '🚨Dani',
  '0202166': '🚨Riandino', '0202220': '🚨Alfi', '0202265': '🛎️Hendy',
  '0202266': '🛎️Putra', '0202370': '🚨Syafii', '0202344': '🚨Virza',
  '0201215': '🚨Irwansyah', '0201628': '🚨Rizki', '0201716': '🚨Rama',
  '0202255': '🛎️Bagas', '0202257': '🛎️Bobby', '0202305': '🚨Johan',
  '0202250': '🛎️Christopher', '0202249': '🛎️Wildan', '0202273': '🚨Febry',
  '0201505': '🛎️Berto', '0201336': '🚨Solihin', '0202481': '🚨Damar',
  '0202487': '🚨Aldo', '0200912': '🛎️Bambang', '0202530': '🚨Irfan',
  '0202538': '🛎️Samuel', '0202546': '🚨Surya', '0202562': '🚨Jimmy'
}

/**
 * Fetches engineers from database
 * @returns {Promise<Record<string, EngineerData>>} Map of employee ID to engineer data
 */
async function fetchEngineers(): Promise<Record<string, EngineerData>> {
  const sql = `
    SELECT EmpId employeeId, CONCAT(EmpFName, ' ', EmpLName) name, VisitCardUserId visitcardUserId
    FROM Employee
    WHERE NOT EmpJoinStatus = 'QUIT' AND DisplayBranchId = '020' AND DeptId = '34'
      AND VisitCardUserId IS NOT NULL
  `
  
  const engineerMap: Record<string, EngineerData> = {}
  const [rows] = await nisDB.execute<RowDataPacket[]>(sql)
  
  rows.forEach(({ employeeId, name, visitcardUserId }) => {
    if (!IGNORED_ENGINEERS.includes(employeeId)) {
      engineerMap[employeeId] = { name, visitcardUserId, tickets: [] }
    }
  })
  
  return engineerMap
}

/**
 * Fetches tickets and builds ticket mappings
 * @param {Date} startTime - Start time for filtering tickets
 * @returns {Promise<Object>} Ticket mappings and pair sets
 */
async function fetchTickets(startTime: Date) {
  const sql = `
    SELECT t.TtsId ticketId, t.VisitTime visitTime, t.UpdTime updatedTime,
           ts.StatusName status, ts.StatusPriority statusPriority
    FROM Tts t
    LEFT JOIN TtsStatus ts ON t.StatusId = ts.StatusId
    WHERE t.StatusId NOT IN (10, 11) AND t.AssignBranchId = '020'
  `
  
  const ticketMap: Record<number, TicketData> = {}
  const visitcardTicketMap: Record<string, number> = {}
  const ticketIdPicNoPairSets: string[] = []
  
  const [rows] = await nisDB.execute<RowDataPacket[]>(sql)
  
  rows.forEach(({ ticketId, visitTime, updatedTime, status, statusPriority }) => {
    ticketMap[ticketId] = { status, statusPriority, visitTime, updatedTime }
    ticketIdPicNoPairSets.push(`(${ticketId}, 1)`)
  })
  
  return { ticketMap, visitcardTicketMap, ticketIdPicNoPairSets }
}

/**
 * Maps tickets to engineers
 * @param {Record<string, EngineerData>} engineerMap - Engineer data map
 * @param {string[]} ticketIdPicNoPairSets - Ticket ID pairs
 * @returns {Promise<Record<string, EngineerData>>} Updated engineer map with tickets
 */
async function processTiketData(
  engineerMap: Record<string, EngineerData>,
  ticketIdPicNoPairSets: string[]
): Promise<Record<string, EngineerData>> {
  const sql = `
    SELECT tp.TtsId ticketId, tp.EmpId employeeId
    FROM TtsPIC tp
    LEFT JOIN Tts t ON tp.TtsId = t.TtsId
    WHERE (tp.TtsId, tp.AssignedNo) IN (${ticketIdPicNoPairSets.join(',')})
  `
  
  const [rows] = await nisDB.execute<RowDataPacket[]>(sql)
  
  rows.forEach(({ ticketId, employeeId }) => {
    if (engineerMap[employeeId]) {
      engineerMap[employeeId].tickets.push(ticketId)
    }
  })
  
  return engineerMap
}

/**
 * Fetches present engineers from Nusawork attendance API
 * @param {Record<string, EngineerData>} engineerMap - Engineer data map
 * @param {string} token - Authentication token
 * @returns {Promise<string[]>} List of present engineer IDs
 */
async function fetchNusaworkPresentEngineers(
  engineerMap: Record<string, EngineerData>,
  token: string
): Promise<string[]> {
  const response = await axios.get(nusaworkAttendanceApiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    params: {
      status: 'working,clock_out',
      id_branch: '5',
      id_department: '29',
      sort_by: 'name',
      order_by: 'asc'
    }
  })
  
  const presentEngineers = response.data.data
  return Object.keys(engineerMap).filter(employeeId =>
    presentEngineers.some((e: any) => e.employee_id === employeeId)
  )
}

/**
 * Fetches current visit card data
 * @returns {Promise<VisitCardTicket[]>} List of visit card tickets
 */
async function fetchVisitCards(): Promise<VisitCardTicket[]> {
  const response = await axios.get(visitCardSummaryApiUrl, {
    headers: {
      Authorization: `Bearer ${visitCardToken}`,
      Accept: 'application/json'
    },
    params: {
      status: '0,1,2,3',
      row: 'all'
    }
  })
  
  return response.data._embedded
}

/**
 * Formats time to HH:mm
 * @param {Date} date - Date object
 * @returns {string} Formatted time string
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Generates ticket prefix based on status
 * @param {string} status - Ticket status
 * @param {string} time - Formatted time
 * @returns {string} Ticket prefix with emoji
 */
function getTicketPrefix(status: string, time: string): string {
  const prefixMap: Record<string, string> = {
    'Call': '☑',
    'Pending': '⏸',
    'done': `[*${time}*]☑`,
    'working': `[${time}]▶`,
    'pending': `[*${time}*]⏸`,
    'ontheway': `[${time}]🛫`
  }
  return prefixMap[status] || '☐'
}

/**
 * Checks if status indicates activity
 * @param {string} status - Ticket status
 * @returns {boolean} True if engineer is active
 */
function isActiveStatus(status: string): boolean {
  return status === 'working' || status === 'ontheway'
}

/**
 * Checks if status indicates idle
 * @param {string} status - Ticket status
 * @returns {boolean} True if engineer is idle
 */
function isIdleStatus(status: string): boolean {
  return status === 'done' || status === 'pending'
}

/**
 * Processes engineer tickets and sends WhatsApp notification
 * @param {string} phoneNumber - Target phone number for notification
 * @returns {Promise<void>}
 */
export async function processEngineerTickets(phoneNumber: string): Promise<void> {
  const startTime = new Date()
  startTime.setHours(8, 30, 0, 0)

  const token = await getAuthToken()
  let engineerMap = await fetchEngineers()
  const { ticketMap, visitcardTicketMap, ticketIdPicNoPairSets } = await fetchTickets(startTime)
  engineerMap = await processTiketData(engineerMap, ticketIdPicNoPairSets)
  let presentEngineers: string[] = []
  if (token) {
    presentEngineers = await fetchNusaworkPresentEngineers(engineerMap, token)
  }  const visitcardCurrentUserTickets = await fetchVisitCards()

  const orderedEngineers: any[] = []

  for (const employeeId of presentEngineers) {
    let idle = true
    let idleStartTime = startTime.getTime()
    const orderedTickets: any[] = []
    const ticketsOutput: string[] = []

    const [visitcardData] = visitcardCurrentUserTickets.filter(
      ({ id }: any) => id == engineerMap[employeeId].visitcardUserId
    )

    const { last_update_time, status_ticket_detail, ca_id } = visitcardData

    engineerMap[employeeId].tickets.forEach((ticketId: number) => {
      let statusPriority = 0
      
      if (ca_id in visitcardTicketMap &&
          visitcardTicketMap[ca_id] == ticketId &&
          +status_ticket_detail.time > startTime.getTime()) {
        statusPriority = 1
        ticketMap[ticketId].status = status_ticket_detail.status
      } else {
        statusPriority = ticketMap[ticketId].statusPriority
      }

      let visitPriority = 0
      if (ticketMap[ticketId].visitTime) {
        visitPriority = new Date(ticketMap[ticketId].visitTime).getTime()
      } else {
        visitPriority = new Date(ticketMap[ticketId].updatedTime).getTime() + 86400000
      }

      orderedTickets.push({ ticketId, statusPriority, visitPriority })
    })

    orderedTickets.sort((a, b) => {
      if (a.statusPriority == b.statusPriority) {
        return a.visitPriority - b.visitPriority
      }
      return a.statusPriority - b.statusPriority
    })

    const visitcardLastUpdate = status_ticket_detail.status == 'idle'
      ? +last_update_time
      : +status_ticket_detail.time
      
    const actionStartTime = new Date(
      visitcardLastUpdate > startTime.getTime() ? visitcardLastUpdate : startTime.getTime()
    )

    const formattedActionStartTime = formatTime(actionStartTime)

    orderedTickets.forEach(({ ticketId }) => {
      const status = ticketMap[ticketId].status
      const prefix = getTicketPrefix(status, formattedActionStartTime)
      
      let suffix = ''
      if (ticketMap[ticketId].visitTime &&
          status !== 'Call' &&
          ticketMap[ticketId].visitTime > startTime) {
        suffix = `[${formatTime(new Date(ticketMap[ticketId].visitTime))}]`
      }

      if (isActiveStatus(status)) {
        idle = false
      } else if (isIdleStatus(status)) {
        idleStartTime = actionStartTime.getTime()
      }

      ticketsOutput.push(`${prefix}${ticketId}${suffix}`)
    })

    orderedEngineers.push({ employeeId, idle, idleStartTime, tickets: ticketsOutput })
  }

  orderedEngineers.sort((a, b) => {
    if (a.idle === b.idle) {
      if (a.idleStartTime === b.idleStartTime) {
        return a.tickets.length - b.tickets.length
      }
      return a.idleStartTime - b.idleStartTime
    }
    return b.idle ? 1 : -1
  })

  let message = ''
  for (const { employeeId, idle, tickets } of orderedEngineers) {
    const name = EMPLOYEE_NICKNAMES[employeeId] || 
                `${employeeId} ${engineerMap[employeeId].name}`
    
    if (idle) {
      message += tickets.length > 0 
        ? `*${name}* - ${tickets.join(', ')}\n`
        : `*${name}*\n`
    } else {
      message += `${name} - ${tickets.join(', ')}\n`
    }
  }

  sendWaNotif( phoneNumber, message )
}