import type { LogEntity } from '@/api/gen/api'
import { LogsFeedItem } from './LogsFeedItem'
import { Icons } from '@/components/ui/icons'
import style from './Logs.module.scss'

interface Props {
    entries: LogEntity[]
    loading: boolean
    onGoToLog: (entry: LogEntity) => void
}

export function SearchResults({ entries, loading, onGoToLog }: Props) {
    if (loading && entries.length === 0) {
        return (
            <div className={style.searchPanel}>
                <div className={style.searchTitle}>Search results</div>
                <div className={style.searchEmpty}>Searching…</div>
            </div>
        )
    }

    if (!loading && entries.length === 0) {
        return (
            <div className={style.searchPanel}>
                <div className={style.searchTitle}>Search results</div>
                <div className={style.searchEmpty}>No matches</div>
            </div>
        )
    }

    return (
        <div className={style.searchPanel}>
            <div className={style.searchTitle}>Search results</div>
            <div className={style.searchList}>
                {entries.map(e => {
                    const GoTo = Icons.goto
                    return (
                        <div key={e.globalId} className={style.searchItem}>
                            <LogsFeedItem entry={e} selected={false} onClick={() => { }} />
                            <button className={style.searchGoBtn} onClick={() => onGoToLog(e)} aria-label="Go to log">
                                <GoTo width={14} height={14} />
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
