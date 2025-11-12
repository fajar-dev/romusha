import { type JsMsg, type NatsConnection } from 'nats'
import { generateEmployeeChart, sendEmployeeOnDutyNotif } from './jobs/employee'
import logger from './logger'
import { syncFttxMonitor } from './fttx.job'
import { notifyKarmaAlerts } from './alert.job'
import { collectAndPublishPPPoEData } from './jobs/pppoe'
import { syncZabbixData } from './zabbix.job'
import { muteOrphanAlert } from './mute-orphan-alert.job'
import { generateOutdatedIssueMetrics } from './jobs/issue'
import { syncDataCgsToDba } from './jobs/operator-nusanet'
import {
  autocloseAssignedTicket,
  autoCloseEskalasiTickets,
  autocloseHelpdeskTicket,
  autoCloseNocTickets,
  autoCloseSurveyTickets,
  autoCloseMonitoringTickets,
} from './jobs/auto-close-ticket'
import {
  notifyAllOverdueTickets as notifyAllOverdueFbstarTickets,
  notifyTicketDetail as notifyFbstarTicketDetail,
  syncTickets as syncFbstarTickets,
  updateOfflineSubscribers as updateFbstarOfflineSubscribers,
} from './jobs/fbstar'
import { exportOnlinePppoeTicketMetrics } from './jobs/ticket'
import { exportIncompleteSubscriberDataMetrics } from './jobs/subscriber'
import {
  syncZabbixSubscriberGraphs as syncIforteZabbixSubscriberGraphs,
  syncZabbixData as syncIforteZabbixData,
} from './jobs/iforte'
import { syncNusacontactCustomer } from './nusacontact'
import { generateNusacontactQueueMetrics } from './nusacontact-exporter'
import { generateGamasMetrics } from './gamas-exporter'
import { generateOverSpeedBlockedSubscriberMetrics } from './overspeed-exporter'
import { deleteDeadGraphLinks } from './dead-graph'

export async function processJob(message: JsMsg, nc: NatsConnection) {
  const subjectParts = message.subject.split('.')
  const jobName = subjectParts[2]
  logger.info(`executing job: ${jobName}`)

  switch (jobName) {
    case 'updateFbstarOfflineSubscribers':
      updateFbstarOfflineSubscribers()
      break
    case 'syncIforteZabbixSubscriberGraphs':
      syncIforteZabbixSubscriberGraphs()
      break
    case 'exportIncompleteSubscriberDataMetrics':
      exportIncompleteSubscriberDataMetrics()
      break
    case 'exportOnlinePppoeTicketMetrics':
      exportOnlinePppoeTicketMetrics()
      break
    case 'notifyFbstarTicketDetail':
      const requestId = subjectParts[3]
      notifyFbstarTicketDetail(requestId, subjectParts.slice(4).join('.'))
      break
    case 'notifyAllOverdueFbstarTickets':
      notifyAllOverdueFbstarTickets(
        subjectParts.slice(4).join('.'),
        Number(subjectParts[3]),
      )
      break
    case 'syncFbstarTickets':
      syncFbstarTickets()
      break
    case 'generateOutdatedIssueMetrics':
      generateOutdatedIssueMetrics()
      break
    case 'generateEmployeeChart':
      generateEmployeeChart()
      break
    case 'sendEmployeeOnDutyNotif':
      sendEmployeeOnDutyNotif()
      break
    case 'syncFttxMonitor':
      syncFttxMonitor()
      break
    case 'notifyKarmaAlerts':
      notifyKarmaAlerts()
      break
    case 'collectAndPublishPPPoEData':
      collectAndPublishPPPoEData(nc)
      break
    case 'syncIforteZabbixData':
      syncIforteZabbixData(subjectParts[3])
      break
    case 'syncZabbixData':
      syncZabbixData(subjectParts[3])
      break
    case 'muteOrphanAlert':
      muteOrphanAlert()
      break
    case 'autocloseAssignedTicket':
      autocloseAssignedTicket()
      break
    case 'autoCloseSurveyTickets':
      autoCloseSurveyTickets()
      break
    case 'autocloseHelpdeskTicket':
      autocloseHelpdeskTicket()
      break
    case 'autoCloseEskalasiTickets':
      autoCloseEskalasiTickets()
      break
    case 'autoCloseNocTickets':
      autoCloseNocTickets()
      break
    case 'autoCloseMonitoringTickets':
      autoCloseMonitoringTickets()
      break
    case 'syncDataCgsToDba':
      syncDataCgsToDba()
      break
    case 'syncNusacontactCustomer':
      await syncNusacontactCustomer(String(subjectParts[3]))
      break
    case 'genNusacontactQueueMetrics':
      await generateNusacontactQueueMetrics()
      break
    case 'genGamasMetrics':
      await generateGamasMetrics()
      break
    case 'genOverSpeedBlockedSubscriberMetrics':
      await generateOverSpeedBlockedSubscriberMetrics()
      break
    case 'delDeadGraphLink':
      await deleteDeadGraphLinks()
      break
    default:
      logger.warn(`Unknown job: ${jobName}`)
  }
  message.ack()
}
