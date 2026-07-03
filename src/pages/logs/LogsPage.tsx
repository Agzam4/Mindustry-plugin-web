import { useCallback, useEffect, useRef, useState } from 'react'
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
        bufferRef.current = new LogBuffer()
    }

    const apiLogs = useRef({
        lastId: async (_filters?: Filters) => {
            return (await Api.logs.lastId()) as [number, any]
        },
    }).current

    const updateFilters = useCallback((partial: Partial<LogFilters>) => {
        setUiFilters(prev => ({ ...prev, ...partial }))
    }, [])

    return (
        <div className={style.panels}>
            <LogsFilters filters={uiFilters} onChange={updateFilters} />
            <LogsFeed selectedId={selected === null ? null : selected.id} onSelect={setSelected} />
            <LogsDetails entry={selected} />
        </div>
    )
}
