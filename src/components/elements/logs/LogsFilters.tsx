import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react'
import clsx from 'clsx'
import type { LogFilters } from './types'
import { TAG_LABELS } from './types'
import style from './Logs.module.scss'

interface Props {
    filters: LogFilters
    onChange: Dispatch<SetStateAction<LogFilters>>
}

export function LogsFilters({ filters, onChange }: Props) {


    // const [queryInput, setQueryInput] = useState(filters.query)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    // const handleQueryChange = useCallback(
    //     (value: string) => {
    //         setQueryInput(value)
    //         clearTimeout(debounceRef.current)
    //         debounceRef.current = setTimeout(() => {
    // onChange({ query: value })
    //         }, 300)
    //     },
    //     [onChange],
    // )

    const toggleTag = useCallback(
        (tag: number) => {
            const next = filters.tags.includes(tag)
                ? filters.tags.filter(t => t !== tag)
                : [...filters.tags, tag]
            onChange(e => ({ tags: next }))
        },
        [filters.tags, onChange],
    )

    const clearFilters = useCallback(() => {
        // setQueryInput('')
        onChange(() => ({ tags: [] }))
    }, [onChange])

    const hasActiveFilters = filters.tags.length > 0 // || filters.query.length > 0 || filters.t1 > 0

    return (
        <div className={style.filters}>
            <div className={style.filterSection}>
                <div className={style.filterHeader}>
                    <span>Tags</span>
                    {hasActiveFilters && (
                        <button className={style.clearBtn} onClick={clearFilters}>
                            Clear
                        </button>
                    )}
                </div>
                <div className={style.tagGrid}>
                    {Object.entries(TAG_LABELS).map(([key, label]) => {
                        const tag = Number(key)
                        return (
                            <button
                                key={tag}
                                className={clsx(style.tagBtn, filters.tags.includes(tag) && style.tagBtnActive)}
                                onClick={() => toggleTag(tag)}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className={style.filterSection}>
                <div className={style.filterHeader}>
                    <span>Search</span>
                </div>
                {/* <input */}
                {/*     className={style.searchInput} */}
                {/*     type="text" */}
                {/*     placeholder="message text…" */}
                {/*     value={queryInput} */}
                {/*     onChange={e => handleQueryChange(e.target.value)} */}
                {/* /> */}
            </div>
        </div>
    )
}
