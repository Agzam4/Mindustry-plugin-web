import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { LogEntity } from '@/api/gen/api'
import { LogBuffer } from './LogBuffer'

export interface Filters {
    // TODO: add filters
}

interface ApiLogs {
    lastId: (filters?: Filters) => Promise<[number | null, any]>
}

interface Props {
    logBuffer: LogBuffer
    apiLogs: ApiLogs
    pageSize?: number
    filters: Filters
}

const INITIAL_PAGES = 5

export function useLogs({ logBuffer, apiLogs, pageSize = 10, filters }: Props) {
    const [logs, setLogs] = useState<LogEntity[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [hasMoreOlder, setHasMoreOlder] = useState<boolean>(true)
    const [hasMoreNewer, setHasMoreNewer] = useState<boolean>(false)

    const nextOlderIdRef = useRef<number | null>(null)
    const nextNewerIdRef = useRef<number | null>(null)
    const loadingRef = useRef(false)
    const logsRef = useRef<LogEntity[]>(logs)
    logsRef.current = logs

    const stringifiedFilters = JSON.stringify(filters)

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
            const entries = await (direction === 'past' ? logBuffer.past(startId.current, pageSize) : logBuffer.future(startId.current, pageSize))
            if (direction === 'future')
                console.log(direction, entries)
            startId.current = direction === 'past' ? entries[0].globalId - 1 : entries[entries.length - 1].globalId + 1
            if (direction === 'future')
                console.log("New id:", startId.current)
            return entries
        } catch (error) {
            console.error("Fetch error:", error)
            return []
        } finally {
            setLoading(false)
            loadingRef.current = false
        }
    }, [logBuffer, pageSize])


    // const fetchChunk = useCallback(async (
    //     startId: RefObject<number | null>,
    //     direction: "past" | "future"
    // ): Promise<LogEntity[]> => {
    //     if (startId.current == null) return []
    //
    //     setLoading(true)
    //     loadingRef.current = true
    //     try {
    //         const entries = await (direction === 'past' ? logBuffer.past(startId.current, pageSize) : logBuffer.future(startId.current, pageSize))
    //         startId.current = direction === 'past' ? entries[0].globalId : entries[entries.length - 1].globalId
    //         return entries
    //     } catch (error) {
    //         console.error("Fetch error:", error)
    //         return []
    //     } finally {
    //         setLoading(false)
    //         loadingRef.current = false
    //     }
    // }, [logBuffer, pageSize])

    useEffect(() => {
        let cancelled = false

        setLoading(true)
        setHasMoreOlder(true)
        setHasMoreNewer(false)
        nextOlderIdRef.current = null
        nextNewerIdRef.current = null

            ; (async () => {
                const [lid] = await apiLogs.lastId(filters)
                if (cancelled) return
                if (lid == null || lid <= 0) {
                    setHasMoreOlder(false)
                    setLogs([])
                    setLoading(false)
                    return
                }

                const startFrom = Math.floor(lid - 23)

                const entries = await logBuffer.past(startFrom, pageSize)
                if (cancelled) return
                if (entries.length === 0) {
                    setHasMoreOlder(false)
                    setLogs([])
                    setLoading(false)
                    return
                }

                let sorted = [...entries].sort((a, b) => a.globalId - b.globalId)

                while (sorted.length < pageSize * INITIAL_PAGES) {
                    const oldestId = sorted[0].globalId
                    if (oldestId <= 1) { setHasMoreOlder(false); break }
                    const next = await logBuffer.past(oldestId - 1, pageSize)
                    if (cancelled) return
                    if (next.length === 0) { setHasMoreOlder(false); break }
                    const newItems = next
                        .filter(e => e.globalId < oldestId)
                        .sort((a, b) => a.globalId - b.globalId)
                    if (newItems.length === 0) { setHasMoreOlder(false); break }
                    sorted = [...newItems, ...sorted]
                }

                setLogs(sorted)

                const oldest = sorted[0].globalId
                const newest = sorted[sorted.length - 1].globalId

                nextOlderIdRef.current = Math.max(0, oldest - 1)
                nextNewerIdRef.current = newest + 1
                setHasMoreOlder(oldest > 0)
                setHasMoreNewer(true)
                setLoading(false)
            })()

        return () => { cancelled = true }
    }, [stringifiedFilters])

    const loadOlder = useCallback(async () => {
        if (loadingRef.current || !hasMoreOlder) return

        const entries = await fetchChunk(nextOlderIdRef, 'past')
        if (entries.length === 0) {
            setHasMoreOlder(false)
            return
        }
        setLogs(prev => [...entries, ...prev])
        if (entries.length < pageSize || entries[0].globalId <= 0) {
            setHasMoreOlder(false)
            console.log("START")
            return
        }
    }, [fetchChunk, hasMoreOlder])

    const loadNewer = useCallback(async () => {
        console.log("GET future")
        if (loadingRef.current || !hasMoreNewer) return

        // const id = nextNewerIdRef.current
        // if (id == null) {
        //     setHasMoreNewer(false)
        //     return
        // }

        const entries = await fetchChunk(nextNewerIdRef, 'future')
        if (entries.length === 0) {
            setHasMoreNewer(false)
            return
        }

        setLogs(prev => [...prev, ...entries])
        if (entries.length < pageSize || entries[0].globalId <= 0) {
            setHasMoreNewer(false)
            console.log("END")
            return
        }
        // const currentLogs = logsRef.current
        // const newestKnown = currentLogs.length > 0
        //     ? currentLogs[currentLogs.length - 1].globalId
        //     : -1
        //
        // const newItems = entries
        //     .filter(e => e.globalId > newestKnown)
        //     .sort((a, b) => a.globalId - b.globalId)
        //
        // if (newItems.length === 0) {
        //     setHasMoreNewer(false)
        //     return
        // }

        // setLogs(prev => [...prev, ...newItems])
        // nextNewerIdRef.current = newItems[newItems.length - 1].globalId + 1
        // setHasMoreNewer(true)
    }, [fetchChunk, hasMoreNewer])

    const firstItemIndex = logs.length > 0 ? logs[0].globalId : 0

    return { logs, loading, hasMoreOlder, hasMoreNewer, loadOlder, loadNewer, firstItemIndex }
}
