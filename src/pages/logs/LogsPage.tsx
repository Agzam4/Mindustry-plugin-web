import { memo, useCallback, useState } from 'react'
import type { LogEntity } from '@/api/gen/api'
import { LogsFilters } from '@/components/elements/logs/LogsFilters'
import { LogsFeed } from '@/components/elements/logs/LogsFeed'
import { LogsDetails } from '@/components/elements/logs/LogsDetails'
import style from '@/components/elements/logs/Logs.module.scss'
import type { LogFilters } from '@/components/elements/logs/types'

const LogsFeedMemo = memo(LogsFeed)

export default function LogsPage() {
    const [selected, setSelected] = useState<LogEntity | null>(null)

    const [filters, setFilters] = useState<LogFilters>({ tags: [] })

    return (
        <div className={style.panels}>
            <LogsFilters filters={filters} onChange={setFilters} />
            <main className={style.centerPanel}>
                <LogsFeedMemo selectedId={selected === null ? null : selected.id} onSelect={setSelected} />
            </main>
            <aside className={style.rightPanel}>
                {filters.tags.length == 0 ? <LogsDetails entry={selected} /> : <LogsFeed filters={filters} />}
            </aside>
        </div>
    )
}
