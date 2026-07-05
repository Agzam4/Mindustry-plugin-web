import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react'
import clsx from 'clsx'
import type { LogFilters } from './types'
import { TAG_LABELS } from './types'
import style from './Logs.module.scss'
import { useLogFilterStore, splash } from './useFiltersStore'

interface Props {
    filters: LogFilters
    onChange: Dispatch<SetStateAction<LogFilters>>
}

export function LogsFilters() {
    const tags = useLogFilterStore((state) => state.filters.tags);
    const tagFilters = useLogFilterStore((state) => state.filters.tagFilters);
    const toggleTagAction = useLogFilterStore((state) => state.toggleTag);
    const applySplashFilter = useLogFilterStore((state) => state.applySplashFilter);
    const clearAll = useLogFilterStore((state) => state.clearAll);
    const splashValues = useLogFilterStore((state) => state.filters.applyedTagFilters);

    const hasActiveFilters = tags.length > 0 || tagFilters.size > 0;

    const handleSplashChange = useCallback((key: keyof typeof splash, value: string) => {
        if (value.trim() === '') {
            applySplashFilter(key, null);
        } else {
            const parsedValue = key === 'player' ? (Number(value) || null) : value;
            applySplashFilter(key, parsedValue);
        }
    }, [applySplashFilter]);


    return (
        <div className={style.filters}>
            <div className={style.filterSection}>
                <div className={style.filterHeader}>
                    <span>Tags</span>
                    {hasActiveFilters && (
                        <button className={style.clearBtn} onClick={clearAll}>
                            Clear All
                        </button>
                    )}
                </div>
                <div className={style.tagGrid}>
                    {Object.entries(TAG_LABELS).map(([key, label]) => {
                        const tag = Number(key);
                        const isActive = tags.includes(tag);
                        return (
                            <button
                                key={tag}
                                className={clsx(style.tagBtn, isActive && style.tagBtnActive)}
                                onClick={() => toggleTagAction(tag)}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={style.filterSection}>
                <div className={style.filterHeader}>
                    <span>Smart Search</span>
                </div>
                <div className={style.searchGrid}>
                    {Object.entries(splash).map(([key, def]) => {
                        const splashKey = key as keyof typeof splash;
                        const inputValue = splashValues[splashKey] ?? '';
                        return (
                            <div key={splashKey} className={style.inputWrapper}>
                                <label className={style.inputLabel}>{def.label}</label>
                                <input
                                    className={style.searchInput}
                                    type={splashKey === 'player' ? 'number' : 'text'}
                                    placeholder={def.placeholder}
                                    value={inputValue}
                                    onChange={(e) => handleSplashChange(splashKey, e.target.value)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
