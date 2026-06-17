import style from './AuthPage.module.scss'
import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { auth } from '@/api/auth-api';

export default function AuthPage({ token }: { token: string }) {
    const [, setLocation] = useLocation();
    const dialogRef = useRef<HTMLDialogElement>(null);

    const handleClose = () => {
        setLocation('/');
    };

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog) {
            dialog.showModal();
        }
    }, []);

    const handleAuth = () => {
        auth(token).then(e => {
            setLocation(e)
        }).catch((e: Error) => {
            alert(e.message)
        })
    };

    return (
        <dialog
            ref={dialogRef}
            className={style.body}
            onCancel={(e) => {
                e.preventDefault();
                handleClose();
            }}
            onClick={(e) => {
                // if (e.target === dialogRef.current) handleClose();
            }}
        >
            <div className={style.box}>
                <h1>Авторизация</h1>
                <p>Ссылка на авторизацию одноразовая и действует только на 1 устройство</p>
                <button className={style.auth} onClick={handleAuth}>
                    Авторизоваться
                </button>
            </div>
        </dialog>
    );
}
