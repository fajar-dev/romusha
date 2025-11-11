export const NATS_SERVERS = process.env.NATS_SERVERS || 'nats://localhost:4222'
export const NATS_TOKEN = process.env.NATS_TOKEN || ''
export const NATS_STREAM = process.env.NATS_STREAM || 'JOBS'
export const NATS_CONSUMER = process.env.NATS_CONSUMER || 'romusha'
export const MIN_BACKOFF_DELAY_SECONDS =
  process.env.MIN_BACKOFF_DELAY_SECONDS || 1
export const MAX_BACKOFF_DELAY_SECONDS =
  process.env.MAX_BACKOFF_DELAY_SECONDS || 32
export const NUSAWORK_EMPLOYEE_API_V2_URL =
  process.env.NUSAWORK_EMPLOYEE_API_V2_URL ||
  'https://nusawork.com/api/v4.2/client/employee/filter'
export const NUSAWORK_JOB_LEVEL_API_URL =
  process.env.NUSAWORK_JOB_LEVEL_API_URL ||
  'https://nusawork.com/emp/api/v1.1/job-level'
export const NUSAWORK_SCHEDULE_API_URL =
  process.env.NUSAWORK_SCHEDULE_API_URL ||
  'https://nusawork.com/api/v2/calendar/schedule'
export const NUSAWORK_EMPLOYEE_PHOTO_URL_PREFIX =
  process.env.NUSAWORK_EMPLOYEE_PHOTO_URL_PREFIX ||
  'https://transit.is5.nusa.net.id/photo-crop/?t='
export const NUSAWORK_AUTH_REFRESH_MARGIN = Number(
  process.env.NUSAWORK_AUTH_REFRESH_MARGIN || 3600,
)
export const NUSAWORK_AUTH_API_URL =
  process.env.NUSAWORK_AUTH_TOKEN_API_URL || 'https://nusawork.com/api/auth'
export const NUSAWORK_AUTH_GRANT_TYPE =
  process.env.NUSAWORK_AUTH_GRANT_TYPE || 'client_credentials'
export const NUSAWORK_AUTH_CLIENT_ID = Number(
  process.env.NUSAWORK_AUTH_CLIENT_ID || 3,
)
export const NUSAWORK_AUTH_CLIENT_SECRET =
  process.env.NUSAWORK_AUTH_CLIENT_SECRET || 'xxxxxxxxxxxxxxxx'

export const EMPLOYEE_CHART_FILE =
  process.env.EMPLOYEE_CHART_FILE || '/tmp/employee-chart.json'

export const EMPLOYEE_ON_DUTY_NOTIF_PIC_PHONES =
  process.env.EMPLOYEE_ON_DUTY_NOTIF_PIC_PHONES || '[]'

export const NUSAWA_MESSAGE_API_URL =
  process.env.NUSAWA_MESSAGE_API_URL ||
  'https://api.nusacontact.com/v2/messages'
export const NUSAWA_MESSAGE_API_TOKEN =
  process.env.NUSAWA_MESSAGE_API_TOKEN || ''

export const NIS_MYSQL_HOST = process.env.NIS_MYSQL_HOST || 'localhost'
export const NIS_MYSQL_PORT = process.env.NIS_MYSQL_PORT || 3306
export const NIS_MYSQL_USER = process.env.NIS_MYSQL_USER || 'root'
export const NIS_MYSQL_PASSWORD = process.env.NIS_MYSQL_PASSWORD || ''
export const NIS_MYSQL_DB = process.env.NIS_MYSQL_DB || 'test'

export const SURREALDB_URL =
  process.env.SURREALDB_URL || 'ws://localhost:8000/rpc'
export const SURREALDB_NAMESPACE = process.env.SURREALDB_NAMESPACE || 'nis'
export const SURREALDB_DATABASE = process.env.SURREALDB_DATABASE || 'nis'
export const SURREALDB_USERNAME = process.env.SURREALDB_USERNAME || 'root'
export const SURREALDB_PASSWORD = process.env.SURREALDB_PASSWORD || 'secret'

export const KARMA_ALERT_URL =
  process.env.KARMA_ALERT_URL || 'https://karma.nusa.net.id/alerts.json'
export const WHATSAPP_API_URL =
  process.env.WHATSAPP_API_URL || 'https://nusacontact.com/api/messages'
export const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || 'secret'
export const KARMA_ALERT_WHATSAPP_CONTACT =
  process.env.KARMA_ALERT_WHATSAPP_CONTACT || '6281234567890'

export const PPPOE_SERVERS = process.env.PPPOE_SERVERS || '[]'
export const PPPOE_SERVERS_PRIVATE_KEY =
  process.env.PPPOE_SERVERS_PRIVATE_KEY || ''
export const PPPOE_FETHED_EVENT_SUBJECT =
  process.env.PPPOE_FETHED_EVENT_SUBJECT || 'events.pppoe_data_fetched'

export const ZBX_MYSQL_HOST = process.env.ZBX_MYSQL_HOST || 'localhost'
export const ZBX_MYSQL_USER = process.env.ZBX_MYSQL_USER || 'root'
export const ZBX_MYSQL_PASSWORD = process.env.ZBX_MYSQL_PASSWORD || ''
export const ZBX_MYSQL_DB = process.env.ZBX_MYSQL_DB || 'zabbix'
export const ZBX_MYSQL_PORT = process.env.ZBX_MYSQL_PORT || 3306

export const ZABBIX_PSQL_HOST = process.env.ZABBIX_PSQL_HOST || 'localhost'
export const ZABBIX_PSQL_USER = process.env.ZABBIX_PSQL_USER || 'root'
export const ZABBIX_PSQL_PASSWORD = process.env.ZABBIX_PSQL_PASSWORD || ''
export const ZABBIX_PSQL_DB = process.env.ZABBIX_PSQL_DB || 'zabbix'
export const ZABBIX_PSQL_PORT = process.env.ZABBIX_PSQL_PORT || 5432

export const KARMA_ALERT_URL_SEARCH =
  process.env.KARMA_ALERT_URL_SEARCH || 'https://karma.nusa.net.id/alerts.json'
export const GRACEPERIOD_HELPDESK =
  Number(process.env.GRACEPERIOD_HELPDESK) || 2025
export const GRACEPERIOD_ENGINEER =
  Number(process.env.GRACEPERIOD_ENGINEER) || 2025
export const WHATSAPP_NUSACONTACT_API_URL =
  process.env.WHATSAPP_NUSACONTACT_API_URL || ''
export const WHATSAPP_NUSACONTACT_API_NAMESPACE =
  process.env.WHATSAPP_NUSACONTACT_API_NAMESPACE || 'nusaContact'
export const WHATSAPP_NUSACONTACT_API_APIKEY =
  process.env.WHATSAPP_NUSACONTACT_API_APIKEY || ''
export const WHATSAPP_FEEDBACK_URL = process.env.WHATSAPP_FEEDBACK_URL || ''
export const WHATSAPP_QUESTION = process.env.WHATSAPP_QUESTION || ''
export const SYNC_T2T_API_URL = process.env.SYNC_T2T_API_URL || ''
export const SYNC_T2T_API_KEY = process.env.SYNC_T2T_API_KEY || ''

export const ISSUE_GRACE_PERIOD_SECONDS = Number(
  process.env.ISSUE_GRACE_PERIOD_SECONDS || 14400,
)
export const ISSUE_METRICS_FILE =
  process.env.ISSUE_METRICS_FILE || './data/issue-metrics.txt'
export const ISSUE_METRICS_FILE_TEMP =
  process.env.ISSUE_METRICS_FILE_TEMP || './data/issue-metrics.txt.tmp'

export const FBSTAR_TICKET_API_URL = process.env.FBSTAR_TICKET_API_URL || ''
export const FBSTAR_TOKEN_API_URL = process.env.FBSTAR_TOKEN_API_URL || ''
export const FBSTAR_API_USERNAME = process.env.FBSTAR_API_USERNAME || ''
export const FBSTAR_API_PASSWORD = process.env.FBSTAR_API_PASSWORD || ''
export const FBSTAR_TICKET_METRICS_FILE =
  process.env.FBSTAR_TICKET_METRICS_FILE || './data/fbstar-ticket-metrics.txt'
export const FBSTAR_TICKET_METRICS_FILE_TEMP =
  process.env.FBSTAR_TICKET_METRICS_FILE_TEMP ||
  './data/fbstar-ticket-metrics.txt.tmp'

export const TICKET_LINK_BASE_URL =
  process.env.TICKET_LINK_BASE_URL || 'http://localhost:3000/ticket'
export const TICKET_ID_ENCODED_LENGTH = Number(
  process.env.TICKET_ID_LENGTH || 8,
)
export const TICKET_ID_ENCODED_CHARS =
  process.env.TICKET_ID_ENCODED_CHARS || 'abcdefghijklmnopqrstuvwxyz'
export const TICKET_ID_ENCODED_SALT =
  process.env.TICKET_ID_ENCODED_SALT || 'xxxxxxxx'

export const ONLINE_TICKET_METRICS_FILE =
  process.env.ONLINE_TICKET_METRICS_FILE || './data/online-ticket-metrics.txt'
export const ONLINE_TICKET_METRICS_FILE_TEMP =
  process.env.ONLINE_TICKET_METRICS_FILE_TEMP ||
  './data/online-ticket-metrics.txt.tmp'

export const INCOMPLETE_SUBSCRIBER_DATA_METRICS_FILE =
  process.env.INCOMPLETE_SUBSCRIBER_DATA_METRICS_FILE ||
  './data/incomplete-subscriber-data-metrics.txt'
export const INCOMPLETE_SUBSCRIBER_DATA_METRICS_FILE_TEMP =
  process.env.INCOMPLETE_SUBSCRIBER_DATA_METRICS_FILE_TEMP ||
  './data/incomplete-subscriber-data-metrics.txt.tmp'

export const IFORTE_ZABBIX_API_URL =
  process.env.IFORTE_ZABBIX_API_URL || 'http://localhost/zabbix/api_jsonrpc.php'
export const IFORTE_ZABBIX_USERNAME =
  process.env.IFORTE_ZABBIX_USERNAME || 'zabbix'
export const IFORTE_ZABBIX_PASSWORD =
  process.env.IFORTE_ZABBIX_PASSWORD || 'zabbix'

export const FBSTAR_DOWN_SUBSCRIBER_ALERT_URL =
  process.env.FBSTAR_DOWN_SUBSCRIBER_ALERT_URL ||
  'http://localhost:9093/api/v2/alerts/groups?filter=alertname%3D%22down%22&filter=group%3D%22fttx%22&filter=link%3d%22fs%22&silenced=true&inhibited=false&active=true'
export const FBSTAR_DOWN_SUBSCRIBER_ALERT_LOOKBACK_HOURS = Number(
  process.env.FBSTAR_DOWN_SUBSCRIBER_ALERT_LOOKBACK_HOURS || 48,
)

export const DBAIS5_MYSQL_HOST = process.env.DBAIS5_MYSQL_HOST || 'localhost'
export const DBAIS5_MYSQL_PORT = process.env.DBAIS5_MYSQL_PORT || 3306
export const DBAIS5_MYSQL_USER = process.env.DBAIS5_MYSQL_USER || 'root'
export const DBAIS5_MYSQL_PASSWORD = process.env.DBAIS5_MYSQL_PASSWORD || ''
export const DBAIS5_MYSQL_DB = process.env.DBAIS5_MYSQL_DB || 'test'

// nusacontact sync contact 
export const nusacontactSyncContactApiUrl =
  process.env.NUSACONTACT_SYNC_CONTACT_API_URL || ''
export const nusacontactApiKey = process.env.NUSACONTACT_API_KEY || ''
export const nusacontactSyncContactMaxAttempts =
  process.env.NUSACONTACT_SYNC_CONTACT_MAX_ATTEMPTS || '8'

// nusacontact metrics exporter
export const nusacontactMetricsUrl = process.env.NUSACONTACT_METRICS_URL || ''
export const nusacontactQueueMetricName =
  process.env.NUSACONTACT_QUEUE_METRIC_NAME || 'nusacontact_queue'
export const nusacontactQueueGroups =
  process.env.NUSACONTACT_QUEUE_GROUPS || '["helpdesk","billing"]'
export const nusacontactQueueMetricFilePath =
  process.env.NUSACONTACT_QUEUE_METRIC_FILE_PATH || '/tmp/nusacontact.txt'