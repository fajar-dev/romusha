import path from 'path'
import fs from 'fs'
import axios from 'axios'
import {
    gamasAlertApiUrl,
    gamasMassIncidentCountThreshold,
    gamasMassIncidentPeriodSeconds,
    gamasMaxIncidentAgeSeconds,
    gamasMetricFilePath,
    gamasMetricName,
} from './config'

// TYPES
interface Alert {
    startsAt: string
    labels: {
        host: string
        link: string
        region: string
    }
}

interface Incident {
    startsAt: string
    host: string
    link: string
    region: string
}

interface IncidentGroup {
    region: string
    link: string
    hosts: string[]
    count: number
    startsAtMin: string
    startsAtMax: string
}

/**
 * Generate Gamas metrics from external alerts API
 * Fetches alerts, groups them by similarity, and writes Prometheus metrics to file
 * @returns Promise that resolves when metrics are written
 */
export async function generateGamasMetrics(): Promise<void> {
    const response = await axios.get(gamasAlertApiUrl)
    const alerts = response.data.length > 0 ? response.data[0].alerts : []
    const incidents = extractAndSortIncidents(alerts)
    const incidentGroups = groupIncidents(incidents)
    const metricsOutput = formatPrometheusMetrics(incidentGroups)
    writeMetricsAtomic(metricsOutput, gamasMetricFilePath)
}

/**
 * Check if two dates are within a specified time tolerance
 * @param date1 - First date in ISO string format
 * @param date2 - Second date in ISO string format
 * @param toleranceSeconds - Maximum allowed time difference in seconds
 * @returns True if dates are within tolerance, false otherwise
 */
function isWithinTolerance(
    date1: string,
    date2: string,
    toleranceSeconds: number,
    ): boolean {
    const timeDiff = Math.abs(
        new Date(date1).getTime() - new Date(date2).getTime(),
    )
    return timeDiff <= toleranceSeconds * 1000
}

/**
 * Convert incident groups to Prometheus metrics format
 * @param groups - Array of incident groups
 * @returns Prometheus metrics string (one metric per line)
 */
function formatPrometheusMetrics(groups: IncidentGroup[]): string {
    const metrics = groups
        .filter(({ count }) => count > gamasMassIncidentCountThreshold)
        .map(({ region, link, count, startsAtMin }) => {
        // Format datetime to "YYYY-MM-DD HH:mm"
        const date = new Date(startsAtMin)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const startTime = `${year}-${month}-${day} ${hours}:${minutes}`
        
        return `${gamasMetricName}{region="${region}",link="${link}",start="${startTime}"} ${count}`
        })

    return metrics.join('\n')
}

/**
 * Write content to file atomically using temporary file
 * @param content - String content to write
 * @param filePath - Destination file path
 * @returns void
 */
function writeMetricsAtomic(content: string, filePath: string): void {
    const directoryPath = path.dirname(filePath)
    const tempDirectoryPath = fs.mkdtempSync(path.join(directoryPath, 'temp-'))
    const tempFilePath = path.join(tempDirectoryPath, 'tempfile.txt')

    fs.writeFileSync(tempFilePath, content)
    fs.renameSync(tempFilePath, filePath)
    fs.rmdirSync(tempDirectoryPath)
}

/**
 * Extract incidents from alerts and sort by start time
 * @param alerts - Array of raw alerts from API
 * @returns Array of incidents sorted chronologically
 */
function extractAndSortIncidents(alerts: Alert[]): Incident[] {
    return alerts
        .map(({ startsAt, labels: { host, link, region } }) => ({
            startsAt,
            host,
            link,
            region,
        }))
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
}

/**
 * Group incidents by region, link, and time proximity
 * Filters out old incidents and groups similar incidents together
 * @param incidents - Array of incidents to group
 * @returns Array of incident groups with aggregated data
 */
function groupIncidents(incidents: Incident[]): IncidentGroup[] {
    const incidentGroups: IncidentGroup[] = []
    const now = new Date().toISOString()

    for (const incident of incidents) {
        // Skip old incidents
        if (!isWithinTolerance(incident.startsAt, now, +gamasMaxIncidentAgeSeconds)) {
        continue
        }

        // Find existing group that matches
        const group = incidentGroups.find(
        (g) =>
            g.region === incident.region &&
            g.link === incident.link &&
            (isWithinTolerance(g.startsAtMin, incident.startsAt, +gamasMassIncidentPeriodSeconds) ||
            isWithinTolerance(g.startsAtMax, incident.startsAt, +gamasMassIncidentPeriodSeconds)),
        )

        if (group) {
        // Skip if host already in group
        if (group.hosts.includes(incident.host)) {
            continue
        }

        // Add to existing group
        group.hosts.push(incident.host)
        group.count++
        
        const startsAtDate = new Date(incident.startsAt)
        group.startsAtMin = new Date(
            Math.min(new Date(group.startsAtMin).getTime(), startsAtDate.getTime()),
        ).toISOString()
        group.startsAtMax = new Date(
            Math.max(new Date(group.startsAtMax).getTime(), startsAtDate.getTime()),
        ).toISOString()
        } else {
        // Create new group
        incidentGroups.push({
            region: incident.region,
            link: incident.link,
            hosts: [incident.host],
            count: 1,
            startsAtMin: incident.startsAt,
            startsAtMax: incident.startsAt,
        })
        }
    }

    return incidentGroups
}
