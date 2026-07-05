import Text from '@/components/ui/Text'
import style from './GameMap.module.scss'
import ContextMenuWrapper, { type ContextMenuItem } from '../context/ContextMenuWrapper';
import { useLogFilterStore } from '@/components/elements/logs/useFiltersStore';

export default function GameMap({ children }: { children: string }) {
    const applySplashFilter = useLogFilterStore((state) => state.applySplashFilter);

    const menuItems: ContextMenuItem[] = [
        {
            key: "info",
            label: children,
            isSeparator: true
        },
        {
            key: 'copy',
            label: 'copy',
            action: () => navigator.clipboard.writeText(children),
        },
        {
            key: 'use',
            label: 'search',
            action: () => applySplashFilter("map", children, true),
        },
    ];

    return (
        <ContextMenuWrapper items={menuItems}>
            <button className={style.trigger} title={children} type="button">
                <Text>[accent]{children}[]</Text>
            </button>
        </ContextMenuWrapper>
    );
}
