
import Text from '@/components/ui/Text'
import style from './Copyable.module.scss'
import ContextMenuWrapper, { type ContextMenuItem } from '../context/ContextMenuWrapper';

export default function Copyable({ children }: { children: string }) {

    const menuItems: ContextMenuItem[] = [
        {
            key: 'copy',
            label: 'copy',
            action: () => navigator.clipboard.writeText(children),
        },
    ];

    return (
        <ContextMenuWrapper items={menuItems}>
            <button className={style.trigger} type="button"><Text>{children}</Text></button>
        </ContextMenuWrapper>
    );
}
