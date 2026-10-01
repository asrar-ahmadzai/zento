import { useEffect, useCallback } from 'react';

interface UseIntersectionObserverProps {
    target: React.RefObject<HTMLElement>;
    onIntersect: () => void;
    enabled?: boolean;
    threshold?: number;
    rootMargin?: string;
}

export const useIntersectionObserver = ({
    target,
    onIntersect,
    enabled = true,
    threshold = 0.1,
    rootMargin = '50px',
}: UseIntersectionObserverProps) => {
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting) {
                onIntersect();
            }
        },
        [onIntersect]
    );

    useEffect(() => {
        if (!enabled || !target.current || typeof window === 'undefined') {
            return;
        }

        // Check if IntersectionObserver is available
        if (!('IntersectionObserver' in window)) {
            // Fallback behavior or just return
            console.warn('IntersectionObserver is not supported in this browser');
            return;
        }

        const observer = new IntersectionObserver(handleObserver, {
            threshold,
            rootMargin,
        });

        observer.observe(target.current);
        return () => observer.disconnect();
    }, [target, enabled, handleObserver, threshold, rootMargin]);
}; 