import { useState, useEffect, useRef, useMemo } from 'react';

type UseVirtualGridOptions = {
  itemCount: number;
  columnCount: number;
  gap: number;
  aspectRatio: number;
  overscan?: number;
};

type VirtualGridResult = {
  containerRef: React.RefObject<HTMLDivElement>;
  totalHeight: number;
  visibleRange: { start: number; end: number };
  offsetY: number;
  columnCount: number;
};

export function useVirtualGrid({
  itemCount,
  columnCount,
  gap,
  aspectRatio,
  overscan = 8,
}: UseVirtualGridOptions): VirtualGridResult {
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let ticking = false;

    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setContainerWidth(el.clientWidth);
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      rafId = requestAnimationFrame(() => {
        const currentEl = containerRef.current;
        if (currentEl) {
          const rect = currentEl.getBoundingClientRect();
          const offsetTop = rect.top + window.scrollY;
          const relativeScroll = Math.max(0, window.scrollY - offsetTop);
          setScrollTop(relativeScroll);
          setViewportHeight(window.innerHeight);
        }
        ticking = false;
      });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);

    // Initial run
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const safeColumnCount = Math.max(
    columnCount,
    1
  );

  const columnWidth = useMemo(() => {
    if (!containerWidth) return 0;

    return (
      containerWidth -
      gap * (safeColumnCount - 1)
    ) / safeColumnCount;
  }, [
    containerWidth,
    safeColumnCount,
    gap,
  ]);

  const rowHeight = useMemo(() => {
    return (
      columnWidth * aspectRatio +
      gap
    );
  }, [
    columnWidth,
    aspectRatio,
    gap,
  ]);

  const totalRows = useMemo(() => {
    return Math.ceil(
      itemCount / safeColumnCount
    );
  }, [
    itemCount,
    safeColumnCount,
  ]);

  const totalHeight = useMemo(() => {
    if (!rowHeight) return 0;

    return Math.max(
      0,
      totalRows * rowHeight - gap
    );
  }, [
    totalRows,
    rowHeight,
    gap,
  ]);

  const visibleRange = useMemo(() => {
    if (
      rowHeight <= 0 ||
      viewportHeight <= 0
    ) {
      return {
        start: 0,
        end: Math.min(
          itemCount,
          safeColumnCount * 20
        ),
      };
    }

    const startRow = Math.max(
      0,
      Math.floor(
        scrollTop / rowHeight
      ) - overscan
    );

    const visibleRowCount =
      Math.ceil(
        viewportHeight /
          rowHeight
      ) +
      overscan * 2;

    const endRow = Math.min(
      totalRows,
      startRow +
        visibleRowCount
    );

    return {
      start:
        startRow *
        safeColumnCount,

      end: Math.min(
        itemCount,
        endRow *
          safeColumnCount
      ),
    };
  }, [
    scrollTop,
    rowHeight,
    viewportHeight,
    totalRows,
    safeColumnCount,
    itemCount,
    overscan,
  ]);

  const offsetY = useMemo(() => {
    const startRow =
      Math.floor(
        visibleRange.start /
          safeColumnCount
      );

    return startRow * rowHeight;
  }, [
    visibleRange.start,
    safeColumnCount,
    rowHeight,
  ]);

  return {
    containerRef,
    totalHeight,
    visibleRange,
    offsetY,
    columnCount:
      safeColumnCount,
  };
}

export function useResponsiveColumns(): {
  containerRef: React.RefObject<HTMLDivElement>;
  columnCount: number;
} {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [width, setWidth] =
    useState(0);

  useEffect(() => {
    let rafId = 0;

    const init = () => {
      const el =
        containerRef.current;

      if (!el) {
        rafId =
          requestAnimationFrame(
            init
          );
        return;
      }

      const update = () => {
        setWidth(
          el.clientWidth
        );
      };

      update();

      const ro =
        new ResizeObserver(
          update
        );

      ro.observe(el);

      return () => {
        ro.disconnect();
      };
    };

    const cleanup = init();

    return () => {
      cancelAnimationFrame(
        rafId
      );

      if (
        typeof cleanup ===
        'function'
      ) {
        cleanup();
      }
    };
  }, []);

  const columnCount =
    useMemo(() => {
      if (width < 640)
        return 2;

      if (width < 768)
        return 3;

      if (width < 1024)
        return 4;

      if (width < 1440)
        return 5;

      return 6;
    }, [width]);

  return {
    containerRef,
    columnCount,
  };
}

export function naturalSort(
  a: string,
  b: string
): number {
  return a.localeCompare(
    b,
    undefined,
    {
      numeric: true,
      sensitivity:
        'base',
    }
  );
}