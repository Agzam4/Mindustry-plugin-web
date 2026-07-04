import type { ResolvedPlayerInfo } from '@/api/gen/api';
import { playerFetcher } from '@/api/playerFetcher';
import Text from '@/components/ui/Text'
import { useEffect, useState } from 'react';
import style from './Player.module.scss'

export default function Player({ id }: { id: number }) {
    const [info, setInfo] = useState<ResolvedPlayerInfo | null>(null);

    useEffect(() => {
        let isMounted = true;

        playerFetcher.getPlayerInfo(id).then((fetchedName) => {
            console.log("Resolved: ", fetchedName)
            if (isMounted) {
                setInfo(fetchedName);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [id]);

    return <span className={style.player} title={info?.uuid}><Text>{info?.name ?? ""}</Text></span>;
}
