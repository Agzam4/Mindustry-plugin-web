
import { useCallback, useEffect, useRef } from 'react'

interface InfiniteScrollOptions {
    loading: boolean
    hasMore: boolean
    onLoadMore: () => void
    rootMargin?: string
}

export function useFeed({ loading, hasMore, onLoadMore, rootMargin = '150px' }: InfiniteScrollOptions) {
    const triggerNodeRef = useRef<HTMLElement | null>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)

    const triggerRef = useCallback((node: HTMLElement | null) => {
        triggerNodeRef.current = node
    }, [])

    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect()

        if (loading || !hasMore || !triggerNodeRef.current) return

        observerRef.current = new IntersectionObserver((entries) => {
            const [entry] = entries
            if (entry?.isIntersecting) {
                onLoadMore()
            }
        }, { rootMargin })

        observerRef.current.observe(triggerNodeRef.current)

        return () => {
            if (observerRef.current) observerRef.current.disconnect()
        }
    }, [loading, hasMore, onLoadMore, rootMargin])

    return triggerRef
}
