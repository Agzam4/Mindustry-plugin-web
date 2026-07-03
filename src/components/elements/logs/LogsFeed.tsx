import { forwardRef } from 'react'
import type { LogEntity } from '@/api/gen/api'
import { LogsFeedItem } from './LogsFeedItem'
import style from './Logs.module.scss'
import { useFeed } from './useFeed'

interface Props {
    entries: LogEntity[]
    selectedId: number | null
    loading: boolean
    hasMore: boolean
    onSelect: (entry: LogEntity) => void
    onLoadMore: () => void
}

export const LogsFeed = forwardRef<HTMLDivElement, Props>(
    function LogsFeed({ entries, selectedId, loading, hasMore, onSelect, onLoadMore }, ref) {

        const triggerRef = useFeed({
            loading,
            hasMore,
            onLoadMore,
            rootMargin: '150px'
        })

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
                        <span className={style.loading}>Загрузка…</span>
                    </div>
                )}

                {hasMore && !loading && <div ref={triggerRef} className={style.sentinel} />}

                {!hasMore && !loading && entries.length > 0 && (
                    <div className={style.sentinel}>
                        <span className={style.endMarker}>— начало логов —</span>
                    </div>
                )}
                {!hasMore && !loading && entries.length === 0 && (
                    <div className={style.sentinel}>
                        <span className={style.endMarker}>Нет записей</span>
                    </div>
                )}
            </div>
        )
    }
)
