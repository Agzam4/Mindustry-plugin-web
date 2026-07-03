import { useEffect, useRef } from 'react'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'
import type { LogEntity } from '@/api/gen/api'
import { LogsFeedItem } from './LogsFeedItem'
import style from './Logs.module.scss'
import { useLogs } from './useLogs'

interface Props {
    selectedId: number | null
    onSelect: (entry: LogEntity) => void
}

export function LogsFeed({ selectedId, onSelect }: Props) {
    const { logs, loading, hasMoreOlder, hasMoreNewer, loadOlder, loadNewer, firstItemIndex } = useLogs({ initId: selectedId, filters: {} })

    const virtuosoRef = useRef<VirtuosoHandle>(null)
    const initialScrolled = useRef(false)

    useEffect(() => {
        if (logs.length > 0 && !initialScrolled.current && !loading) {
            initialScrolled.current = true
            requestAnimationFrame(() => {
                virtuosoRef.current?.scrollToIndex({
                    index: logs.length - 1,
                    align: 'end',
                    behavior: 'auto',
                })
            })
        }
    }, [logs, loading])

    if (logs.length === 0 && !loading) {
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
                data={logs}
                firstItemIndex={firstItemIndex}
                startReached={loadOlder}
                endReached={loadNewer}
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
