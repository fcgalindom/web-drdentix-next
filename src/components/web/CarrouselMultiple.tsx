import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { Box, IconButton, styled } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface Props<T> {
  items: T[];
  children: (item: T) => ReactNode;
  perPage: number;
  perPageMd?: number;
  perPageLg?: number;
  timeAuto?: number;
  className?: string;
}

const ArrowButton = styled(IconButton)({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  backgroundColor: 'rgba(255,255,255,0.85)',
  '&:hover': { backgroundColor: 'rgba(255,255,255,0.95)' },
});

const DotsContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: 8,
  marginTop: 12,
});

const Dot = styled(Box, { shouldForwardProp: (prop) => prop !== 'active' })<{ active: boolean }>(
  ({ active }) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: active ? '#00A6A6' : '#CBD5E1',
    transition: 'background-color 0.3s ease',
    cursor: 'pointer',
  }),
);

function CarrouselMultiple<T>({
  items,
  children,
  perPage,
  perPageMd,
  perPageLg,
  timeAuto = 4000,
  className,
}: Props<T>) {
  const [itemsPerSlide, setItemsPerSlide] = useState(perPage);
  const [currentPos, setCurrentPos] = useState(0);
  const [animate, setAnimate] = useState(true);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const posAtDragStart = useRef(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (perPageLg && w >= 1200) setItemsPerSlide(perPageLg);
      else if (perPageMd && w >= 768) setItemsPerSlide(perPageMd);
      else setItemsPerSlide(perPage);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [perPage, perPageMd, perPageLg]);

  const padded = [...items.slice(-itemsPerSlide), ...items, ...items.slice(0, itemsPerSlide)];
  const totalSlides = items.length;
  const startIndex = itemsPerSlide;
  const endIndex = startIndex + totalSlides - 1;

  const goTo = useCallback((pos: number) => {
    if (isDragging.current) return;
    setAnimate(true);
    setCurrentPos(pos);
  }, []);

  const goNext = useCallback(() => goTo(currentPos + 1), [currentPos, goTo]);
  const goPrev = useCallback(() => goTo(currentPos - 1), [currentPos, goTo]);

  const handleTransitionEnd = useCallback(() => {
    if (currentPos >= startIndex + totalSlides) {
      setAnimate(false);
      setCurrentPos(startIndex);
    } else if (currentPos < startIndex) {
      setAnimate(false);
      setCurrentPos(endIndex);
    }
  }, [currentPos, startIndex, totalSlides, endIndex]);

  useEffect(() => {
    if (animate === false) {
      requestAnimationFrame(() => setAnimate(true));
    }
  }, [animate]);

  useEffect(() => {
    if (timeAuto <= 0 || totalSlides <= 1) return;
    autoPlayRef.current = setInterval(goNext, timeAuto);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [timeAuto, goNext, totalSlides]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    isDragging.current = true;
    dragStartX.current = e.clientX;
    posAtDragStart.current = currentPos;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = dragStartX.current - e.clientX;
    const threshold = (containerRef.current?.offsetWidth ?? 1) / itemsPerSlide;
    const steps = Math.round(delta / threshold);
    const newPos = posAtDragStart.current + steps;
    setAnimate(false);
    setCurrentPos(Math.max(0, Math.min(padded.length - 1, newPos)));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    if (currentPos >= startIndex + totalSlides) {
      setAnimate(true);
      setCurrentPos(startIndex);
    } else if (currentPos < startIndex) {
      setAnimate(true);
      setCurrentPos(endIndex);
    }
    if (timeAuto > 0 && totalSlides > 1) {
      autoPlayRef.current = setInterval(goNext, timeAuto);
    }
  };

  const normalizedIndex =
    currentPos >= startIndex + totalSlides
      ? 0
      : currentPos < startIndex
        ? totalSlides - 1
        : currentPos - startIndex;

  if (totalSlides === 0) return null;

  return (
    <Box className={className} sx={{ position: 'relative', overflow: 'hidden' }}>
      {totalSlides > 1 && (
        <>
          <ArrowButton
            onClick={goPrev}
            sx={{ left: 0, ml: 1 }}
            size="small"
            aria-label="Anterior"
          >
            <ChevronLeft />
          </ArrowButton>
          <ArrowButton
            onClick={goNext}
            sx={{ right: 0, mr: 1 }}
            size="small"
            aria-label="Siguiente"
          >
            <ChevronRight />
          </ArrowButton>
        </>
      )}

      <Box
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        sx={{ touchAction: 'pan-y', userSelect: 'none', overflow: 'hidden' }}
      >
        <Box
          onTransitionEnd={handleTransitionEnd}
          sx={{
            display: 'flex',
            transform: `translateX(-${currentPos * (100 / itemsPerSlide)}%)`,
            transition: animate
              ? 'transform 0.4s ease'
              : 'none',
          }}
        >
          {padded.map((item, i) => (
            <Box
              key={i}
              sx={{
                flex: `0 0 ${100 / itemsPerSlide}%`,
                px: 1,
                boxSizing: 'border-box',
              }}
            >
              {children(item)}
            </Box>
          ))}
        </Box>
      </Box>

      {totalSlides > 1 && (
        <DotsContainer>
          {items.map((_, i) => (
            <Dot
              key={i}
              active={i === normalizedIndex}
              onClick={() => goTo(startIndex + i)}
            />
          ))}
        </DotsContainer>
      )}
    </Box>
  );
}

export default CarrouselMultiple;
