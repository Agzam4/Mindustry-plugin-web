import { useState, useRef, useLayoutEffect, type ReactNode } from 'react';
import clsx from 'clsx';
import Text from '@/components/ui/Text';
import style from './Spoiler.module.scss';



interface SpoilerProps {
    title?: string;
    children: ReactNode;
}

function Spoiler({ children }: SpoilerProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <button onClick={() => setIsOpen(!isOpen)} className={clsx(style.spoiler, !isOpen && style.hidden)}        >
            <Text>{children}</Text>
        </button>
    );
}

export default Spoiler;
