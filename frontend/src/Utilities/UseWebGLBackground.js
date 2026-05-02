// useWebGLBackground.js
import { useEffect } from "react";
import * as THREE from "three";

export default function useWebGLBackground(canvasRef, options = {}) {
  const { 
    clearColor = 0xf0f5ff, 
    particleCount = 140,
    particleOpacity = 0.6,
    enabled = true 
  } = options;

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setClearColor(clearColor, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 3, 12);

    scene.add(new THREE.AmbientLight(0x0033aa, 0.6));
    const sun = new THREE.DirectionalLight(0x40a9ff, 1.2);
    sun.position.set(-6, 12, 8);
    scene.add(sun);

    const COUNT = particleCount;
    const ptPos = new Float32Array(COUNT * 3);
    const ptCol = new Float32Array(COUNT * 3);
    const ptVel = [];

    for (let i = 0; i < COUNT; i++) {
      ptPos[i*3]   = (Math.random() - 0.5) * 34;
      ptPos[i*3+1] = (Math.random() - 0.5) * 22;
      ptPos[i*3+2] = (Math.random() - 0.5) * 18 - 6;
      ptVel.push({ x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.006 });
      ptCol[i*3] = 0.1; ptCol[i*3+1] = 0.5; ptCol[i*3+2] = 1;
    }

    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol, 3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({
      size: 0.05, transparent: true, opacity: particleOpacity, vertexColors: true
    })));

    let nmx = 0, nmy = 0;
    const onMove = e => {
      nmx = (e.clientX / W) * 2 - 1;
      nmy = -(e.clientY / H) * 2 + 1;
    };
    document.addEventListener("mousemove", onMove);

    let animId;
    const loop = () => {
      animId = requestAnimationFrame(loop);
      const p = ptGeo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        p[i*3]   += ptVel[i].x + nmx * 0.001;
        p[i*3+1] += ptVel[i].y + nmy * 0.001;
        if (p[i*3]   >  17) p[i*3]   = -17;
        if (p[i*3]   < -17) p[i*3]   =  17;
        if (p[i*3+1] >  11) p[i*3+1] = -11;
        if (p[i*3+1] < -11) p[i*3+1] =  11;
      }
      ptGeo.attributes.position.needsUpdate = true;
      camera.position.x += (nmx * 0.8 - camera.position.x) * 0.015;
      camera.position.y += (nmy * 0.5 + 3 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);
}