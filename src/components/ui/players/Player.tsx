import type { ResolvedPlayerInfo } from '@/api/gen/api';
import { playerFetcher } from '@/api/playerFetcher';
import Text from '@/components/ui/Text'
import { useEffect, useState } from 'react';
import style from './Player.module.scss'
import ContextMenuWrapper, { type ContextMenuItem } from '../context/ContextMenuWrapper';

export default function Player({ id }: { id: number }) {
    const [info, setInfo] = useState<ResolvedPlayerInfo | null>(null);

    useEffect(() => {
        let isMounted = true;
        playerFetcher.getPlayerInfo(id).then((fetchedName) => {
            if (isMounted) {
                setInfo(fetchedName);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [id]);

    const menuItems: ContextMenuItem[] = [
        {
            key: "info",
            label: `${info?.name ?? ""} [accent]${info?.uuid ?? ""}`,
            isSeparator: true
        },
        {
            key: 'copy-id',
            label: 'copy id',
            action: () => navigator.clipboard.writeText(id + ''),
        },
        info?.name !== null && {
            key: 'copy-name',
            label: 'copy name',
            action: () => info?.uuid && navigator.clipboard.writeText(info.uuid),
        },
        info?.uuid !== null && {
            key: 'copy-uuid',
            label: 'copy uuid',
            action: () => console.log('Открытие статистики для', id),
        }
    ];

    return (
        <ContextMenuWrapper items={menuItems}>
            <button className={style.playerTrigger} title={info?.uuid} type="button">
                <Text>{info?.name ?? "Загрузка..."}</Text>
            </button>
        </ContextMenuWrapper>
    );
}
