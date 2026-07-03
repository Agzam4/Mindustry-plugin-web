import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Api, type LogEntity } from '@/api/gen/api'
import { LogBuffer } from './LogBuffer'
import type { LogFilters } from './types'

interface Props {
    initId: number | null
    pageSize?: number
    filters: LogFilters
}

const INITIAL_PAGES = 1

export function useLogs({ initId, pageSize = 25, filters }: Props) {
    const stringifiedFilters = JSON.stringify(filters)
    const lastFiltersRef = useRef(stringifiedFilters)
    const bufferRef = useRef<LogBuffer>(null!)
    const firstItemIndexRef = useRef<number | null>(null)

    // Timelime A -[a, b]-> B
    const [logs, setLogs] = useState<LogEntity[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const [hasPast, setHasMoreOlder] = useState<boolean>(true)
    const [hasFuture, setHasMoreNewer] = useState<boolean>(true)

    const pastIndexRef = useRef<number | null>(null)
    const futureIndexRef = useRef<number | null>(null)

    const pastDelayedRef = useRef(false)
    const futureDelayedRef = useRef(false)

    const loadingRef = useRef(false)
    const logsRef = useRef<LogEntity[]>(logs)
    logsRef.current = logs

    if (!bufferRef.current || lastFiltersRef.current !== stringifiedFilters) {
        bufferRef.current = new LogBuffer(filters)
        lastFiltersRef.current = stringifiedFilters

        firstItemIndexRef.current = null
        loadingRef.current = false
        pastDelayedRef.current = false
        futureDelayedRef.current = false
        pastIndexRef.current = null
        futureIndexRef.current = null
    }

    /**
     * Return target amout of entries [min -> max]
     * (only if not end of logs for selected diraction)
     */
    const fetchChunk = useCallback(async (
        startId: RefObject<number | null>,
        direction: "past" | "future"
    ): Promise<LogEntity[]> => {
        if (startId.current === null) return []
        setLoading(true)
        loadingRef.current = true
        try {
            const entries = await (direction === 'past' ? bufferRef.current.past(startId.current, pageSize) : bufferRef.current.future(startId.current, pageSize));
            if (entries.length == 0) {
                startId.current = direction === 'past' ? 0 : startId.current + 1
                return entries
            }
            startId.current = direction === 'past' ? entries[0].globalId - 1 : entries[entries.length - 1].globalId + 1
            return entries
        } catch (error) {
            console.error("Fetch error:", error)
            return []
        } finally {
            setLoading(false)
            loadingRef.current = false
            if (pastDelayedRef.current) {
                pastDelayedRef.current = false
                loadOlder()
            }
            if (futureDelayedRef.current) {
                futureDelayedRef.current = false
                loadNewer()
            }
        }
    }, [pageSize])

    useEffect(() => {
        let cancelled = false

        setLoading(true)
        setHasMoreOlder(true)
        setHasMoreNewer(true)
        pastIndexRef.current = null
        futureIndexRef.current = null
            ; (async () => {
                let lid: number | null = initId
                if (lid === null) {
                    const [lastId, err] = await Api.logs.lastId()
                    console.log("No id provided, fetched: ", lastId)
                    if (lastId !== null) lid = lastId
                }

                if (cancelled) return
                if (lid == null || lid <= 0) {
                    setHasMoreOlder(false)
                    setLogs([])
                    setLoading(false)
                    return
                }

                console.log("Selected log:", lid)
                const startFrom = Math.floor(lid)

                const entries = await bufferRef.current.past(startFrom, pageSize)
                if (cancelled) return
                if (entries.length === 0) {
                    setHasMoreOlder(false)
                    setLogs([])
                    setLoading(false)
                    return
                }

                setLogs(entries)

                const oldest = entries[0].globalId
                const newest = entries[entries.length - 1].globalId

                firstItemIndexRef.current = lid

                pastIndexRef.current = Math.max(0, oldest - 1)
                futureIndexRef.current = newest + 1
                setHasMoreOlder(oldest > 0)
                setHasMoreNewer(true)
                setLoading(false)
            })()

        return () => { cancelled = true }
    }, [stringifiedFilters])

    const loadOlder = useCallback(async () => {
        if (!hasPast) return
        if (loadingRef.current) {
            pastDelayedRef.current = true
            return
        }
        const entries = await fetchChunk(pastIndexRef, 'past')
        if (entries.length === 0) {
            setHasMoreOlder(false)
            return
        }
        if (firstItemIndexRef.current) firstItemIndexRef.current -= entries.length

        setLogs(prev => [...entries, ...prev])
        if (entries.length < pageSize || entries[0].globalId <= 0) {
            setHasMoreOlder(false)
            return
        }
    }, [fetchChunk, hasPast, stringifiedFilters])

    const loadNewer = useCallback(async () => {
        if (!hasFuture) return // no future, lol
        if (loadingRef.current) {
            futureDelayedRef.current = true
            return
        }

        const entries = await fetchChunk(futureIndexRef, 'future')
        if (entries.length === 0) {
            setHasMoreNewer(false)
            return
        }

        setLogs(prev => [...prev, ...entries])
        if (entries.length < pageSize || entries[0].globalId <= 0) {
            setHasMoreNewer(false)
            return
        }
    }, [fetchChunk, hasFuture, stringifiedFilters])

    const firstItemIndex = logs.length > 0 ? logs[0].globalId : 0

    return { logs, loading, hasMoreOlder: hasPast, hasMoreNewer: hasFuture, loadOlder, loadNewer, firstItemIndex: firstItemIndexRef.current ?? firstItemIndex }
}
