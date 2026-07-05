import * as ContextMenu from '@radix-ui/react-context-menu';
import style from './ContextMenuWrapper.module.scss';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import Text from '@/components/ui/Text'


export type ContextMenuItem = ContextMenuItemOption | false | null | undefined
export interface ContextMenuItemOption {
    key?: string;
    label: ReactNode;
    action?: () => void;
    isSeparator?: boolean;
}

interface ContextMenuWrapperProps {
    children: ReactNode;
    items: ContextMenuItem[];
}

export default function ContextMenuWrapper({ children, items }: ContextMenuWrapperProps) {
    const isValidOption = (item: ContextMenuItemOption | false | null | undefined): item is ContextMenuItemOption => {
        return Boolean(item);
    };
    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
            <ContextMenu.Portal>
                <ContextMenu.Content className={style.contextContent} alignOffset={5}>
                    {items.map((item, index) => (
                        isValidOption(item) &&
                        <div key={item.key ?? index} >
                            <ContextMenu.Item className={clsx(style.contextItem, item.action && style.clickable)} onSelect={item.action}>
                                <Text>{item.label}</Text>
                            </ContextMenu.Item>
                            {item.isSeparator && <ContextMenu.Separator className={style.contextSeparator} />}
                        </div>
                    ))}
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu.Root >
    );
}
