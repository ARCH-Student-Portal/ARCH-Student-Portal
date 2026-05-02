// useIntroAnimation.js
import { useEffect, useState } from "react";
import { gsap } from "gsap";

const WORD_POOL = [
  "ADMINISTRATION","CONTROL","RECORDS","FACULTY","STUDENTS",
  "ENROLLMENT","SYSTEMS","SECURITY","DATA","ANALYTICS",
  "FAST","NUCES","PORTAL","MANAGEMENT","DATABASE",
];

export default function useIntroAnimation({
  introRef,
  appRef,
  sidebarRef,
  topbarRef = null,
  sessionKey,
  words = WORD_POOL,
  onComplete,
}) {
  const [played] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(sessionKey) === "true"
  );

  useEffect(() => {
    if (played) {
      if (introRef?.current)   introRef.current.style.display = "none";
      if (appRef?.current)     appRef.current.style.opacity = "1";
      if (sidebarRef?.current) sidebarRef.current.style.transform = "translateX(0)";
      if (topbarRef?.current)  topbarRef.current.style.opacity = "1";
      onComplete?.();
      return;
    }

    // Canvas particle animation
    const introEl = introRef?.current;
    if (!introEl) return;

    const canvas = introEl.querySelector("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05,
      speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10,
      flicker: Math.random() * 0.025 + 0.005,
      hue: Math.random() > 0.6 ? "255,255,255" : "100,180,255",
    }));

    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y -= p.speed * 0.4;
        p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
        ctx.font = `${p.size}px 'Inter', sans-serif`;
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.fillText(p.word, p.x, p.y);
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const afterIntro = () => {
      cancelAnimationFrame(animId);
      sessionStorage.setItem(sessionKey, "true");
      gsap.set(introRef.current, { display: "none" });
      if (appRef?.current) gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
      if (sidebarRef?.current) gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out" });
      if (topbarRef?.current) gsap.to(topbarRef.current, { opacity: 1, duration: 0.7, delay: 0.4 });
      onComplete?.();
    };

    const logoEl  = introEl.querySelector("#intro-logo, #att-intro-logo, #ntc-intro-logo");
    const lineEl  = introEl.querySelector("#intro-line, #att-intro-line, #ntc-intro-line");
    const subEl   = introEl.querySelector("#intro-sub, #att-intro-sub, #ntc-intro-sub");
    const flashEl = introEl.querySelector("#intro-flash, #att-intro-flash, #ntc-intro-flash");

    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    if (lineEl)  tl.to(lineEl,  { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0);
    if (logoEl)  tl.to(logoEl,  { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5);
    if (subEl)   tl.to(subEl,   { opacity: 1, y: 0, duration: 0.5 }, 1.1);
    if (logoEl)  tl.to(logoEl,  { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4);
    if (subEl)   tl.to(subEl,   { opacity: 0, duration: 0.3 }, 2.4);
    if (lineEl)  tl.to(lineEl,  { opacity: 0, duration: 0.3 }, 2.4);
    if (flashEl) tl.to(flashEl, { opacity: 1, duration: 0.08 }, 2.85);
    if (flashEl) tl.to(flashEl, { opacity: 0, duration: 0.4  }, 2.93);
    tl.to(introRef.current, { opacity: 0, duration: 0.35 }, 2.88);

    return () => cancelAnimationFrame(animId);
  }, []);

  return { played };
}