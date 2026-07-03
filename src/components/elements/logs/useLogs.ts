import { useCallback, useEffect, useRef, useState } from 'react'
import type { NetError, LogEntity } from '@/api/gen/api'
import { LogBuffer } from './LogBuffer'

export interface Filters {
    // TODO: add filters
}

interface ApiLogs {
    lastId: (filters?: Filters) => Promise<[number, any]>
}

interface Props {
    logBuffer: LogBuffer
    apiLogs: ApiLogs
    pageSize?: number
    filters: Filters
}

export function useLogs({ logBuffer, apiLogs, pageSize = 10, filters }: Props) {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [hasMore, setHasMore] = useState<boolean>(true)

    const nextIdRef = useRef<number | null>(null)

    const stringifiedFilters = JSON.stringify(filters)

    const fetchChunk = useCallback(async (explicitId: number | null = null) => {
        setLoading(true)
        try {
            let startId = explicitId

            if (startId === null) {
                const [lid, err] = await apiLogs.lastId(filters)
                if (err) throw err
                startId = lid
            }

            if (startId <= 0) {
                setHasMore(false)
                return []
            }

            const entries = await logBuffer.get(startId, pageSize)

            await new Promise((resolve) => setTimeout(resolve, 500))

            if (entries.length === 0) {
                setHasMore(false)
                return []
            }

            const lastItem = entries[entries.length - 1]
            nextIdRef.current = lastItem.globalId - 1

            if (nextIdRef.current < 0) setHasMore(false)
            return entries

        } catch (error) {
            console.error("Fetch error:", error)
            setHasMore(false)
            return []
        } finally {
            setLoading(false)
        }
    }, [logBuffer, pageSize, apiLogs, stringifiedFilters])

    const loadMore = useCallback(async () => {
        if (loading || !hasMore || nextIdRef.current === null) return

        if (nextIdRef.current <= 0) {
            setHasMore(false)
            return
        }

        const newEntries = await fetchChunk(nextIdRef.current)
        if (newEntries.length > 0) {
            setLogs((prev) => [...prev, ...newEntries])
        }
    }, [loading, hasMore, fetchChunk])

    useEffect(() => {
        let isMounted = true

        setLoading(true)
        setHasMore(true)
        nextIdRef.current = null

        fetchChunk(null).then((firstEntries) => {
            if (isMounted) {
                setLogs(firstEntries)
            }
        })

        return () => {
            isMounted = false
        }
    }, [fetchChunk])

    return { logs, loading, hasMore, loadMore }
}
