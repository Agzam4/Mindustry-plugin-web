import { memo } from 'react'
import type { AdminCommandLogEvent, ChatMessageLogEvent, GameBeginLogEvent, GameOverLogEvent, KickLogEvent, LogEntity, PlayerCommandLogEvent, PlayerJoinLogEvent, PlayerLeaveLogEvent, ServerStartLogEvent, VotekickLogEvent } from '@/api/gen/api'
import { TAG_NAMES, formatUuid } from './types'
import style from './Logs.module.scss'
import Text from '@/components/ui/Text'
import Player from '@/components/ui/players/Player'

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

interface TagPayloadMap {
    0: ServerStartLogEvent
    1: ChatMessageLogEvent
    2: PlayerCommandLogEvent
    3: AdminCommandLogEvent
    4: KickLogEvent
    5: VotekickLogEvent
    6: PlayerLeaveLogEvent
    7: PlayerJoinLogEvent
    8: GameOverLogEvent
    9: GameBeginLogEvent
}

type RendersMap = {
    [K in keyof TagPayloadMap]: (e: TagPayloadMap[K]) => any;
};

const renders: RendersMap = {
    0: _e => <>Server started</>,
    1: e => <><Player id={e.player} /><Text>[gray]:[] {e.message}</Text></>,
    2: e => <><Player id={e.player} /><Text>: /{e.command}</Text></>,
    3: e => <><Player id={e.player} /><Text>[gray]:[] /{e.command}</Text></>,
    4: e => <><Player id={e.actor} /><Text> kicked </Text><Player id={e.target} /><Text>: [accent]{e.reason}[] on [accent]{(e.seconds / 60) + ''}[] minutes</Text></>,
    5: e => <><Player id={e.actor} /><Text> votekicked </Text><Player id={e.target} /><Text>: [accent]{e.reason}[]</Text></>,
    6: e => <><Player id={e.player} /><Text> left [gray]({e.players + ""} players)</Text></>,
    7: e => <><Player id={e.player} /><Text> joined [gray]({e.players + ""} players)</Text></>,
    8: e => <Text>Game over: [accent]{e.map}[] wave [accent]{e.wave}</Text>,
    9: e => <Text>Game begin: [accent]{e.map}</Text>,
}

function renderLog(log: LogEntity) {
    if (!(log.tag in renders)) {
        return `Unknown tag: ${log.tag}`;
    }
    const tag = log.tag as keyof TagPayloadMap;
    const payload = JSON.parse(log.message) as TagPayloadMap[typeof tag];
    const renderFn = renders[tag] as (data: typeof payload) => any;
    return renderFn(payload);
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
            <span title={new Date(entry.timestamp).toLocaleString()} className={style.itemTime}>{formatTime(entry.timestamp)}</span>
            <span className={style.itemDot} />
            <span className={style.itemSummary}>{renderLog(entry)}</span>
            <span className={style.itemTime}>#{entry.globalId}</span>
        </div>
    )
})
