import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Api } from '@/api/gen/api'
import { LogPaginator } from './LogPaginator'
import { logsFilterKey, type LogFilters } from './types'

interface Props {
    initId: number | null
    pageSize?: number
    filters: LogFilters
}

export function useLogs({ initId, pageSize = 5, filters }: Props) {
    const stringifiedFilters = logsFilterKey(filters)

    const paginatorRef = useRef<LogPaginator | null>(null)

    const paginator = paginatorRef.current
    const [, forceUpdate] = useState({})
    const [isPending, startTransition] = useTransition()

    console.log(stringifiedFilters, initId, pageSize)

    useEffect(() => {
        console.log(stringifiedFilters, initId, pageSize)
        console.log("=== useEffect ===")
        console.log(filters)

        if (paginator !== null && initId !== null) {
            if (paginator.loadNear(initId, loadNewer, loadOlder)) {
                console.log("- Target is near")

                return
            }
        }


        const newPaginator = new LogPaginator(filters, pageSize)
        console.log("- New paginator:", newPaginator.id)
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
        console.log("call - ")
        const currentPaginator = paginatorRef.current
        if (!currentPaginator || isPending || !currentPaginator.canDecrease) return

        startTransition(async () => {
            const hasChanged = await currentPaginator.loadMin()
            if (hasChanged) forceUpdate({})
        })
    }, [isPending])

    const loadNewer = useCallback(() => {
        console.log("call + ")
        const currentPaginator = paginatorRef.current
        if (!currentPaginator || isPending || !currentPaginator.canIncrease) return

        startTransition(async () => {
            const hasChanged = await currentPaginator.loadMax()
            if (hasChanged) forceUpdate({})
        })
    }, [isPending])

    const firstItemIndex = paginator === null ? 0 : ((paginator.firstItemIndex ?? (paginator.logs[0]?.globalId ?? 0)) - 1)
    const reallyFirstItemIndex = paginator === null ? 0 : ((paginator.reallyFirstItemIndex ?? (paginator.logs[0]?.globalId ?? 0)) - 1)

    return {
        logs: paginator === null ? [] : paginator.logs,
        loading: isPending,
        hasMoreOlder: paginator === null ? false : paginator.canDecrease,
        hasMoreNewer: paginator === null ? false : paginator.canIncrease,
        loadOlder,
        loadNewer,
        firstItemIndex: firstItemIndex,
        reallyFirstItemIndex: reallyFirstItemIndex
    }
}
