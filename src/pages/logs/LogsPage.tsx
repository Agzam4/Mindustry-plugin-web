import { useCallback, useRef, useState } from 'react'
import type { LogEntity } from '@/api/gen/api'
import { Api } from '@/api/gen/api'
import { LogsFilters } from '@/components/elements/logs/LogsFilters'
import { LogsFeed } from '@/components/elements/logs/LogsFeed'
import { LogsDetails } from '@/components/elements/logs/LogsDetails'
import { useLogs, type Filters } from '@/components/elements/logs/useLogs'
import { LogBuffer, type FetchFn } from '@/components/elements/logs/LogBuffer'
import style from '@/components/elements/logs/Logs.module.scss'
import type { LogFilters } from '@/components/elements/logs/types'

export default function LogsPage() {
    const [selected, setSelected] = useState<LogEntity | null>(null)
    const [uiFilters, setUiFilters] = useState<LogFilters>({ tags: [], query: '', t1: 0 })

    const bufferRef = useRef<LogBuffer>(null!)
    if (!bufferRef.current) {
        const fetchFn: FetchFn = async (fromId, limit) => {
            const [data] = await Api.logs.search({
                id: fromId,
                limit,
                t1: 0, t2: 999999999999999,
                tags: [],
                query: "",
            })
            return data ?? []
        }
        bufferRef.current = new LogBuffer(fetchFn)
    }

    const apiLogs = useRef({
        lastId: async (_filters?: Filters) => {
            return (await Api.logs.lastId()) as [number, any]
        },
    }).current

    const {
        logs, loading,
        hasMoreOlder, hasMoreNewer,
        loadOlder, loadNewer,
        firstItemIndex,
    } = useLogs({
        logBuffer: bufferRef.current,
        apiLogs,
        pageSize: 10,
        filters: {} as Filters,
    })

    const updateFilters = useCallback((partial: Partial<LogFilters>) => {
        setUiFilters(prev => ({ ...prev, ...partial }))
    }, [])

    return (
        <div className={style.panels}>
            <LogsFilters filters={uiFilters} onChange={updateFilters} />
            <LogsFeed
                entries={logs}
                selectedId={selected?.globalId ?? null}
                loading={loading}
                hasMoreOlder={hasMoreOlder}
                hasMoreNewer={hasMoreNewer}
                onSelect={setSelected}
                onLoadOlder={loadOlder}
                onLoadNewer={loadNewer}
                firstItemIndex={firstItemIndex}
            />
            <LogsDetails entry={selected} />
        </div>
    )
}
