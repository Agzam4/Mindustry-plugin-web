
import React, { useState, useEffect } from 'react';

interface BanStringProps {
    end: number;
    func?: (h: number, m: number, s: number) => string
}

export const TimeBefore: React.FC<BanStringProps> = ({ end, func }) => {
    const [timeLeft, setTimeLeft] = useState<number>(() => Math.max(0, end - Date.now()));

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            const remaining = end - Date.now();
            if (remaining <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [end]);

    const totalSeconds = Math.floor(timeLeft / 1000);

    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60



    if (!func) {
        const hours = h ? (String(h).padStart(2, '0') + ":") : ''
        const minutes = String(m).padStart(2, '0')
        const seconds = String(s).padStart(2, '0')

        return <>{`${hours}${minutes}:${seconds}`}</>
    }

    return <>{func(h, m, s)}</>
};
