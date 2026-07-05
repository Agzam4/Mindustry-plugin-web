import type { LogEntity } from '@/api/gen/api'
import { TAG_LABELS, formatUuid, parseMessage } from './types'
import Text from '@/components/ui/Text'
import style from './Logs.module.scss'

interface Props {
    entry: LogEntity | null
}

function formatTimestamp(ts: number): string {
    const d = new Date(ts)
    return d.toLocaleString()
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className={style.detailRow}>
            <span className={style.detailLabel}>{label}</span>
            <span className={style.detailValue}><Text>{value}</Text></span>
        </div>
    )
}

export function LogsDetails({ entry }: Props) {
    if (!entry) {
        return (
            <div className={style.details}>
                <div className={style.detailsEmpty}>Select an entry</div>
            </div>
        )
    }

    const data = parseMessage(entry.tag, entry.message)
    const tagLabel = TAG_LABELS[entry.tag] ?? `Unknown (${entry.tag})`
    const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s)

    return (
        <div className={style.details}>
            <div className={style.detailTitle}>{tagLabel}</div>

            <DetailRow label="globalId" value={String(entry.globalId)} />
            <DetailRow label="ID" value={String(entry.id)} />
            <DetailRow label="Timestamp" value={formatTimestamp(entry.timestamp)} />
            <DetailRow label="Tag" value={`${entry.tag} - ${tagLabel}`} />

            <div className={style.detailSection}>Data</div>
            {Object.entries(data).map(([key, val]) => (
                <DetailRow
                    key={key}
                    label={key}
                    value={typeof val === 'string' && isUuid(val) ? `${val} (${formatUuid(val)})` : String(val)}
                />
            ))}
        </div>
    )
}
