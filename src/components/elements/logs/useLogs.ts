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

export function useLogs({ logBuffer, apiLogs, pageSize = 50, filters }: Props) {
    const [logs, setLogs] = useState<LogEntity[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [hasMore, setHasMore] = useState<boolean>(true)

    const nextIdRef = useRef<number | null>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)

    const loadMore = useCallback(async () => {
        if (loading || !hasMore || nextIdRef.current === null) return
        if (nextIdRef.current <= 0) {
            setHasMore(false)
            return
        }

        setLoading(true)
        try {
            const currentId = nextIdRef.current
            const newEntries = await logBuffer.get(currentId, pageSize)

            if (newEntries.length === 0) {
                setHasMore(false)
                return
            }

            setLogs((prev) => [...prev, ...newEntries])
            nextIdRef.current = currentId - pageSize

            if (nextIdRef.current <= 0) {
                setHasMore(false)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [logBuffer, loading, hasMore, pageSize])

    useEffect(() => {
        let isMounted = true

        async function initFirstLoad() {
            setLoading(true)
            setHasMore(true)

            try {
                const [lid, err] = await apiLogs.lastId(filters)
                if (err) throw err
                console.log("Latest", lid)

                if (isMounted) {
                    if (lid <= 0) {
                        setLogs([])
                        setHasMore(false)
                        return
                    }

                    nextIdRef.current = lid
                    const firstEntries = await logBuffer.get(lid, pageSize)

                    setLogs(firstEntries)
                    nextIdRef.current = lid - pageSize

                    if (nextIdRef.current <= 0 || firstEntries.length === 0) {
                        setHasMore(false)
                    }
                }
            } catch (error) {
                console.error(error)
                if (isMounted) {
                    setLogs([])
                    setHasMore(false)
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        initFirstLoad()

        return () => {
            isMounted = false
            if (observerRef.current) observerRef.current.disconnect()
        }
    }, [logBuffer, apiLogs, pageSize, JSON.stringify(filters)])

    const triggerRef = useCallback((node: HTMLElement | null) => {
        if (loading) return
        if (observerRef.current) observerRef.current.disconnect()

        observerRef.current = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry && entry.isIntersecting && hasMore) {
                loadMore()
            }
        }, { rootMargin: '100px' })

        if (node) observerRef.current.observe(node)
    }, [loading, hasMore, loadMore])

    return { logs, loading, hasMore, triggerRef }
}
