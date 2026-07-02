import { forwardRef } from 'react'
import type { LogEntity } from '@/api/gen/api'
import { LogsFeedItem } from './LogsFeedItem'
import style from './Logs.module.scss'

interface Props {
    entries: LogEntity[]
    selectedId: number | null
    loading: boolean
    hasMore: boolean
    onSelect: (entry: LogEntity) => void
    triggerRef: (node: HTMLElement | null) => void
}

export const LogsFeed = forwardRef<HTMLDivElement, Props>(
    function LogsFeed({ entries, selectedId, loading, hasMore, onSelect, triggerRef }, ref) {
        return (
            <div ref={ref} className={style.feed}>
                {entries.map(e => (
                    <LogsFeedItem
                        key={e.globalId}
                        entry={e}
                        selected={e.globalId === selectedId}
                        onClick={onSelect}
                    />
                ))}
                {loading && (
                    <div className={style.sentinel}>
                        <span className={style.loading}>Loading…</span>
                    </div>
                )}
                {hasMore && <div ref={triggerRef} className={style.sentinel} />}
                {!hasMore && !loading && entries.length > 0 && (
                    <div className={style.sentinel}>
                        <span className={style.endMarker}>— beginning —</span>
                    </div>
                )}
                {!hasMore && !loading && entries.length === 0 && (
                    <div className={style.sentinel}>
                        <span className={style.endMarker}>No entries</span>
                    </div>
                )}
            </div>
        )
    }
)
