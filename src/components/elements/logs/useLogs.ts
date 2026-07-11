import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Api } from '@/api/gen/api'
import { LogPaginator } from './LogPaginator'
import { logsFilterKey, type LogFilters } from './types'

interface Props {
    initId: number | null
    pageSize?: number
    filters: LogFilters
}

export function useLogs({ initId, pageSize = 25, filters }: Props) {
    const stringifiedFilters = logsFilterKey(filters)

    const paginatorRef = useRef<LogPaginator | null>(null)
    if (!paginatorRef.current) {
        paginatorRef.current = new LogPaginator(filters, pageSize)
    }

    const paginator = paginatorRef.current
    const [, forceUpdate] = useState({})
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        console.log(stringifiedFilters, initId, pageSize)

        const newPaginator = new LogPaginator(filters, pageSize)
        paginatorRef.current = newPaginator

        let cancelled = false

        startTransition(async () => {
            await newPaginator.initialize(initId, async () => {
                const [lastId] = await Api.logs.lastId()
                return lastId
            })

            if (!cancelled) {
                forceUpdate({})
            }
        })

        return () => { cancelled = true }
    }, [stringifiedFilters, initId, pageSize])

    const loadOlder = useCallback(() => {
        const currentPaginator = paginatorRef.current
        if (!currentPaginator || isPending || !currentPaginator.hasMoreOlder) return

        startTransition(async () => {
            const hasChanged = await currentPaginator.loadOlder()
            if (hasChanged) forceUpdate({})
        })
    }, [isPending])

    const loadNewer = useCallback(() => {
        const currentPaginator = paginatorRef.current
        if (!currentPaginator || isPending || !currentPaginator.hasMoreNewer) return

        startTransition(async () => {
            const hasChanged = await currentPaginator.loadNewer()
            if (hasChanged) forceUpdate({})
        })
    }, [isPending])

    const firstItemIndex = paginator.firstItemIndex ?? (paginator.logs[0]?.globalId ?? 0)
    const reallyFirstItemIndex = paginator.reallyFirstItemIndex ?? (paginator.logs[0]?.globalId ?? 0)
    console.log(firstItemIndex)

    return {
        logs: paginator.logs,
        loading: isPending,
        hasMoreOlder: paginator.hasMoreOlder,
        hasMoreNewer: paginator.hasMoreNewer,
        loadOlder,
        loadNewer,
        firstItemIndex,
        reallyFirstItemIndex
    }
}
