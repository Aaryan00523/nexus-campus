'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CampusHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for entire rotating composition
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 1. Central Icosahedron Wireframe Core (Futuristic Knowledge Crystal)
    const icoGeometry = new THREE.IcosahedronGeometry(4.2, 1);
    const icoMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
    });
    const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
    coreGroup.add(icoMesh);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(2.4, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerSphere);

    // 2. Orbital Rings (Representing Timetable / Schedule Rotations)
    const ringGeo1 = new THREE.TorusGeometry(6.4, 0.05, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(8.0, 0.04, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.5 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    coreGroup.add(ring2);

    // 3. Floating Node Satellites (Data points / Attendance nodes)
    const nodeGeo = new THREE.SphereGeometry(0.28, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const nodes: THREE.Mesh[] = [];
    const nodeCount = 8;

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 6.4;
      node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      ring1.add(node);
      nodes.push(node);
    }

    // 4. Subtle Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x60a5fa, 2.5);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa78bfa, 1.8);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 0.8;
      mouseY = y * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth subtle rotations
      coreGroup.rotation.y += 0.005;
      coreGroup.rotation.x += 0.002;

      ring1.rotation.z += 0.008;
      ring2.rotation.z -= 0.006;

      // Parallax easing
      coreGroup.position.x += (mouseX * 2.5 - coreGroup.position.x) * 0.05;
      coreGroup.position.y += (-mouseY * 2.5 - coreGroup.position.y) * 0.05;

      // Subtle breathing scale
      const scale = 1 + Math.sin(elapsedTime * 1.5) * 0.03;
      icoMesh.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      icoGeometry.dispose();
      icoMaterial.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] flex items-center justify-center pointer-events-none select-none"
      aria-hidden="true"
    />
  );
}
