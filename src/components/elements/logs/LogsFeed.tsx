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
    const virtuosoRef = useRef<VirtuosoHandle>(null)

    const { logs, loading, hasMoreOlder, hasMoreNewer, loadOlder, loadNewer, firstItemIndex, reallyFirstItemIndex, offset, scrollTarget, paginatorId } = useLogs({ initId: selectedId, filters, pageSize })

    console.log("scrollTarget", scrollTarget)
    useEffect(() => {
        if (scrollTarget !== null && virtuosoRef.current) {
            requestAnimationFrame(() => {
                setSelectedRow(selectedId)
                virtuosoRef.current?.scrollToIndex({ index: scrollTarget - offset, align: 'center', behavior: 'smooth' })
            })
        }
    }, [scrollTarget])

    if (reallyFirstItemIndex < 0)
        return <div className={style.feed}>
            <div className={style.sentinel}>
                <span className={style.endMarker}>Loading...</span>
            </div>
        </div>


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
                key={`${JSON.stringify(filters)}-${paginatorId}`}
                style={{ height: '100%' }}

                firstItemIndex={firstItemIndex}
                data={logs}
                initialTopMostItemIndex={reallyFirstItemIndex}

                startReached={loadOlder}
                endReached={loadNewer}

                increaseViewportBy={{ top: 400, bottom: 400 }}

                computeItemKey={(index, item) => index + offset}

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
