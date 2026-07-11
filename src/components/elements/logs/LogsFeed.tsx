import { useEffect, useRef, useState } from 'react'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'
import type { LogEntity } from '@/api/gen/api'
import { LogsFeedItem } from './LogsFeedItem'
import style from './Logs.module.scss'
import { useLogs } from './useLogs'
import { logsFilterKey, type LogFilters } from './types'

interface Props {
    selectedId?: number | null
    filters?: LogFilters
    pageSize?: number
    onSelect?: (entry: LogEntity) => void
}

export function LogsFeed({ selectedId = null, onSelect = () => { }, filters = { tags: [], tagFilters: new Map(), applyedTagFilters: {} }, pageSize }: Props) {
    const [selectedRow, setSelectedRow] = useState<number | null>(null)

    const { logs, loading, hasMoreOlder, hasMoreNewer, loadOlder, loadNewer, firstItemIndex, reallyFirstItemIndex } = useLogs({ initId: selectedId, filters, pageSize })

    const virtuosoRef = useRef<VirtuosoHandle>(null)
    const initialScrolled = useRef(false)

    useEffect(() => {
        initialScrolled.current = false
    }, [logsFilterKey(filters)])

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

    console.log(firstItemIndex, reallyFirstItemIndex)
    return (
        <div className={style.feed}>
            <Virtuoso
                key={JSON.stringify(filters)}
                ref={virtuosoRef}
                style={{ height: '100%' }}

                firstItemIndex={firstItemIndex}
                data={logs}
                initialTopMostItemIndex={reallyFirstItemIndex}
                // initialTopMostItemIndex={100000}

                startReached={loadOlder}
                endReached={loadNewer}
                increaseViewportBy={{ top: 400, bottom: 400 }}
                //               computeItemKey={(index, item) => item.globalId}
                itemContent={(index, entry) => (
                    <LogsFeedItem
                        entry={entry}
                        selected={entry.globalId === selectedRow}
                        onClick={e => {
                            setSelectedRow(e.globalId)
                            onSelect(e)
                        }}
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
