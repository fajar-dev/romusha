import type { RowDataPacket } from 'mysql2'
import { dbaIs5, zabbixMysqlPool } from './nis.mysql'
import logger from './logger'

/**
 * Main function to clean up dead Zabbix graph links from NIS database
 * @returns {Promise<void>} Promise that resolves when cleanup is complete
 */
export async function deleteDeadGraphLinks(): Promise<void> {
    const nisGraphs = await fetchNisGraphs()
    
    if (nisGraphs.length === 0) {
        return
    }

    const deadGraphs = await findDeadGraphs(nisGraphs)
    
    if (deadGraphs.length === 0) {
        return
    }

    await deleteNisGraphs(deadGraphs)
}

/**
 * Fetch all Zabbix graph IDs from NIS database for active customer services in branch 020
 * @returns {Promise<number[]>} Array of valid graph IDs from NIS database
 */
async function fetchNisGraphs(): Promise<number[]> {
    const sql = `
        SELECT cszg.GraphId AS graphId 
        FROM CustomerServicesZabbixGraph cszg
        LEFT JOIN CustomerServices cs ON cszg.CustServId = cs.CustServId
        LEFT JOIN Customer c ON cs.CustId = c.CustId
        WHERE cs.CustStatus != 'NA'
        AND c.BranchId = '020'
    `

    const [rows] = await dbaIs5.execute<RowDataPacket[]>(sql)
    
    return rows
        .map((row) => Number(row.graphId))
        .filter((graphId) => !isNaN(graphId))
}

/**
 * Find graphs that exist in NIS but not in Zabbix
 * @param {number[]} graphIds - Array of graph IDs to check against Zabbix database
 * @returns {Promise<number[]>} Array of graph IDs that don't exist in Zabbix (dead graphs)
 */
async function findDeadGraphs(graphIds: number[]): Promise<number[]> {
    if (graphIds.length === 0) {
        return []
    }

    const placeholders = graphIds.map(() => '?').join(',')
    const sql = `
        SELECT graphid AS graphId 
        FROM graphs 
        WHERE graphid IN (${placeholders})
    `

    const [rows] = await zabbixMysqlPool.execute<RowDataPacket[]>(sql, graphIds)
    const validGraphIds = new Set(rows.map((row) => row.graphId))

    return graphIds.filter((graphId) => !validGraphIds.has(graphId))
}

/**
 * Delete dead graph references from NIS database
 * @param {number[]} graphIds - Array of dead graph IDs to delete from CustomerServicesZabbixGraph table
 * @returns {Promise<void>} Promise that resolves when deletion is complete
 * @throws {Error} Throws error if database deletion fails
 */
async function deleteNisGraphs(graphIds: number[]): Promise<void> {
    if (graphIds.length === 0) {
        return
    }

    const placeholders = graphIds.map(() => '?').join(',')
    const sql = `
        DELETE FROM CustomerServicesZabbixGraph 
        WHERE GraphId IN (${placeholders})
    `

    try {
        await dbaIs5.execute(sql, graphIds)
        logger.info('Dead graphs deleted successfully')
    } catch (error) {
        const errorMessage = (error as Error).message
        logger.error(`Error deleting dead graphs: ${errorMessage}`)
    }
}

