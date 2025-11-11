import fs from 'fs'
import path from 'path'
import axios from 'axios'
import {
    nusacontactApiKey,
    nusacontactMetricsUrl,
    nusacontactQueueGroups,
    nusacontactQueueMetricFilePath,
    nusacontactQueueMetricName,
} from './config'
import logger from './logger'

// types
interface Labels {
    [key: string]: string
}

interface Metric {
    labels: Labels
    value: number
}

interface Result {
    [metricName: string]: Metric[]
}

/**
 * Generate queue metrics for NusaContact.
 * Fetches metrics from the API, filters by tags, and writes to file.
 * @returns {Promise<void>}
 */
export async function generateNusacontactQueueMetrics(): Promise<void> {
    try {
        const tags: string[] = JSON.parse(nusacontactQueueGroups)
        const queueCount: Record<string, number> = {}

        const response = await axios.get(nusacontactMetricsUrl, {
        headers: { 'X-Api-Key': nusacontactApiKey },
        })

        const { inbox_waiting_start_time: metricsData } = parseMetricLines(response.data)

        metricsData
        .filter((m) => m.labels.type === 'enqueued')
        .forEach((m) => {
            for (const tag of tags) {
            if (!m.labels.tags?.includes(tag)) continue
            queueCount[tag] = (queueCount[tag] || 0) + 1
            }
        })

        const lines = Object.entries(queueCount).map(
        ([tag, count]) => `${nusacontactQueueMetricName}{tag="${tag}"} ${count}`
        )

        writeMetricsFile(lines)
    } catch (error: any) {
        logger.error('[nusacontact-exporter] Failed to generate metrics:', error)
    }
}

/**
 * Parse Prometheus metric lines into structured object.
 * @param {string} input - The Prometheus metrics string to parse.
 * @returns {Result} The parsed result with metric names as keys.
 */
function parseMetricLines(input: string): Result {
    const result: Result = {}
    const lines = input.trim().split('\n')

    for (const line of lines) {
        if (line.startsWith('#')) continue

    const metricNameEnd = line.indexOf('{')
    const labelsStart = metricNameEnd + 1
    const labelsEnd = line.indexOf('}')
    const valueStart = labelsEnd + 1

    const metricName = line.substring(0, metricNameEnd).trim()
    const labelString = line.substring(labelsStart, labelsEnd).trim()
    const value = parseFloat(line.substring(valueStart).trim())

    const labels = parseAttributes(labelString)
    const metric: Metric = { labels, value }

    if (!result[metricName]) result[metricName] = []
    result[metricName].push(metric)
    }

    return result
}

/**
 * Parse attribute string using state machine approach.
 * Handles both single and double quotes with proper error handling.
 * @param {string} input - The attribute string to parse (e.g., `type="nusacontact_queue",tags="helpdesk"`).
 * @returns {Labels} The parsed labels as an object.
 */
function parseAttributes(input: string): Labels {
    const [INITIAL, READING_ATTR, IN_QUOTE, READING_VALUE, AFTER_SEP] = [0, 1, 2, 3, 4]

    const attrs: Labels = {}
    let state = INITIAL
    let quote = '"'
    const attrBuf: string[] = []
    const valBuf: string[] = []

    function commitAttribute(): void {
        const attrName = attrBuf.join('')
        const attrValue = valBuf.join('')
        attrs[attrName] = attrValue
        attrBuf.length = 0
        valBuf.length = 0
        state = INITIAL
    }

    for (const char of input) {
        switch (state) {
            case INITIAL:
                if (char === ' ' || char === ',') continue
                if (char === '=') throw new Error('Unexpected "=" without attribute name')
                state = READING_ATTR
                attrBuf.push(char)
            break

            case READING_ATTR:
                if (char === '=') state = AFTER_SEP
                else if (char === ' ') throw new Error('Space in attribute name')
                else attrBuf.push(char)
            break

            case AFTER_SEP:
                if (char === '"' || char === "'") {
                    state = IN_QUOTE
                    quote = char
                } else if (char !== ' ') {
                    state = READING_VALUE
                    valBuf.push(char)
                }
            break

            case READING_VALUE:
                if (char === ' ' || char === ',') commitAttribute()
                else valBuf.push(char)
            break

            case IN_QUOTE:
                if (char === quote) commitAttribute()
                else valBuf.push(char)
            break
        }
    }

    if (state === READING_VALUE) commitAttribute()
    else if (state !== INITIAL && state !== IN_QUOTE) {
        throw new Error('Input ended unexpectedly')
    }

    return attrs
}

/**
 * Safely write metrics to file using atomic replace strategy.
 * Creates a temporary file first, then renames it to avoid partial writes.
 * @param {string[]} lines - The metric lines to write.
 * @returns {void}
 */
function writeMetricsFile(lines: string[]): void {
    const dir = path.dirname(nusacontactQueueMetricFilePath)
    const tmpDir = fs.mkdtempSync(path.join(dir, 'tmp-'))
    const tmpFile = path.join(tmpDir, 'tempfile.txt')

    try {
        fs.writeFileSync(tmpFile, lines.join('\n'))
        fs.renameSync(tmpFile, nusacontactQueueMetricFilePath)
    } catch (error: any) {
        logger.error('[nusacontact-exporter] Failed to write metric file:', error)
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    }
}