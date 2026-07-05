import type { AdminCommandLogEvent, ChatMessageLogEvent, GameBeginLogEvent, GameOverLogEvent, KickLogEvent, LogEntity, PlayerCommandLogEvent, PlayerJoinLogEvent, PlayerLeaveLogEvent, ServerStartLogEvent, VotekickLogEvent } from '@/api/gen/api'

export type LogTagPredicate = (e: LogEntity) => boolean
export type LogTagPredicateMap = Map<string, LogTagPredicate>
export type LogTagFilters = Map<number, LogTagPredicateMap>

export interface LogFilters {
    tags: number[] // list of allwed tags, empty to all
    tagFilters: LogTagFilters
    applyedTagFilters: Record<string, any>
}


export function logsFilterKey(f: LogFilters) {
    return `${f.tags.join(',')}-${JSON.stringify(f.applyedTagFilters)}`
}


export interface TagTypeMap {
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

export const TAG_NAMES: Record<number, string> = {
    0: 'server-start',
    1: 'chat-message',
    2: 'player-command',
    3: 'admin-command',
    4: 'kick',
    5: 'votekick',
    6: 'player-leave',
    7: 'player-join',
    8: 'game-over',
    9: 'game-begin',
}

export const TAG_LABELS: Record<number, string> = {
    0: 'Server Start',
    1: 'Chat Message',
    2: 'Player Command',
    3: 'Admin Command',
    4: 'Kick',
    5: 'Votekick',
    6: 'Player Leave',
    7: 'Player Join',
    8: 'Game Over',
    9: 'Game Begin',
}

export function parseMessage(tag: number, message: string): Record<string, unknown> {
    try {
        return JSON.parse(message)
    } catch {
        return { raw: message }
    }
}

export function formatUuid(uuid: string): string {
    if (uuid.length > 8) return uuid.slice(0, 8) + '…'
    return uuid
}

export type { LogEntity }
