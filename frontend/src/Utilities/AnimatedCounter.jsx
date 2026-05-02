// AnimatedCounter.jsx
import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export default function AnimatedCounter({ 
  value, decimals = 0, suffix = "", prefix = "", 
  duration = 1.2, delay = 0, useCommas = false 
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    let num = Number(latest);
    if (isNaN(num)) num = 0;
    let str = num.toFixed(decimals);
    if (useCommas) str = parseFloat(str).toLocaleString("en-US");
    return prefix + str + suffix;
  });

  useEffect(() => {
    const safe = isNaN(Number(value)) ? 0 : Number(value);
    const ctrl = animate(count, safe, { duration, delay, ease: [0.34, 1.56, 0.64, 1] });
    return () => ctrl.stop();
  }, [value, duration, delay, count]);

  return <motion.span>{rounded}</motion.span>;
}