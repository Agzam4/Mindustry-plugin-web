import React, { type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import style from './BaseDialog.module.scss'
import type { NiceModalHandler } from '@ebay/nice-modal-react';

interface BaseDialogProps {

    title: string,
    description: string,

    modal: NiceModalHandler,

    children: ReactNode

}

export const BaseDialog: React.FC<BaseDialogProps> = (props) => {
    return <Dialog.Root
        open={props.modal.visible}
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                props.modal.hide();
            }
        }}
    >
        <Dialog.Portal>
            <Dialog.Overlay className={style.overlay} />
            <Dialog.Content className={style.container}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        props.modal.hide();
                    }
                }}
            >
                <Dialog.Title style={{ display: 'none' }}>{props.title}</Dialog.Title>
                <Dialog.Description style={{ display: 'none' }}>{props.description}</Dialog.Description>
                <div className={style.box}>{props.children}</div>
            </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>
};
