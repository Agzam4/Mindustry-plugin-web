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

    useEffect(() => {

        console.log("=== useEffect ===")
        if (paginator !== null && initId !== null) {
            if (paginator.loadNear(initId, loadNewer, loadOlder)) {
                return
            }
        }


        const newPaginator = new LogPaginator(filters, pageSize)
        paginatorRef.current = newPaginator

        const controller = new AbortController();
        const { signal } = controller;

        startTransition(async () => {
            if (initId === null) {
                const [lastId, error] = await Api.logs.lastId(signal)
                if (error) {

                    return
                }
                initId = lastId
            }
            await newPaginator.initialize(initId, signal)
            if (signal.aborted) return;
            forceUpdate({})
        })

        return () => { controller.abort() }
    }, [stringifiedFilters, initId, pageSize])

    const loadOlder = useCallback(() => {
        console.log("Load older")
        const currentPaginator = paginatorRef.current
        if (!currentPaginator?.canDecrease) return

        startTransition(async () => {
            const hasChanged = await currentPaginator.loadMin()
            if (hasChanged) forceUpdate({})
        })
    }, [])

    const loadNewer = useCallback(() => {
        console.log("Load newer")
        const currentPaginator = paginatorRef.current
        if (!currentPaginator?.canIncrease) return

        startTransition(async () => {
            const hasChanged = await currentPaginator.loadMax()
            if (hasChanged) forceUpdate({})
        })
    }, [])

    let firstItemIndex = 0;
    let reallyFirstItemIndex = 0;
    let offset = 0

    if (paginator !== null) {
        firstItemIndex = paginator.firstItemIndex ?? 0
        reallyFirstItemIndex = (paginator.initFromIndex ?? 0) - firstItemIndex
        offset = paginator.offset()
        console.log(paginator)
    }

    return {
        logs: paginator === null ? [] : paginator.logs,
        loading: isPending,
        hasMoreOlder: paginator === null ? false : paginator.canDecrease,
        hasMoreNewer: paginator === null ? false : paginator.canIncrease,
        loadOlder,
        loadNewer,
        firstItemIndex: firstItemIndex,
        reallyFirstItemIndex: reallyFirstItemIndex,
        offset: offset
    }
}
