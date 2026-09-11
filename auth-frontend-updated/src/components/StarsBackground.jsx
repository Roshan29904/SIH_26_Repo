import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

// ============================================================
// A layered, mouse-parallax starfield.
//
// How it works:
// - We render 3 layers of star "dots" (small / medium / large),
//   each a CSS box-shadow trick: one 1px/2px/3px div whose
//   box-shadow property lists hundreds of extra dots at random
//   x/y offsets — this draws hundreds of stars with a single
//   DOM element per layer instead of hundreds of elements.
// - Each layer scrolls upward forever via a CSS keyframe
//   animation, looping seamlessly (the pattern is duplicated
//   vertically so the loop point is invisible). `speed` controls
//   how many seconds one loop takes for the base layer — nearer
//   (larger) layers move faster, giving a sense of depth.
// - On top of that, we track the mouse position and nudge each
//   layer horizontally by a small, spring-smoothed amount
//   (`factor` controls how much, `transition` controls the
//   spring stiffness/damping) — this is the parallax effect:
//   moving your mouse makes the star layers drift at different
//   rates, which reads as depth.
// ============================================================

function generateBoxShadow(count, spread) {
  const shadows = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * spread);
    const y = Math.floor(Math.random() * spread);
    shadows.push(`${x}px ${y}px #FFF`);
  }
  return shadows.join(", ");
}

function useStarLayer(count, spread) {
  // useRef so the random pattern is generated once and never
  // regenerated on re-render (same reasoning as any random-layout
  // effect: regenerating on every render would make stars jump
  // around instead of looking fixed).
  const shadow = useRef(generateBoxShadow(count, spread));
  return shadow.current;
}

export default function StarsBackground({
  factor = 0.05,
  speed = 50,
  transition = { stiffness: 50, damping: 20 },
  starColor = "#fff",
  pointerEvents = true,
  className = "",
  children,
  ...props
}) {
  const containerRef = useRef(null);

  // Raw mouse position (updated instantly on mousemove)...
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // ...smoothed through a spring so movement feels physical
  // rather than snapping directly to the cursor.
  const springX = useSpring(mouseX, transition);
  const springY = useSpring(mouseY, transition);

  // Each layer moves by a different multiple of the base offset,
  // which is what creates the depth illusion (farther layers move
  // less than nearer ones).
  const smallX = useTransform(springX, (v) => v * factor * 0.5);
  const smallY = useTransform(springY, (v) => v * factor * 0.5);
  const mediumX = useTransform(springX, (v) => v * factor);
  const mediumY = useTransform(springY, (v) => v * factor);
  const largeX = useTransform(springX, (v) => v * factor * 1.5);
  const largeY = useTransform(springY, (v) => v * factor * 1.5);

  useEffect(() => {
    function handleMouseMove(e) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Center-relative position, so the parallax pushes outward
      // from the middle of the container rather than from a corner.
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    }

    // Listen on `window`, not the container itself. If other
    // (visually transparent but still pointer-catching) elements
    // are stacked above this container — e.g. the chat page's
    // sidebar/main panel, which use z-index to sit above the
    // starfield — a listener on the container alone would only
    // fire in the gaps where nothing else is stacked on top of it,
    // making the parallax effect silently stop working on pages
    // with full-bleed layered content. `window` always gets the
    // move regardless of what's on top.
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const smallStars = useStarLayer(700, 2000);
  const mediumStars = useStarLayer(200, 2000);
  const largeStars = useStarLayer(100, 2000);

  // `speed` is the base loop duration (seconds) from the API.
  // Nearer (larger) layers loop faster, matching the same
  // depth logic used for the horizontal parallax above.
  const smallDuration = `${speed * 3}s`;
  const mediumDuration = `${speed * 2}s`;
  const largeDuration = `${speed}s`;

  return (
    <div
      ref={containerRef}
      className={`stars-background ${className}`}
      style={{
        "--star-color": starColor,
        pointerEvents: pointerEvents ? "auto" : "none",
      }}
      {...props}
    >
      {/*
        Two nested elements per layer, deliberately:
        - the OUTER motion.div owns the mouse-parallax offset
          (x/y transform, driven by the spring values above).
        - the INNER plain div owns the CSS keyframe animation
          that scrolls the star pattern upward forever.
        Both would fight over the same `transform` property if
        combined on one element, so they're kept separate.
      */}
      <motion.div className="stars-parallax" style={{ x: smallX, y: smallY }}>
        <div
          className="stars-layer stars-layer--small"
          style={{ "--star-shadow": smallStars, animationDuration: smallDuration }}
        />
      </motion.div>
      <motion.div className="stars-parallax" style={{ x: mediumX, y: mediumY }}>
        <div
          className="stars-layer stars-layer--medium"
          style={{ "--star-shadow": mediumStars, animationDuration: mediumDuration }}
        />
      </motion.div>
      <motion.div className="stars-parallax" style={{ x: largeX, y: largeY }}>
        <div
          className="stars-layer stars-layer--large"
          style={{ "--star-shadow": largeStars, animationDuration: largeDuration }}
        />
      </motion.div>
      {children}
    </div>
  );
}

// Exposed so App.jsx / index.css can reference default loop speed
// if needed — kept simple since `speed` maps directly to the CSS
// custom property consumed by the keyframe animation duration.
export { generateBoxShadow };
