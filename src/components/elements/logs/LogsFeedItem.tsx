import { memo } from 'react'
import type { LogEntity } from '@/api/gen/api'
import { TAG_NAMES, formatUuid } from './types'
import style from './Logs.module.scss'
import Text from '@/components/ui/Text'

interface Props {
    entry: LogEntity
    selected: boolean
    onClick: (entry: LogEntity) => void
}

function formatTime(ts: number): string {
    const d = new Date(ts)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
}

function renderSummary(entry: LogEntity): string {
    const data = tryParse(entry.message)
    switch (entry.tag) {
        case 0: return 'Server started'
        case 1: return `${formatUuid(String(data.player ?? ''))}: ${String(data.message ?? '')}`
        case 2: return `${formatUuid(String(data.player ?? ''))} /${String(data.command ?? '')}`
        case 3: return `${formatUuid(String(data.player ?? ''))} /${String(data.command ?? '')}`
        case 4: return `${formatUuid(String(data.actor ?? ''))} kicked ${formatUuid(String(data.target ?? ''))}`
        case 5: return `${formatUuid(String(data.actor ?? ''))} votekicked ${formatUuid(String(data.target ?? ''))}`
        case 6: return `${formatUuid(String(data.player ?? ''))} left [gray](${String(data.players ?? '?')} players)`
        case 7: return `${formatUuid(String(data.player ?? ''))} joined [gray](${String(data.players ?? '?')} players)`
        case 8: return `Game over: [accent]${String(data.map ?? '?')}[] wave [accent]${String(data.wave ?? '?')}[]`
        case 9: return `Game begin: [accent]${String(data.map ?? '?')}`
        default: return entry.message
    }
}

function tryParse(message: string): Record<string, unknown> {
    try { return JSON.parse(message) } catch { return { raw: message } }
}

export const LogsFeedItem = memo(function LogsFeedItem({ entry, selected, onClick }: Props) {
    const tagName = TAG_NAMES[entry.tag] ?? 'unknown'
    return (
        <div
            className={`${style.item} ${selected ? style.itemSelected : ''} ${style['tag_' + tagName] ?? ''}`}
            data-global-id={entry.globalId}
            onClick={() => onClick(entry)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') onClick(entry) }}
        >
            <span className={style.itemTime}>{formatTime(entry.timestamp)}</span>
            <span className={style.itemDot} />
            <span className={style.itemSummary}><Text>{renderSummary(entry)}</Text></span>
            <span className={style.itemTime}>#{entry.globalId}</span>
        </div>
    )
})
