import { useEffect, useRef, useState, useCallback } from 'react';

interface DragScrollOptions {
    speed?: number;
    threshold?: number;
}

export function useDragScroll<T extends HTMLElement = HTMLDivElement>(options: DragScrollOptions = {}) {
    const { speed = 1.0, threshold = 4 } = options;
    const ref = useRef<T | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Update scroll availability states
    const checkScrollLimits = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanScrollLeft(scrollLeft > 2);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
    }, []);

    // Smooth scroll by an offset
    const scrollByOffset = useCallback((offset: number) => {
        const el = ref.current;
        if (!el) return;
        el.scrollBy({ left: offset, behavior: 'smooth' });
    }, []);

    const scrollToLeft = useCallback(() => {
        scrollByOffset(-400);
    }, [scrollByOffset]);

    const scrollToRight = useCallback(() => {
        scrollByOffset(400);
    }, [scrollByOffset]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        checkScrollLimits();

        // Check on window resize or scroll
        const handleScroll = () => {
            checkScrollLimits();
        };

        el.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        let isDown = false;
        let startX = 0;
        let startScrollLeft = 0;
        let hasMoved = false;

        const handleMouseDown = (e: MouseEvent) => {
            // Do not drag if user clicked an interactive control or input
            const target = e.target as HTMLElement | null;
            if (
                target?.closest(
                    'input, textarea, select, button, a, [contenteditable="true"], [role="button"], label',
                )
            ) {
                return;
            }

            // Only primary mouse button (left click)
            if (e.button !== 0) return;

            isDown = true;
            hasMoved = false;
            startX = e.pageX - el.offsetLeft;
            startScrollLeft = el.scrollLeft;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDown) return;

            const x = e.pageX - el.offsetLeft;
            const deltaX = (x - startX) * speed;

            if (!hasMoved && Math.abs(deltaX) > threshold) {
                hasMoved = true;
                setIsDragging(true);
                el.style.userSelect = 'none';
                el.style.cursor = 'grabbing';
            }

            if (hasMoved) {
                e.preventDefault();
                el.scrollLeft = startScrollLeft - deltaX;
            }
        };

        const handleMouseUp = () => {
            if (!isDown) return;
            isDown = false;

            if (hasMoved) {
                // Prevent any accidental click trigger right after a drag
                const captureClick = (ev: MouseEvent) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    window.removeEventListener('click', captureClick, true);
                };
                window.addEventListener('click', captureClick, true);
            }

            hasMoved = false;
            setIsDragging(false);
            el.style.userSelect = '';
            el.style.cursor = '';
        };

        el.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            el.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            el.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [speed, threshold, checkScrollLimits]);

    return {
        ref,
        isDragging,
        canScrollLeft,
        canScrollRight,
        scrollToLeft,
        scrollToRight,
        scrollByOffset,
        checkScrollLimits,
    };
}
