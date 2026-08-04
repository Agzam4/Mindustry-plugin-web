import { ApiHooks } from '@/api/gen/api-hooks';
import style from './MapsPage.module.scss'
import MapsSlotList from '@/components/elements/maps/MapsSlotList';
import MapSlot from '@/components/elements/maps/MapSlot';
import Player from '@/components/ui/text/Player';
import clsx from 'clsx';
import Separator from '@/components/ui/base/Separator';
import { Api, type MapSlotInfo, type NetError } from '@/api/gen/api';
import { useEffect, useState } from 'react';
import HttpError from '@/components/ui/text/HttpError';

export default function MapsPage({ type, id }: { type?: string, id?: string }) {
    const [maps, setMaps] = useState<MapSlotInfo[] | null>(null)
    const [mapsError, setError] = useState<NetError | null>(null)
    const [mapsLoading, setLoading] = useState(false)
    useEffect(() => {
        setLoading(true);
        (async () => {
            const [res, err] = await Api.maps.slots()
            if (err) setError(err)
            else setMaps(res)
            setLoading(false)
        })()
    }, [])

    const [creators, cerror, cloading] = ApiHooks.maps.useCreators()

    if (mapsError) return <HttpError error={mapsError} />;

    if (maps || creators) {
        const foundSlot = type === 'slot' && maps && maps.find(m => String(m.id + 1) === id)
        const foundPlayer = type === 'maker' && creators && creators.find(m => String(m.id + 1) === id)
        return (
            <main className={style.panels}>
                <aside className={style.left}>
                    {mapsError && <HttpError error={mapsError} />}
                    <button className={clsx("no-button", style.button)} onClick={() => {
                        (async () => {
                            const name = prompt("Name")
                            if (!name) return
                            const [result, err] = await Api.maps.createSlot({ name })
                            if (err) alert(err.message)
                            if (result) {
                                setMaps(maps => maps ? [...maps, result] : null);
                            }
                        })();
                    }}>New map</button>
                    <Separator>Maps</Separator>
                    {maps && <MapsSlotList maps={maps} id={id} />}
                </aside>
                <main className={style.center}>
                    {
                        foundSlot && <MapSlot slot={foundSlot} onChange={ns => {
                            setMaps(maps => {
                                if (!maps) return maps
                                const ms = [...maps]
                                ms[ns.id] = ns
                                return ms
                            })
                        }} />
                    }
                </main>
                <aside className={style.right}>
                    {
                        creators && <>
                            {creators?.map(c => {
                                return <div key={c.id}>
                                    <Player id={c.id} />
                                </div>
                            })}
                            <button className={clsx("no-button", style.button)}>New creator</button>
                        </>
                    }
                </aside>
            </main >
        )
    }
    return "loading"
}
