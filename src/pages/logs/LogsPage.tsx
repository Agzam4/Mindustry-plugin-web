import { memo, useCallback, useState } from 'react'
import type { LogEntity } from '@/api/gen/api'
import { LogsFilters } from '@/components/elements/logs/LogsFilters'
import { LogsFeed } from '@/components/elements/logs/LogsFeed'
import { LogsDetails } from '@/components/elements/logs/LogsDetails'
import style from '@/components/elements/logs/Logs.module.scss'
import { useLogFilterStore } from '@/components/elements/logs/useFiltersStore'
import { useSearchParams } from 'wouter'

const LogsFeedMemo = memo(LogsFeed)

export default function LogsPage() {

    const [searchParams, setSearchParams] = useSearchParams();
    const [selected, setSelected] = useState<LogEntity | null>(null)
    const filters = useLogFilterStore((state) => state.filters);

    const page = searchParams.get("selected") || "1";

    return (
        <div className={style.panels}>
            <LogsFilters />
            <main className={style.centerPanel}>
                <LogsFeedMemo selectedId={selected === null ? null : selected.id} onSelect={setSelected} pageSize={50} />
            </main>
            <aside className={style.rightPanel}>
                {filters.tags.length == 0 && filters.tagFilters.size == 0 ? <LogsDetails entry={selected} /> : <LogsFeed filters={filters} />}
            </aside>
        </div>
    )
}
