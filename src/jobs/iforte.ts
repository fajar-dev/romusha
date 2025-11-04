import type { RowDataPacket } from 'mysql2/promise'
import { pool } from '../nis.mysql'
import { zbxGetGraphItems, zbxGetTrends, zbxLogin, zbxRpc } from '../zabbix'
import logger from '../logger'
import { batchArray } from '../array'
import { isValidDateFormat } from '../date'
import {
  IFORTE_ZABBIX_API_URL,
  IFORTE_ZABBIX_PASSWORD,
  IFORTE_ZABBIX_USERNAME,
} from '../config'

type SubscriberRow = RowDataPacket & {
  csid: number
  acc: string
}

type GraphRow = RowDataPacket & { csid: number; graphId: string }

type GraphItem = {
  graphid: string
  itemid: string
  sortorder: string
}

type ItemTrend = {
  itemid: string
  clock: string
  value_avg: string
}

async function getSubscriberGraphs() {
  const token = await zbxLogin(
    IFORTE_ZABBIX_API_URL,
    IFORTE_ZABBIX_USERNAME,
    IFORTE_ZABBIX_PASSWORD,
  )
  const graphs = await zbxRpc(
    IFORTE_ZABBIX_API_URL,
    'graph.get',
    {
      output: ['graphid', 'name'],
      search: { name: 'NUSANET-' },
      startSearch: true,
      sortfield: 'graphid',
      sortOrder: 'ASC',
      limit: 10000,
    },
    token,
  )
  const ret: Record<string, { cid: string; graphId: number }> = {}
  const re = /^NUSANET-(\d+):(\d+)-/
  for (const { name, graphid } of graphs) {
    const match = re.exec(name)
    if (!match) continue
    const cid = match[1]
    const sid = Number(match[2])
    ret[String(sid)] = { cid, graphId: graphid }
  }
  return ret
}

export async function syncZabbixSubscriberGraphs() {
  const graphs = await getSubscriberGraphs()
  const graphPrefix = 's'
  const graphIds = Object.values(graphs).map(
    ({ graphId }) => `${graphPrefix}${graphId}`,
  )
  const skippedGraphIds: string[] = []
  if (graphIds.length > 0) {
    for (const part of batchArray(graphIds, 64)) {
      const holder = part.map(() => '?').join(',')
      const sql = [
        'SELECT TRIM(GraphId) AS graphId',
        'FROM CustomerServicesZabbixGraph',
        `WHERE TRIM(GraphId) IN (${holder})`,
      ].join(' ')
      try {
        const [rows] = (await pool.execute(sql, part)) as any
        for (const { graphId } of rows) skippedGraphIds.push(graphId)
      } catch (error: any) {
        logger.error(error)
      }
    }
  }

  const sql = [
    'INSERT INTO CustomerServicesZabbixGraph',
    'SET CustServId = ?,',
    'GraphId = ?,',
    'Title = "Traffic",',
    'UpdatedTime = NOW(),',
    'UpdatedBy = "0200306"',
  ].join(' ')

  for (const csid in graphs) {
    const { graphId } = graphs[csid]
    const prefixedGraphId = `${graphPrefix}${graphId}`
    if (skippedGraphIds.includes(prefixedGraphId)) continue
    await pool.execute(sql, [Number(csid), prefixedGraphId])
  }
}

async function getSubscribers(): Promise<SubscriberRow[]> {
  const sql = [
    'SELECT cs.CustServId csid, cs.CustAccName acc',
    'FROM CustomerServices cs',
    'LEFT JOIN Customer c ON c.CustId = cs.CustId',
    'WHERE c.BranchId = "020"',
    'AND cs.CustStatus IN ("AC", "FR", "BL")',
  ].join(' ')
  const [rows] = await pool.query<SubscriberRow[]>(sql)
  return rows
}

async function getGraphRows(csids: number[]): Promise<GraphRow[]> {
  const batches = batchArray(csids, 64)
  const returnData: GraphRow[] = []

  for (const batch of batches) {
    const placeHolder = batch.map(() => '?').join(', ')
    const sql = [
      'SELECT CustServId csid, GraphId graphId',
      'FROM CustomerServicesZabbixGraph',
      `WHERE CustServId IN (${placeHolder})`,
      'ORDER BY CustServId, OrderNo, Id',
    ].join(' ')

    const [rows] = await pool.query<GraphRow[]>(sql, batch)
    returnData.push(...rows)
  }
  return returnData
}

export async function syncZabbixData(date: string = 'yesterday') {
  const accountMap: Map<number, string> = new Map()
  const graphsMap: Map<number, string[]> = new Map()
  const csids: number[] = []

  const subscribers = await getSubscribers()
  for (const { csid, acc } of subscribers) {
    accountMap.set(csid, acc)
    csids.push(csid)
  }

  const graphRows = await getGraphRows(csids)
  if (graphRows.length === 0) return

  let prevCsid = 0
  let graphIds: string[] = []
  for (const { csid, graphId } of graphRows) {
    if (prevCsid !== csid && prevCsid !== 0) {
      graphsMap.set(prevCsid, graphIds)
      graphIds = []
    }
    prevCsid = csid
    graphIds.push(graphId)
  }
  graphsMap.set(prevCsid, graphIds)

  const realGraphIds: number[] = []
  const graphToCsMap: Map<number, number> = new Map()
  for (const csid of csids) {
    if (!graphsMap.has(csid)) continue
    const [graphId] = graphsMap.get(csid) as string[]
    if (!graphId.startsWith('s')) continue
    const realGraphId = Number(graphId.substring(1))
    realGraphIds.push(realGraphId)
    graphToCsMap.set(realGraphId, csid)
  }

  const token = await zbxLogin(
    IFORTE_ZABBIX_API_URL,
    IFORTE_ZABBIX_USERNAME,
    IFORTE_ZABBIX_PASSWORD,
  )

  const graphItems: GraphItem[] = await zbxGetGraphItems(
    IFORTE_ZABBIX_API_URL,
    realGraphIds,
    token,
  )
  const itemToCsMap: Map<number, number> = new Map()
  const itemToSortOrderMap: Map<number, number> = new Map()
  const itemIds: number[] = []
  for (const { graphid, itemid, sortorder } of graphItems) {
    itemToSortOrderMap.set(Number(itemid), Number(sortorder))
    itemToCsMap.set(Number(itemid), graphToCsMap.get(Number(graphid)) as number)
    itemIds.push(Number(itemid))
  }

  let time: Date
  if (isValidDateFormat(date)) {
    time = new Date(date)
  } else {
    time = new Date()
    time.setDate(time.getDate() - 1)
  }
  time.setHours(0, 0, 0, 0)
  const itemTrends: ItemTrend[] = await zbxGetTrends(
    IFORTE_ZABBIX_API_URL,
    itemIds,
    time.getTime() / 1000,
    time.getTime() / 1000 + 86400 - 1,
    token,
  )

  const traffData: any = {}
  for (const { itemid, clock, value_avg } of itemTrends) {
    const dateString = Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(Number(clock) * 1000))
    const csid = itemToCsMap.get(Number(itemid))
    if (!(`${csid}` in traffData)) {
      traffData[`${csid}`] = {}
    }
    if (!(`${dateString}` in traffData[`${csid}`])) {
      traffData[`${csid}`][dateString] = {}
    }
    if (!('download' in traffData[`${csid}`][dateString])) {
      traffData[`${csid}`][dateString].download = 0
    }
    if (!('upload' in traffData[`${csid}`][dateString])) {
      traffData[`${csid}`][dateString].upload = 0
    }
    const sortOrder = itemToSortOrderMap.get(Number(itemid))
    if (sortOrder === 0) {
      traffData[`${csid}`][dateString].download +=
        (Number(value_avg) * 3600) / 8
    }
    if (sortOrder === 1) {
      traffData[`${csid}`][dateString].upload += (Number(value_avg) * 3600) / 8
    }
  }
  for (const csid in traffData) {
    for (const date in traffData[csid]) {
      const { download, upload } = traffData[csid][date]
      const sql = [
        'REPLACE INTO traff_data',
        `SET accountName = '${accountMap.get(Number(csid))}',`,
        `csid = ${csid},`,
        `date = '${date}',`,
        `total = ${download + upload},`,
        `download = ${download},`,
        `upload = ${upload}`,
      ].join(' ')
      await pool.execute(sql)
    }
  }
}
