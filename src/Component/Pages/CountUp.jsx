import React, { useEffect, useRef, useState } from "react";

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function CountUp({
  from = 0,
  to = 100,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = true,
  startOnView = true,
}) {
  const ref = useRef(null);
  const [value, setValue] = useState(from);
  const [hasStarted, setHasStarted] = useState(!startOnView);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
      return;
    }

    const el = ref.current;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setHasStarted(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (el) io.observe(el);
    return () => io.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!hasStarted) return;

    let raf;
    const start = performance.now();

    const animate = now => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const current = from + (to - from) * eased;
      setValue(current);
      if (t < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [hasStarted, from, to, duration]);

  const formatNumber = n => {
    const fixed = n.toFixed(decimals);
    if (!separator) return fixed;
    const [intPart, decPart] = fixed.split(".");
    const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart ? `${withSep}.${decPart}` : withSep;
  };

  return (
    <span ref={ref}>
      {prefix}
      {formatNumber(value)}
      {suffix}
    </span>
  );
}
