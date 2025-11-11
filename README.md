# NATS Worker

This project is a NATS worker that consumes messages from a NATS queue and performs various jobs based on the messages. The jobs involve interacting with different APIs and databases.

## Running the Project

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the necessary environment variables. You can use `.env.dist` as a template.
3.  **Start the worker:**
    ```bash
    npm start
    ```

## Available Jobs

This worker can perform the following jobs:

*   `generateEmployeeChart`: Generates an employee chart.
*   `sendEmployeeOnDutyNotif`: Sends notifications for employees on duty.
*   `syncFttxMonitor`: Synchronizes FTTX monitor data.
*   `notifyKarmaAlerts`: Sends notifications for Karma alerts.
*   `collectAndPublishPPPoEData`: Collects and publishes PPPoE data.
*   `syncZabbixData`: Synchronizes Zabbix data.
*   `muteOrphanAlert`: Mutes orphan alerts.
*   `autocloseAssignedTicket`: Automatically closes assigned tickets.
*   `autoCloseSurveyTickets`: Automatically closes survey tickets.
*   `autocloseHelpdeskTicket`: Automatically closes helpdesk tickets.
*   `syncNusacontactCustomer`: Synchronizes customer data to NusaContact.
*   `genNusacontactQueueMetrics`: Generates NusaContact queue metrics.
*   `genGamasMetrics`: Generates Gamas metrics.

## Configuration

The worker can be configured using the following environment variables:

*   `NATS_SERVERS`: NATS server URLs (default: `nats://localhost:4222`)
*   `NATS_TOKEN`: NATS authentication token
*   `NATS_STREAM`: NATS stream name (default: `JOBS`)
*   `NATS_CONSUMER`: NATS consumer name (default: `romusha`)
*   `MIN_BACKOFF_DELAY_SECONDS`: Minimum backoff delay in seconds (default: `1`)
*   `MAX_BACKOFF_DELAY_SECONDS`: Maximum backoff delay in seconds (default: `32`)
*   `NUSAWORK_EMPLOYEE_API_V2_URL`: Nusawork employee API v2 URL
*   `NUSAWORK_JOB_LEVEL_API_URL`: Nusawork job level API URL
*   `NUSAWORK_SCHEDULE_API_URL`: Nusawork schedule API URL
*   `NUSAWORK_EMPLOYEE_PHOTO_URL_PREFIX`: Nusawork employee photo URL prefix
*   `EMPLOYEE_CHART_FILE`: Path to the employee chart file (default: `/tmp/employee-chart.json`)
*   `EMPLOYEE_ON_DUTY_NOTIF_PIC_PHONES`: JSON array of PIC phone numbers for employee on-duty notifications (default: `[]`)
*   `NUSAWA_MESSAGE_API_URL`: Nusawa message API URL
*   `NUSAWA_MESSAGE_API_TOKEN`: Nusawa message API token
*   `NIS_MYSQL_HOST`: NIS MySQL host (default: `localhost`)
*   `NIS_MYSQL_PORT`: NIS MySQL port (default: `3306`)
*   `NIS_MYSQL_USER`: NIS MySQL user (default: `root`)
*   `NIS_MYSQL_PASSWORD`: NIS MySQL password
*   `NIS_MYSQL_DB`: NIS MySQL database name (default: `test`)
*   `SURREALDB_URL`: SurrealDB URL (default: `ws://localhost:8000/rpc`)
*   `SURREALDB_NAMESPACE`: SurrealDB namespace (default: `nis`)
*   `SURREALDB_DATABASE`: SurrealDB database name (default: `nis`)
*   `SURREALDB_USERNAME`: SurrealDB username (default: `root`)
*   `SURREALDB_PASSWORD`: SurrealDB password (default: `secret`)
*   `KARMA_ALERT_URL`: Karma alert URL
*   `WHATSAPP_API_URL`: WhatsApp API URL
*   `WHATSAPP_API_TOKEN`: WhatsApp API token
*   `KARMA_ALERT_WHATSAPP_CONTACT`: WhatsApp contact for Karma alerts
*   `PPPOE_SERVERS`: JSON array of PPPoE servers (default: `[]`)
*   `PPPOE_SERVERS_PRIVATE_KEY`: Private key for PPPoE servers
*   `PPPOE_FETHED_EVENT_SUBJECT`: NATS subject for PPPoE fetched events (default: `events.pppoe_data_fetched`)
*   `ZBX_MYSQL_HOST`: Zabbix MySQL host (default: `localhost`)
*   `ZBX_MYSQL_USER`: Zabbix MySQL user (default: `root`)
*   `ZBX_MYSQL_PASSWORD`: Zabbix MySQL password
*   `ZBX_MYSQL_DB`: Zabbix MySQL database name (default: `zabbix`)
*   `ZBX_MYSQL_PORT`: Zabbix MySQL port (default: `3306`)
*   `ZABBIX_PSQL_HOST`: Zabbix PostgreSQL host (default: `localhost`)
*   `ZABBIX_PSQL_USER`: Zabbix PostgreSQL user (default: `root`)
*   `ZABBIX_PSQL_PASSWORD`: Zabbix PostgreSQL password
*   `ZABBIX_PSQL_DB`: Zabbix PostgreSQL database name (default: `zabbix`)
*   `ZABBIX_PSQL_PORT`: Zabbix PostgreSQL port (default: `5432`)
*   `KARMA_ALERT_URL_SEARCH`: Karma alert URL for search
*   `GRACEPERIOD_HELPDESK`: Grace period for helpdesk tickets in hours (default: `2025`)
*   `GRACEPERIOD_ENGINEER`: Grace period for engineer tickets in hours (default: `2025`)
*   `WHATSAPP_NUSACONTACT_API_URL`: WhatsApp Nusacontact API URL
*   `WHATSAPP_NUSACONTACT_API_NAMESPACE`: WhatsApp Nusacontact API namespace (default: `nusaContact`)
*   `WHATSAPP_NUSACONTACT_API_APIKEY`: WhatsApp Nusacontact API key
*   `WHATSAPP_FEEDBACK_URL`: WhatsApp feedback URL
*   `WHATSAPP_QUESTION`: WhatsApp question for feedback
*   `SYNC_T2T_API_URL`: Sync T2T API URL
*   `SYNC_T2T_API_KEY`: Sync T2T API key
*   `NUSACONTACT_SYNC_CONTACT_API_URL`: API endpoint for syncing contacts with NusaContact
*   `NUSACONTACT_API_KEY`: API key for authenticating requests to NusaContact
*   `NUSACONTACT_SYNC_CONTACT_MAX_ATTEMPTS`: Maximum number of attempts for syncing contacts to NusaContact
*   `NUSACONTACT_METRICS_URL`: NusaContact metrics URL
*   `NUSACONTACT_METRICS_NAME`: NusaContact metrics name
*   `NUSACONTACT_QUEUE_METRICS_FILE_PATH`: Path to the NusaContact queue metrics file
*   `NUSACONTACT_QUEUE_METRICS_GROUPS`: JSON array of groups to filter enqueued items (default: `[]`)
*   `GAMAS_METRIC_MASS_INCIDENT_PERIOD_SECONDS`: Mass incident period in seconds (default: `60`)
*   `GAMAS_METRIC_MASS_INCIDENT_COUNT_THRESHOLD`: Mass incident count threshold (default: `8`)
*   `GAMAS_METRIC_MAX_INCIDENT_AGE_SECONDS`: Maximum incident age in seconds (default: `604800`)
*   `GAMAS_METRIC_ALERT_API_URL`: Alert API URL
*   `GAMAS_METRIC_NAME`: Gamas metrics name
*   `GAMAS_METRIC_FILE_PATH`: Path to the Gamas metrics file




