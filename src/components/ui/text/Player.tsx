import type { ResolvedPlayerInfo } from '@/api/gen/api';
import { playerFetcher } from '@/api/playerFetcher';
import Text from '@/components/ui/Text'
import { useEffect, useState } from 'react';
import style from './Player.module.scss'
import ContextMenuWrapper, { type ContextMenuItem } from '../context/ContextMenuWrapper';
import { useLogFilterStore } from '@/components/elements/logs/useFiltersStore';
import { useModal } from '@ebay/nice-modal-react';
import { PlayerProfile } from '@/components/modals/profile/PlayerProfile';

export default function Player({ id }: { id: number }) {

    const modal = useModal(PlayerProfile);

    const [info, setInfo] = useState<ResolvedPlayerInfo | null>(null);

    const applySplashFilter = useLogFilterStore((state) => state.applySplashFilter);

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
            key: "profile",
            label: `profile`,
            action: () => {
                setTimeout(() => {
                    modal.show({ player: id })
                }, 0)
            },
            isSeparator: true
        },
        {
            key: "search",
            label: `search`,
            action: () => applySplashFilter("player", id, true),
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
            action: () => info?.name && navigator.clipboard.writeText(info.name),
        },
        info?.uuid !== null && {
            key: 'copy-uuid',
            label: 'copy uuid',
            action: () => info?.uuid && navigator.clipboard.writeText(info.uuid),
        }
    ];

    return (
        <ContextMenuWrapper items={menuItems}>
            <button className={style.playerTrigger} title={info?.uuid} type="button">
                <Text>{info?.name ?? "Loading..."}</Text>
            </button>
        </ContextMenuWrapper>
    );
}
