import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'
import type { LogEntity } from '@/api/gen/api'
import { LogsFeedItem } from './LogsFeedItem'
import style from './Logs.module.scss'
import { useLogs } from './useLogs'
import { logsFilterKey, type LogFilters } from './types'
import Text from '@/components/ui/Text'

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


    useEffect(() => {
        if (scrollTarget !== null && virtuosoRef.current) {
            requestAnimationFrame(() => {
                setSelectedRow(selectedId)
                virtuosoRef.current?.scrollToIndex({ index: scrollTarget - offset, align: 'center', behavior: 'smooth' })
            })
        }
    }, [scrollTarget, offset])

    useEffect(() => {
        const index = reallyFirstItemIndex - firstItemIndex
        const isLoaded = index <= logs.length
        if (virtuosoRef.current && logs.length > 0 && isLoaded && scrollTarget === null) {
            requestAnimationFrame(() => {
                if (virtuosoRef.current) {
                    virtuosoRef.current.scrollToIndex({
                        index: reallyFirstItemIndex - offset,
                        align: 'center',
                        behavior: 'auto'
                    });
                    setSelectedRow(reallyFirstItemIndex)
                }
            });
        }
    }, [logs.length, reallyFirstItemIndex, firstItemIndex]);


    if (reallyFirstItemIndex < 0)
        return <div className={style.feed}>
            <div className={style.sentinel}>
                <span className={style.endMarker}>Loading...</span>
            </div>
        </div>


    if (logs.length === 0) {
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
            {/* <Text>Target: [accent]{reallyFirstItemIndex}[] First: [accent]{firstItemIndex}[] offset: [accent]{offset}[] Logs: [accent]{logs.length}[] ({firstItemIndex};{firstItemIndex + logs.length})</Text> */}
            <Virtuoso
                ref={virtuosoRef}
                style={{ height: '100%' }}

                data={logs}
                firstItemIndex={firstItemIndex}

                startReached={loadOlder}
                endReached={loadNewer}


                initialScrollTop={reallyFirstItemIndex}

                increaseViewportBy={{ top: 400, bottom: 400 }}

                computeItemKey={(index, _item) => index}

                itemContent={(index, entry) => (
                    // <div>
                    // <Text>=== Index: [accent]{index}[] ===</Text>
                    <LogsFeedItem
                        entry={entry}
                        selected={entry.globalId === selectedRow}
                        onClick={e => {
                            setSelectedRow(e.globalId)
                            onSelect(e)
                        }}
                    />
                    //                    {/* </div> */}
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
