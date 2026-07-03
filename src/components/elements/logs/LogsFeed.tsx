import { useEffect, useRef } from 'react'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'
import type { LogEntity } from '@/api/gen/api'
import { LogsFeedItem } from './LogsFeedItem'
import style from './Logs.module.scss'

interface Props {
    entries: LogEntity[]
    selectedId: number | null
    loading: boolean
    hasMoreOlder: boolean
    hasMoreNewer: boolean
    onSelect: (entry: LogEntity) => void
    onLoadOlder: () => void
    onLoadNewer: () => void
    firstItemIndex: number
}

export function LogsFeed({
    entries, selectedId, loading,
    hasMoreOlder, hasMoreNewer,
    onSelect, onLoadOlder, onLoadNewer,
    firstItemIndex,
}: Props) {
    const virtuosoRef = useRef<VirtuosoHandle>(null)
    const initialScrolled = useRef(false)

    useEffect(() => {
        if (entries.length > 0 && !initialScrolled.current && !loading) {
            initialScrolled.current = true
            requestAnimationFrame(() => {
                virtuosoRef.current?.scrollToIndex({
                    index: entries.length - 1,
                    align: 'end',
                    behavior: 'auto',
                })
            })
        }
    }, [entries, loading])

    if (entries.length === 0 && !loading) {
        return (
            <div className={style.feed}>
                <div className={style.sentinel}>
                    <span className={style.endMarker}>===</span>
                </div>
            </div>
        )
    }

    return (
        <div className={style.feed}>
            <Virtuoso
                ref={virtuosoRef}
                style={{ height: '100%' }}
                data={entries}
                firstItemIndex={firstItemIndex}
                startReached={onLoadOlder}
                endReached={onLoadNewer}
                increaseViewportBy={{ top: 400, bottom: 400 }}
                itemContent={(index, entry) => (
                    <LogsFeedItem
                        entry={entry}
                        selected={entry.globalId === selectedId}
                        onClick={onSelect}
                    />
                )}
                components={{
                    Header: () => loading && hasMoreOlder ? (
                        <div className={style.sentinel}>
                            <span className={style.loading}>Loading…</span>
                        </div>
                    ) : null,
                    Footer: () => loading && hasMoreNewer ? (
                        <div className={style.sentinel}>
                            <span className={style.loading}>Loading…</span>
                        </div>
                    ) : null,
                }}
            />
        </div>
    )
}
