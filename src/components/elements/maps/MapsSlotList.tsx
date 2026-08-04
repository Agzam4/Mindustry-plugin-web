import Text from '@/components/ui/Text';
import { Link } from 'wouter';

import style from './MapsSlotList.module.scss'
import type { MapSlotInfo } from '@/api/gen/api';
import clsx from 'clsx';

export default function MapsSlotList({ maps, id }: { maps: MapSlotInfo[], id?: string }) {

    return <div className={style.box}>{
        maps.map((m, key) => {
            return <>
                <div key={`${key}m`} className={clsx(style.mapSlot, !m.enabled && style.disabled)}><Link href={'/maps/slot/' + (m.id + 1)}><Text>{m.name}</Text></Link></div >
                <div key={`${key}s`} className={style.status} data-status={m.status}>[{m.status}]</div >
            </>
        })
    }</div >

}
