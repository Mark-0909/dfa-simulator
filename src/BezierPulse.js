import React, { useEffect, useState } from 'react';

// Reusable JS-driven pulse along a cubic bezier defined by points {p0,c1,c2,p3}
// Uses easing and a small trailing dot for visual polish while remaining performant.
export default function BezierPulse({ pathPoints, duration = 700 }) {
  const [pos, setPos] = useState(null);
  const [trailPos, setTrailPos] = useState(null);
  const [progress, setProgress] = useState(0);

  function cubicPoint(t, p0, c1, c2, p3) {
    const mt = 1 - t;
    const a = mt * mt * mt;
    const b = 3 * mt * mt * t;
    const c = 3 * mt * t * t;
    const d = t * t * t;
    return {
      x: a * p0.x + b * c1.x + c * c2.x + d * p3.x,
      y: a * p0.y + b * c1.y + c * c2.y + d * p3.y,
    };
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  useEffect(() => {
    if (!pathPoints) return;
    let raf = null;
    const start = performance.now();

    function step(now) {
      const rawT = Math.min(1, (now - start) / duration);
      const t = easeInOutCubic(rawT);
      const pt = cubicPoint(t, pathPoints.p0, pathPoints.c1, pathPoints.c2, pathPoints.p3);
      const trailT = Math.max(0, Math.min(1, t - 0.08));
      const trailPt = cubicPoint(trailT, pathPoints.p0, pathPoints.c1, pathPoints.c2, pathPoints.p3);

      setPos(pt);
      setTrailPos(trailPt);
      setProgress(t);

      if (rawT < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => { setPos(null); setTrailPos(null); setProgress(0); }, 60);
    }

    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); setPos(null); setTrailPos(null); setProgress(0); };
  }, [pathPoints, duration]);

  if (!pos) return null;
  const baseR = 5;
  const pulseScale = 1 + 0.25 * Math.sin(progress * Math.PI * 2);
  const r = baseR * pulseScale;
  const opacity = 0.9 - 0.6 * (1 - progress);

  return (
    <g style={{ pointerEvents: 'none' }}>
      {trailPos && <circle cx={trailPos.x} cy={trailPos.y} r={Math.max(2, baseR * 0.7)} fill="#2ecc71" opacity={0.35} />}
      <circle cx={pos.x} cy={pos.y} r={r} fill="#2ecc71" stroke="#fff" strokeWidth={1} opacity={opacity} />
    </g>
  );
}
