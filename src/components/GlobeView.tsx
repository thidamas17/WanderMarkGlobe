import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GlobePin, PinStyleType, TabType } from '../types';
import { AddPinModal } from './AddPinModal';
import {
  EARTH_TEXTURE_URLS,
  loadEarthTexture,
  createProceduralEarthTexture,
  createGraticulesGroup,
  latLngToVector3,
} from '../utils/earthTextures';

interface GlobeViewProps {
  pins: GlobePin[];
  onAddPin: (pin: GlobePin) => void;
  onNavigateTab: (tab: TabType) => void;
  onToast: (msg: string) => void;
}

export type EarthStyleMode = 'satellite' | 'night' | 'sample';

const PIN_COLORS = [
  { hex: '#ffb703', name: 'สีทอง (Gold)' },
  { hex: '#e63946', name: 'สีแดง (Ruby)' },
  { hex: '#00b4d8', name: 'สีฟ้า (Cyan)' },
  { hex: '#2a9d8f', name: 'สีเขียว (Emerald)' },
  { hex: '#9d4edd', name: 'สีม่วง (Purple)' },
];

/**
 * Creates a crisp 2D flag banner texture for the flag pin style
 */
function createFlagTexture(code: string, colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Background flag banner
  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.roundRect(4, 4, 120, 56, 6);
  ctx.fill();

  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Flag text label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(code.slice(0, 4) || 'FLAG', 64, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates the high-definition photorealistic Earth material for Day Mode
 * Crisp NASA Blue Marble satellite photography with specular sunlight reflections on oceans and 3D terrain normal maps
 */
function createDayRealisticMaterial(): THREE.MeshStandardMaterial {
  const proceduralBlueTex = createProceduralEarthTexture('satellite');
  const normTex = loadEarthTexture(EARTH_TEXTURE_URLS.normalMap);
  const specTex = loadEarthTexture(EARTH_TEXTURE_URLS.specularMap);

  const mat = new THREE.MeshStandardMaterial({
    map: proceduralBlueTex,
    color: new THREE.Color(0xffffff), // Pure neutral daylight to show true NASA Blue Marble colors
    normalMap: normTex,
    normalScale: new THREE.Vector2(0.95, 0.95), // 3D mountain & terrain relief
    roughnessMap: specTex,
    roughness: 0.28, // Oceans gleam with sunlight, landmasses stay matte
    metalness: 0.02,
    emissive: new THREE.Color(0x1a2836), // Soft daylight diffuse fill so continents & oceans are bright and clear
    emissiveIntensity: 0.35,
  });

  // Upgrade with high-res NASA Blue Marble photography when network finishes loading
  loadEarthTexture(EARTH_TEXTURE_URLS.dayBlueMarble, (loadedTex) => {
    mat.map = loadedTex;
    mat.needsUpdate = true;
  });

  return mat;
}

/**
 * Creates the high-definition photorealistic Nocturnal Earth material for Night Mode
 * NASA Black Marble photography with brilliant glowing city lights clusters (Tokyo, NYC, London, Bangkok, etc.)
 */
function createNightRealisticMaterial(): THREE.MeshStandardMaterial {
  const proceduralNightTex = createProceduralEarthTexture('night');
  const normTex = loadEarthTexture(EARTH_TEXTURE_URLS.normalMap);
  const specTex = loadEarthTexture(EARTH_TEXTURE_URLS.specularMap);
  const nightLightsTex = loadEarthTexture(EARTH_TEXTURE_URLS.nightLights);

  const mat = new THREE.MeshStandardMaterial({
    map: proceduralNightTex,
    color: new THREE.Color(0xffffff),
    normalMap: normTex,
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughnessMap: specTex,
    roughness: 0.72,
    metalness: 0.04,
    emissiveMap: nightLightsTex,
    emissive: new THREE.Color(0xfff3b0), // Warm incandescent & LED city illumination
    emissiveIntensity: 2.5,
  });

  loadEarthTexture(EARTH_TEXTURE_URLS.nightDark, (loadedTex) => {
    mat.map = loadedTex;
    mat.needsUpdate = true;
  });

  return mat;
}

/**
 * Creates the high-definition Vintage Explorer Model material
 * Based on the sample image model: antique golden vintage explorer map with warm gilded continents,
 * antique navy nautical oceans, compass rose, and glowing amber illumination
 */
function createVintageExplorerMaterial(): THREE.MeshStandardMaterial {
  const vintageTex = createProceduralEarthTexture('vintage');
  const normTex = loadEarthTexture(EARTH_TEXTURE_URLS.normalMap);
  const specTex = loadEarthTexture(EARTH_TEXTURE_URLS.specularMap);

  const mat = new THREE.MeshStandardMaterial({
    map: vintageTex,
    color: new THREE.Color(0xfff8e8), // Warm antique parchment gold tint
    normalMap: normTex,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughnessMap: specTex,
    roughness: 0.42,
    metalness: 0.18, // Antique metallic brass/gilded gold sheen
    emissive: new THREE.Color(0xd4af37), // Warm golden cartographic radiance
    emissiveIntensity: 0.45,
  });

  return mat;
}



export const GlobeView: React.FC<GlobeViewProps> = ({
  pins,
  onAddPin,
  onNavigateTab,
  onToast,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Default selected pin
  const [selectedPin, setSelectedPin] = useState<GlobePin | null>(pins[0] || null);

  // Earth visual mode: 'satellite' = Day (Realistic), 'night' = Night (Realistic City Lights), 'sample' = Vintage Cartography
  const [earthMode, setEarthMode] = useState<EarthStyleMode>('satellite');

  // Pin appearance customization
  const [globalPinStyle, setGlobalPinStyle] = useState<PinStyleType>('dot');
  const [globalPinColor, setGlobalPinColor] = useState<string>('#ffb703');

  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showClouds, setShowClouds] = useState<boolean>(true);
  const [showGraticules, setShowGraticules] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddPinOpen, setIsAddPinOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(2.55);

  // Three.js instances stored in refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const graticulesGroupRef = useRef<THREE.Group | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Animated elements
  const pinAnimItemsRef = useRef<
    {
      pin: GlobePin;
      style: PinStyleType;
      halo?: THREE.Mesh;
      dot?: THREE.Mesh;
      flagBanner?: THREE.Mesh;
      needleHead?: THREE.Mesh;
    }[]
  >([]);
  const flightArcsRef = useRef<THREE.Line[]>([]);

  // Animation & Control refs
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const autoRotateRef = useRef<boolean>(true);
  autoRotateRef.current = autoRotate;

  // Cached materials for instant mode switching without glitch
  const materialsCacheRef = useRef<{
    sample?: THREE.MeshStandardMaterial;
    satellite?: THREE.MeshStandardMaterial;
    night?: THREE.MeshStandardMaterial;
  }>({});

  // Sync selected pin if pins change
  useEffect(() => {
    if (pins.length > 0 && (!selectedPin || !pins.find((p) => p.id === selectedPin.id))) {
      setSelectedPin(pins[0]);
    } else if (pins.length === 0) {
      setSelectedPin(null);
    }
  }, [pins, selectedPin]);

  // Focus smooth rotation onto a coordinate
  const focusOnCoordinates = useCallback((lat: number, lng: number) => {
    const targetY = -((lng * Math.PI) / 180) - Math.PI / 2;
    const targetX = (lat * Math.PI) / 180;
    targetRotationRef.current = { x: targetX, y: targetY };
    setAutoRotate(false);
  }, []);

  const handleSelectPin = (pin: GlobePin) => {
    setSelectedPin(pin);
    focusOnCoordinates(pin.lat, pin.lng);
    onToast(`พิกัด: ${pin.city}, ${pin.country} (${pin.latLngDisplay})`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = pins.find(
      (p) =>
        p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      handleSelectPin(found);
    } else {
      onToast(`ไม่พบ "${searchQuery}" กด "+ ปักหมุด" เพื่อเพิ่มพิกัดใหม่ได้ทันที`);
      setIsAddPinOpen(true);
    }
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.max(1.7, Math.min(3.8, prev + delta));
      if (cameraRef.current) {
        cameraRef.current.position.z = next;
      }
      return next;
    });
  };
  // Switch Earth Material & Lighting dynamically (Day vs Night vs Sample)
  useEffect(() => {
    if (!earthMeshRef.current) return;
    const cache = materialsCacheRef.current;

    if (earthMode === 'satellite') {
      // ☀️ DAY MODE: โลกสมจริง (Photorealistic Blue Marble)
      if (!cache.satellite) {
        cache.satellite = createDayRealisticMaterial();
      }
      earthMeshRef.current.material = cache.satellite;

      // Daylight atmospheric lighting - Highly illuminated, crystal clear Earth
      if (ambientLightRef.current) {
        ambientLightRef.current.color.setHex(0xffffff);
        ambientLightRef.current.intensity = 2.4;
      }
      if (dirLightRef.current) {
        dirLightRef.current.color.setHex(0xffffff);
        dirLightRef.current.intensity = 4.6;
        dirLightRef.current.position.set(6, 4, 5);
      }
      if (fillLightRef.current) {
        fillLightRef.current.color.setHex(0xf8fafc);
        fillLightRef.current.intensity = 2.4;
        fillLightRef.current.position.set(-5, -2, 5);
      }
      if (hemiLightRef.current) {
        hemiLightRef.current.color.setHex(0xffffff);
        hemiLightRef.current.groundColor.setHex(0x666666);
        hemiLightRef.current.intensity = 1.6;
      }
      if (cloudsMeshRef.current) {
        (cloudsMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.45;
      }
    } else if (earthMode === 'night') {
      // 🌙 NIGHT MODE: โลกยามค่ำคืนสมจริง (Photorealistic Black Marble with Glowing City Lights)
      if (!cache.night) {
        cache.night = createNightRealisticMaterial();
      }
      earthMeshRef.current.material = cache.night;

      // Nocturnal lighting with bright, clear glowing cities
      if (ambientLightRef.current) {
        ambientLightRef.current.color.setHex(0x333338);
        ambientLightRef.current.intensity = 1.6;
      }
      if (dirLightRef.current) {
        dirLightRef.current.color.setHex(0xfef9c3);
        dirLightRef.current.intensity = 2.4;
        dirLightRef.current.position.set(-4, 2.5, -4);
      }
      if (fillLightRef.current) {
        fillLightRef.current.color.setHex(0xe0e7ff);
        fillLightRef.current.intensity = 1.4;
        fillLightRef.current.position.set(4, -1, 4);
      }
      if (hemiLightRef.current) {
        hemiLightRef.current.color.setHex(0x555566);
        hemiLightRef.current.groundColor.setHex(0x222228);
        hemiLightRef.current.intensity = 1.2;
      }
      if (cloudsMeshRef.current) {
        (cloudsMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.25;
      }
    } else {
      // 🧭 VINTAGE MODE: โมเดลต้นแบบ (Vintage Model) - แผนที่นักสำรวจวินเทจสีทองโบราณ
      if (!cache.sample) {
        cache.sample = createVintageExplorerMaterial();
      }
      earthMeshRef.current.material = cache.sample;

      // Antique Golden Explorer warm bright lighting
      if (ambientLightRef.current) {
        ambientLightRef.current.color.setHex(0xfffaec);
        ambientLightRef.current.intensity = 2.5;
      }
      if (dirLightRef.current) {
        dirLightRef.current.color.setHex(0xffe8b8);
        dirLightRef.current.intensity = 4.4;
        dirLightRef.current.position.set(5.5, 4, 5);
      }
      if (fillLightRef.current) {
        fillLightRef.current.color.setHex(0xfff3df);
        fillLightRef.current.intensity = 2.2;
        fillLightRef.current.position.set(-4, -2, 4);
      }
      if (hemiLightRef.current) {
        hemiLightRef.current.color.setHex(0xfff4db);
        hemiLightRef.current.groundColor.setHex(0x735c33);
        hemiLightRef.current.intensity = 1.5;
      }
      if (cloudsMeshRef.current) {
        (cloudsMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.38;
      }
    }
  }, [earthMode]);

  // Layer visibility toggles
  useEffect(() => {
    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.visible = showClouds;
    }
  }, [showClouds]);

  useEffect(() => {
    if (graticulesGroupRef.current) {
      graticulesGroupRef.current.visible = showGraticules;
    }
  }, [showGraticules]);

  // Re-build Pins inside pinsGroup whenever pins, pinStyle, pinColor, or selectedPin changes
  useEffect(() => {
    if (!pinsGroupRef.current) return;
    const pinsGroup = pinsGroupRef.current;

    // Clear existing children
    while (pinsGroup.children.length > 0) {
      const child = pinsGroup.children[0];
      pinsGroup.remove(child);
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }

    const earthRadius = 1.0;
    const animItems: typeof pinAnimItemsRef.current = [];
    const arcLines: THREE.Line[] = [];

    pins.forEach((pin) => {
      const effectiveStyle: PinStyleType = pin.pinStyle || globalPinStyle;
      const effectiveColor = pin.pinColor || globalPinColor;
      const isSelected = selectedPin ? pin.id === selectedPin.id : false;
      const colorNum = parseInt(effectiveColor.replace('#', '0x'), 16);

      const pos = latLngToVector3(pin.lat, pin.lng, earthRadius * 1.003);
      const normal = pos.clone().normalize();

      const pinGroup = new THREE.Group();
      pinGroup.position.copy(pos);

      if (effectiveStyle === 'dot') {
        // ==============================================================
        // 1. สัญลักษณ์จุดสี (Pulsing Colored Dot)
        // ==============================================================
        pinGroup.lookAt(new THREE.Vector3(0, 0, 0));

        // Outer Pulsing Halo
        const haloGeo = new THREE.CircleGeometry(isSelected ? 0.038 : 0.026, 32);
        const haloMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0xffea00 : colorNum,
          transparent: true,
          opacity: isSelected ? 0.85 : 0.45,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const outerHalo = new THREE.Mesh(haloGeo, haloMat);
        pinGroup.add(outerHalo);

        // Inner Solid Dot
        const dotGeo = new THREE.CircleGeometry(isSelected ? 0.017 : 0.012, 32);
        const dotMat = new THREE.MeshBasicMaterial({
          color: colorNum,
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const innerDot = new THREE.Mesh(dotGeo, dotMat);
        pinGroup.add(innerDot);

        // Center White hotspot
        const coreGeo = new THREE.CircleGeometry(isSelected ? 0.007 : 0.005, 16);
        const coreMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const centerCore = new THREE.Mesh(coreGeo, coreMat);
        centerCore.position.z = 0.0006;
        pinGroup.add(centerCore);

        pinsGroup.add(pinGroup);

        animItems.push({
          pin,
          style: 'dot',
          halo: outerHalo,
          dot: innerDot,
        });
      } else if (effectiveStyle === 'flag') {
        // ==============================================================
        // 2. ธง (Flag Marker)
        // ==============================================================
        const poleHeight = isSelected ? 0.12 : 0.09;
        const poleGeo = new THREE.CylinderGeometry(0.0018, 0.0018, poleHeight, 12);
        const poleMat = new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          metalness: 0.85,
          roughness: 0.25,
        });
        const poleMesh = new THREE.Mesh(poleGeo, poleMat);
        poleMesh.position.y = poleHeight / 2;

        // Base ring on ground
        const baseRingGeo = new THREE.RingGeometry(0.008, 0.018, 24);
        const baseRingMat = new THREE.MeshBasicMaterial({
          color: colorNum,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
        baseRing.rotation.x = Math.PI / 2;

        // Waving Flag Banner cloth
        const flagTex = createFlagTexture(pin.code || pin.city, effectiveColor);
        const flagGeo = new THREE.PlaneGeometry(0.045, 0.024, 6, 2);
        const flagMat = new THREE.MeshBasicMaterial({
          map: flagTex,
          side: THREE.DoubleSide,
          transparent: true,
        });
        const flagBanner = new THREE.Mesh(flagGeo, flagMat);
        flagBanner.position.set(0.023, poleHeight - 0.012, 0);

        pinGroup.add(poleMesh);
        pinGroup.add(baseRing);
        pinGroup.add(flagBanner);

        // Align pinGroup pointing along the normal outwards from Earth center
        pinGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

        pinsGroup.add(pinGroup);

        animItems.push({
          pin,
          style: 'flag',
          flagBanner,
        });
      } else {
        // ==============================================================
        // 3. หมุด (Classic Pushpin / Map Pin Needle)
        // ==============================================================
        const pinHeight = isSelected ? 0.09 : 0.07;
        // Needle Shaft
        const shaftGeo = new THREE.CylinderGeometry(0.002, 0.001, pinHeight, 12);
        const shaftMat = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          metalness: 0.9,
          roughness: 0.2,
        });
        const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
        shaftMesh.position.y = pinHeight / 2;

        // Glossy Spherical Head Cap
        const headRadius = isSelected ? 0.016 : 0.012;
        const headGeo = new THREE.SphereGeometry(headRadius, 24, 24);
        const headMat = new THREE.MeshStandardMaterial({
          color: colorNum,
          metalness: 0.5,
          roughness: 0.2,
          emissive: new THREE.Color(colorNum),
          emissiveIntensity: isSelected ? 0.4 : 0.2,
        });
        const needleHead = new THREE.Mesh(headGeo, headMat);
        needleHead.position.y = pinHeight + headRadius * 0.4;

        // Base contact aura ring
        const baseRingGeo = new THREE.RingGeometry(0.008, 0.022, 24);
        const baseRingMat = new THREE.MeshBasicMaterial({
          color: colorNum,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isSelected ? 0.9 : 0.6,
          blending: THREE.AdditiveBlending,
        });
        const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
        baseRing.rotation.x = Math.PI / 2;

        pinGroup.add(shaftMesh);
        pinGroup.add(needleHead);
        pinGroup.add(baseRing);

        // Align outwards
        pinGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

        pinsGroup.add(pinGroup);

        animItems.push({
          pin,
          style: 'needle',
          needleHead,
          halo: baseRing,
        });
      }
    });

    pinAnimItemsRef.current = animItems;

    // Arcs between consecutive pins
    for (let i = 0; i < pins.length - 1; i++) {
      const v1 = latLngToVector3(pins[i].lat, pins[i].lng, earthRadius * 1.005);
      const v2 = latLngToVector3(pins[i + 1].lat, pins[i + 1].lng, earthRadius * 1.005);

      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      const dist = v1.distanceTo(v2);
      mid.normalize().multiplyScalar(earthRadius * (1.06 + dist * 0.12));

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const curvePoints = curve.getPoints(40);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const curveMat = new THREE.LineDashedMaterial({
        color: 0xffd97d,
        dashSize: 0.045,
        gapSize: 0.025,
        linewidth: 2,
        transparent: true,
        opacity: 0.8,
      });
      const line = new THREE.Line(curveGeo, curveMat);
      line.computeLineDistances();
      pinsGroup.add(line);
      arcLines.push(line);
    }
    flightArcsRef.current = arcLines;
  }, [pins, globalPinStyle, globalPinColor, selectedPin]);

  // Initialize Three.js 3D Globe scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene with solid flat background (สีพื้น)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121212);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.z = zoomLevel;
    cameraRef.current = camera;

    // 3. Renderer with antialiasing
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.75;
    renderer.setClearColor(0x121212, 1);
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting - Enhanced for high brightness & crystal-clear Earth visibility
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x666666, 1.6);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(0xffffff, 4.6);
    dirLight.position.set(6, 4, 5);
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const fillLight = new THREE.DirectionalLight(0xf8fafc, 2.4);
    fillLight.position.set(-5, -2, 5);
    scene.add(fillLight);
    fillLightRef.current = fillLight;


    // 5. Root rotating group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 6. Pins Group (isolated so we re-render pins without resetting Earth)
    const pinsGroup = new THREE.Group();
    globeGroup.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    // Initial orientation: Center on Bangkok / Tokyo coordinates
    globeGroup.rotation.y = -Math.PI / 2.2;
    globeGroup.rotation.x = 0.28;

    const earthRadius = 1.0;

    // 7. Earth Mesh (Initialized with photorealistic Earth material for Day Mode)
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const initialEarthMat = createDayRealisticMaterial();
    materialsCacheRef.current.satellite = initialEarthMat;

    const earthMesh = new THREE.Mesh(earthGeo, initialEarthMat);
    globeGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 8. Atmospheric Clouds Layer
    const cloudsGeo = new THREE.SphereGeometry(earthRadius * 1.012, 64, 64);
    const cloudsTex = loadEarthTexture(EARTH_TEXTURE_URLS.clouds);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTex,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // 9. Antique Cartographic Graticules Group
    const graticulesGroup = createGraticulesGroup(earthRadius);
    globeGroup.add(graticulesGroup);
    graticulesGroupRef.current = graticulesGroup;

    // 12. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Atmospheric cloud drift
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += delta * 0.025;
      }

      // Smooth camera lerp to target coordinate
      if (targetRotationRef.current && globeGroupRef.current) {
        const target = targetRotationRef.current;
        globeGroupRef.current.rotation.x += (target.x - globeGroupRef.current.rotation.x) * 0.06;
        globeGroupRef.current.rotation.y += (target.y - globeGroupRef.current.rotation.y) * 0.06;

        if (
          Math.abs(target.x - globeGroupRef.current.rotation.x) < 0.002 &&
          Math.abs(target.y - globeGroupRef.current.rotation.y) < 0.002
        ) {
          targetRotationRef.current = null;
        }
      } else if (autoRotateRef.current && globeGroupRef.current && !isDraggingRef.current) {
        globeGroupRef.current.rotation.y += delta * 0.07;
      }

      // Animate Pin styles
      pinAnimItemsRef.current.forEach((item, idx) => {
        const isSelected = selectedPin ? item.pin.id === selectedPin.id : false;

        if (item.style === 'dot' && item.halo && item.dot) {
          // Dot: Rhythmic blinking & pulsation
          const speed = isSelected ? 4.8 : 3.2;
          const wave = (Math.sin(time * speed + idx * 0.8) + 1) * 0.5;
          const scale = 1.0 + wave * (isSelected ? 0.35 : 0.22);
          item.halo.scale.set(scale, scale, 1);
          (item.halo.material as THREE.MeshBasicMaterial).opacity =
            (isSelected ? 0.5 : 0.25) + wave * (isSelected ? 0.45 : 0.3);
        } else if (item.style === 'flag' && item.flagBanner) {
          // Flag: Subtle fluttering in the wind
          item.flagBanner.rotation.y = Math.sin(time * 3 + idx) * 0.15;
          item.flagBanner.rotation.z = Math.cos(time * 2.5 + idx) * 0.05;
        } else if (item.style === 'needle' && item.needleHead) {
          // Pushpin: Gentle bobbing hover & aura pulse
          const bob = Math.sin(time * 2.5 + idx * 0.5) * 0.003;
          item.needleHead.position.y = (isSelected ? 0.09 : 0.07) + bob;
          if (item.halo) {
            const hWave = (Math.sin(time * 3 + idx) + 1) * 0.5;
            item.halo.scale.set(1 + hWave * 0.2, 1 + hWave * 0.2, 1);
          }
        }
      });

      // Animate flight arc motion
      flightArcsRef.current.forEach((arc, i) => {
        const mat = arc.material as THREE.LineDashedMaterial;
        mat.scale = 1 + Math.sin(time * 2 + i) * 0.12;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.innerHTML = '';
      }
      earthGeo.dispose();
      cloudsGeo.dispose();
    };
  }, []);

  // Touch & Mouse Drag Handlers for 360° Free Rotation
  const handlePointerDown = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    setAutoRotate(false);
    prevMousePosRef.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current || !globeGroupRef.current) return;
    const dx = clientX - prevMousePosRef.current.x;
    const dy = clientY - prevMousePosRef.current.y;

    globeGroupRef.current.rotation.y += dx * 0.006;
    globeGroupRef.current.rotation.x = Math.max(
      -1.4,
      Math.min(1.4, globeGroupRef.current.rotation.x + dy * 0.005)
    );

    prevMousePosRef.current = { x: clientX, y: clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Compute dynamic stats
  const uniqueContinents = Array.from(new Set(pins.map((p) => p.region))).length;
  const coveragePercent =
    pins.length === 0 ? 0 : Math.min(100, Math.round((pins.length / 30) * 100));

  return (
    <div className="flex flex-col w-full pb-28 max-w-2xl mx-auto">
      {/* Top Stats Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="bg-[#fdf3dc]/90 backdrop-blur-md rounded-2xl p-3.5 shadow-sm border border-[#d5c3b6]/80 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ece2cc]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#6f4315] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[15px]">explore</span>
              </div>
              <h1 className="font-headline-sm text-[15px] text-[#6f4315] font-bold">
                สมุดบันทึกการสำรวจโลก (3D Earth Cartography)
              </h1>
            </div>
            <span className="font-label-coord text-[10px] text-[#837469] font-bold tracking-wider">
              {earthMode === 'satellite' ? '🌍 กลางวัน (โลกสีฟ้า)' : '🌙 กลางคืน (วินเทจสีทองโบราณ)'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/85 p-2 rounded-xl border border-[#ece2cc] shadow-2xs">
              <span className="font-label-coord text-[9px] text-[#837469] block">พิกัดสำรวจ</span>
              <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                <span className="font-headline-md text-[20px] text-[#6f4315] font-bold">
                  {pins.length}
                </span>
                <span className="text-[10px] text-[#51443a]">จุดบันทึก</span>
              </div>
            </div>

            <div className="bg-white/85 p-2 rounded-xl border border-[#ece2cc] shadow-2xs">
              <span className="font-label-coord text-[9px] text-[#837469] block">ตราประทับโลก</span>
              <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                <span className="font-headline-md text-[20px] text-[#6f4315] font-bold">
                  {coveragePercent}%
                </span>
                <span className="text-[10px] text-[#51443a]">ของผืนโลก</span>
              </div>
            </div>

            <div className="bg-white/85 p-2 rounded-xl border border-[#ece2cc] shadow-2xs">
              <span className="font-label-coord text-[9px] text-[#837469] block">ข้ามผ่าน</span>
              <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                <span className="font-headline-md text-[20px] text-[#465f88] font-bold">
                  {uniqueContinents}
                </span>
                <span className="text-[10px] text-[#51443a]">ภูมิภาค</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photorealistic 3D Globe Viewport */}
      <div className="px-4 mt-1">
        <div className="relative w-full aspect-square max-h-[430px] bg-[#121212] rounded-2xl overflow-hidden shadow-2xl border border-[#d5c3b6]/50">

          {/* Three.js Canvas Container */}
          <div
            ref={containerRef}
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) =>
              e.touches[0] && handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)
            }
            onTouchMove={(e) =>
              e.touches[0] && handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
            }
            onTouchEnd={handlePointerUp}
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          />

          {/* Top Left: Active Mode Symbol Icon */}
          <div className="absolute top-3 left-3 z-10">
            <button
              type="button"
              onClick={() => {
                const next =
                  earthMode === 'satellite' ? 'night' : earthMode === 'night' ? 'sample' : 'satellite';
                setEarthMode(next);
                onToast(
                  next === 'satellite'
                    ? '☀️ โหมดกลางวัน (สีฟ้าเขียวสมจริง)'
                    : next === 'night'
                    ? '🌙 โหมดกลางคืน (แสงไฟเมือง)'
                    : '🧭 โหมดโมเดลต้นแบบ (วินเทจทองโบราณ)'
                );
              }}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/30 hover:border-[#ffd700] text-white shadow-xl flex items-center justify-center text-xl active:scale-90 transition-all cursor-pointer hover:scale-105"
              title="สลับโหมดโลก: กลางวัน ☀️ / กลางคืน 🌙 / วินเทจ 🧭"
            >
              <span>{earthMode === 'satellite' ? '☀️' : earthMode === 'night' ? '🌙' : '🧭'}</span>
            </button>
          </div>

          {/* Top Right: Settings, Zoom (+/-) & Rotation Controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10 items-end">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md text-[#ffd700] hover:text-white border border-[#d4af37]/80 hover:border-[#ffd700] shadow-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer group hover:scale-105"
              title="ตั้งค่า (ลักษณะหมุด, กริด, เมฆ, โหมด)"
            >
              <span className="material-symbols-outlined text-[21px] text-[#ffd700] group-hover:rotate-90 transition-transform duration-300">
                settings
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleZoom(-0.3)}
              className="w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/80 hover:border-white/50 border border-white/20 text-xs shadow-md active:scale-90 transition-all cursor-pointer"
              title="ซูมเข้า"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.3)}
              className="w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/80 hover:border-white/50 border border-white/20 text-xs shadow-md active:scale-90 transition-all cursor-pointer"
              title="ซูมออก"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>

            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className="w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/80 hover:border-white/50 border border-white/20 shadow-md active:scale-90 transition-all cursor-pointer"
              title={autoRotate ? 'หยุดหมุนอัตโนมัติ' : 'หมุนอัตโนมัติ'}
            >
              <span className="material-symbols-outlined text-[16px] text-[#ffdea5]">
                {autoRotate ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>

          {/* Quick Add Pin Icon Button (Bottom Right) when no pin is selected */}
          {!selectedPin && (
            <div className="absolute bottom-3 right-3 z-10">
              <button
                type="button"
                onClick={() => setIsAddPinOpen(true)}
                className="w-10 h-10 rounded-full bg-[#6f4315] hover:bg-[#8b5a2b] text-white border border-[#ffd700]/70 shadow-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer hover:scale-105"
                title="ปักหมุดการเดินทาง"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add_location_alt
                </span>
              </button>
            </div>
          )}

          {/* Floating Glassmorphism Destination Card (Shown when pin is selected, with close button) */}
          {selectedPin && (
            <div className="absolute bottom-3 inset-x-3 bg-white/94 backdrop-blur-xl rounded-xl p-2.5 shadow-2xl border border-white/60 flex items-center justify-between transition-all duration-300 z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={
                    selectedPin.imageUrl ||
                    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={selectedPin.city}
                  className="w-12 h-12 rounded-lg object-cover shadow-sm border border-[#ece2cc] shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-coord text-[9px] text-[#837469] uppercase font-bold">
                      หมุดบันทึกพิกัด
                    </span>
                    <span className="font-label-stamp text-[8px] bg-[#ffdea5] text-[#261900] px-1.5 py-0.5 rounded font-bold shadow-2xs">
                      {selectedPin.status}
                    </span>
                    <span className="text-[10px]">
                      {selectedPin.pinStyle === 'flag'
                        ? '🚩'
                        : selectedPin.pinStyle === 'needle'
                        ? '📍'
                        : '🔘'}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-sm text-[#201b0e] font-bold leading-tight truncate">
                    {selectedPin.city}, {selectedPin.country}
                  </h3>
                  <p className="font-label-coord text-[9px] text-[#465f88] font-semibold mt-0.5 truncate">
                    {selectedPin.date} • {selectedPin.latLngDisplay}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigateTab('passport')}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#fdf3dc] text-[#6f4315] hover:bg-[#f2e7d1] active:scale-95 transition-all border border-[#d5c3b6]/60 shadow-xs cursor-pointer"
                  title="เปิดดูตราประทับในพาสปอร์ต"
                >
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  <span className="font-label-ui text-[9px] font-semibold">พาสปอร์ต</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPin(null)}
                  className="w-7 h-7 rounded-lg text-[#837469] hover:text-[#201b0e] hover:bg-black/5 flex items-center justify-center cursor-pointer transition-colors"
                  title="ปิดการแสดงการ์ดหมุด"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center Live Coordinates Gyro Indicator */}
        <div className="mt-2.5 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-2 bg-[#fdf3dc] hover:bg-[#f5e7c8] px-3.5 py-1 rounded-full border border-[#d5c3b6] shadow-xs transition-colors cursor-pointer"
            title="แตะเพื่อเปิดการตั้งค่า"
          >
            <span className="text-xs">
              {earthMode === 'satellite' ? '☀️' : earthMode === 'night' ? '🌙' : '🧭'}
            </span>
            <span className="material-symbols-outlined text-[14px] text-[#6f4315] animate-spin">
              explore
            </span>
            <span className="font-label-coord text-[11px] text-[#6f4315] font-bold">
              {selectedPin?.latLngDisplay || "35°41' N • 139°41' E"}
            </span>
          </button>
        </div>
      </div>

      {/* Modern Search & Pin Bar */}
      <div className="px-4 mt-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#837469] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="ค้นหาประเทศหรือเมืองเพื่อปักหมุด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-1 focus:ring-[#6f4315] shadow-xs placeholder:text-[#837469]"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsAddPinOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#8b5a2b] text-white font-title-md text-xs shadow-sm hover:bg-[#6f4315] active:scale-95 transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
            <span>+ ปักหมุด</span>
          </button>
        </form>
      </div>

      {/* Explorer Pins Horizontal List Carousel */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#6f4315] text-[18px]">
              location_on
            </span>
            <span className="font-headline-sm text-sm text-[#6f4315] font-bold">
              จุดหมายการเดินทางล่าสุด ({pins.length})
            </span>
          </div>
          <span className="font-label-coord text-[10px] text-[#837469]">
            แตะหมุดเพื่อหมุนโลกไปยังพิกัด
          </span>
        </div>

        {pins.length > 0 ? (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {pins.map((pin) => {
              const isSelected = selectedPin ? pin.id === selectedPin.id : false;
              return (
                <div
                  key={pin.id}
                  onClick={() => handleSelectPin(pin)}
                  className={`min-w-[150px] p-2 rounded-xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md shrink-0 ${
                    isSelected
                      ? 'border-[#6f4315] ring-2 ring-[#ffdcc1] bg-[#fff8f0]'
                      : 'border-[#d5c3b6]/70'
                  }`}
                >
                  <div className="relative w-full h-16 rounded-lg overflow-hidden mb-1.5 bg-[#fdf3dc]">
                    <img
                      src={
                        pin.imageUrl ||
                        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={pin.city}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 bg-black/65 text-white text-[8px] font-label-coord px-1 rounded font-bold">
                      {pin.code}
                    </span>
                    <span className="absolute bottom-1 right-1 text-xs">
                      {pin.pinStyle === 'flag' ? '🚩' : pin.pinStyle === 'needle' ? '📍' : '🔘'}
                    </span>
                  </div>

                  <h4 className="font-headline-sm text-xs text-[#201b0e] font-bold truncate">
                    {pin.city}
                  </h4>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-label-coord text-[8px] text-[#837469] truncate">
                      {pin.country}
                    </span>
                    <span className="font-label-coord text-[8px] text-[#465f88] font-bold">
                      {pin.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white border border-[#d5c3b6]/60 text-center space-y-1">
            <span className="font-label-coord text-[10px] text-[#837469] block">
              ยังไม่มีจุดหมายในบันทึก
            </span>
            <p className="font-body-sm text-xs text-[#51443a]">
              กดปุ่ม "+ ปักหมุด" ด้านบนเพื่อเพิ่มพิกัดแรกบนลูกโลก
            </p>
          </div>
        )}
      </div>

      {/* Add Pin Modal */}
      <AddPinModal
        isOpen={isAddPinOpen}
        onClose={() => setIsAddPinOpen(false)}
        onAddPin={(newPin) => {
          onAddPin(newPin);
          setSelectedPin(newPin);
          focusOnCoordinates(newPin.lat, newPin.lng);
          onToast(`ปักหมุดสำเร็จ: ${newPin.city}, ${newPin.country}!`);
        }}
      />

      {/* ========================================================================= */}
      {/* Globe & Pin Settings Modal (ตั้งค่าที่เป็นรูปฟันเฟืองมุมบน) */}
      {/* ========================================================================= */}
      {/* Globe & Pin Settings Modal - Minimal & Compact (กล่องกะทัดรัด เรียบง่าย) */}
      {/* ========================================================================= */}
      {isSettingsOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSettingsOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/55 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-[270px] bg-white/95 rounded-2xl shadow-xl border border-[#e5dcd3] overflow-hidden flex flex-col">
            {/* Minimal Header */}
            <div className="px-3 py-2 bg-[#fbf7f0] border-b border-[#f0e9df] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#6f4315] text-[16px]">tune</span>
                <h3 className="font-title-md text-xs text-[#2a221b] font-bold">
                  ตั้งค่าแผนที่โลกและหมุด
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-[#f2eae0] text-[#7d7064] hover:text-[#2a221b] flex items-center justify-center transition-colors cursor-pointer"
                title="ปิด"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            </div>

            {/* Modal Body - Simple & Compact */}
            <div className="p-2.5 space-y-2.5 text-[11px]">
              {/* Section 1: โหมดการแสดงผลโลก */}
              <div>
                <span className="text-[10px] font-semibold text-[#8a7a6d] block mb-1 uppercase tracking-wider">
                  โหมดโลก
                </span>
                <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#f5ede2] rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setEarthMode('satellite');
                      onToast('☀️ โหมดกลางวัน');
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      earthMode === 'satellite'
                        ? 'bg-white text-[#2a221b] font-bold shadow-xs'
                        : 'text-[#7d7064] hover:text-[#2a221b]'
                    }`}
                  >
                    <span>☀️</span>
                    <span>กลางวัน</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEarthMode('night');
                      onToast('🌙 โหมดกลางคืน');
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      earthMode === 'night'
                        ? 'bg-[#1b2234] text-white font-bold shadow-xs'
                        : 'text-[#7d7064] hover:text-[#2a221b]'
                    }`}
                  >
                    <span>🌙</span>
                    <span>กลางคืน</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEarthMode('sample');
                      onToast('🧭 โหมดวินเทจ');
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      earthMode === 'sample'
                        ? 'bg-[#dcb974] text-[#3e2709] font-bold shadow-xs'
                        : 'text-[#7d7064] hover:text-[#2a221b]'
                    }`}
                  >
                    <span>🧭</span>
                    <span>วินเทจ</span>
                  </button>
                </div>
              </div>

              {/* Section 2: ปรับแต่งลักษณะและสีหมุด */}
              <div className="pt-2 border-t border-[#f0e9df] space-y-1.5">
                <span className="text-[10px] font-semibold text-[#8a7a6d] block uppercase tracking-wider">
                  รูปแบบหมุด
                </span>
                <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#f5ede2] rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalPinStyle('dot');
                      onToast('รูปแบบ: จุด');
                    }}
                    className={`py-1.5 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      globalPinStyle === 'dot'
                        ? 'bg-white text-[#6f4315] font-bold shadow-xs'
                        : 'text-[#7d7064] hover:text-[#2a221b]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">radio_button_checked</span>
                    <span>จุด</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGlobalPinStyle('flag');
                      onToast('รูปแบบ: ธง');
                    }}
                    className={`py-1.5 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      globalPinStyle === 'flag'
                        ? 'bg-white text-[#6f4315] font-bold shadow-xs'
                        : 'text-[#7d7064] hover:text-[#2a221b]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">flag</span>
                    <span>ธง</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGlobalPinStyle('needle');
                      onToast('รูปแบบ: หมุด');
                    }}
                    className={`py-1.5 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      globalPinStyle === 'needle'
                        ? 'bg-white text-[#6f4315] font-bold shadow-xs'
                        : 'text-[#7d7064] hover:text-[#2a221b]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">push_pin</span>
                    <span>หมุด</span>
                  </button>
                </div>

                {/* Pin Color Mini Bar */}
                <div className="flex items-center justify-between px-1 pt-0.5">
                  <span className="text-[10px] text-[#8a7a6d]">สีหมุด</span>
                  <div className="flex items-center gap-1.5">
                    {PIN_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          setGlobalPinColor(c.hex);
                          onToast(`เปลี่ยนสีหมุด: ${c.name}`);
                        }}
                        style={{ backgroundColor: c.hex }}
                        className={`w-4 h-4 rounded-full transition-transform cursor-pointer relative ${
                          globalPinColor === c.hex
                            ? 'ring-2 ring-offset-1 ring-[#6f4315] scale-110'
                            : 'opacity-75 hover:opacity-100 hover:scale-105'
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: การแสดงผลเพิ่มเติม (เมฆ, กริด, หมุน) */}
              <div className="pt-2 border-t border-[#f0e9df] space-y-1">
                <span className="text-[10px] font-semibold text-[#8a7a6d] block mb-1 uppercase tracking-wider">
                  การแสดงผล
                </span>

                <div className="space-y-1 bg-[#faf6ef] p-1.5 rounded-xl border border-[#ece4d8]">
                  {/* Clouds */}
                  <div className="flex items-center justify-between px-1 py-0.5">
                    <span className="text-[11px] text-[#3c3127] flex items-center gap-1.5">
                      <span className="text-xs">☁️</span> เมฆบรรยากาศ
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowClouds(!showClouds);
                        onToast(!showClouds ? 'เปิดเมฆ' : 'ปิดเมฆ');
                      }}
                      className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
                        showClouds ? 'bg-[#6f4315]' : 'bg-[#d3c8be]'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all shadow-xs ${
                          showClouds ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Grid */}
                  <div className="flex items-center justify-between px-1 py-0.5">
                    <span className="text-[11px] text-[#3c3127] flex items-center gap-1.5">
                      <span className="text-xs">🌐</span> เส้นพิกัดกริด
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowGraticules(!showGraticules);
                        onToast(!showGraticules ? 'เปิดกริด' : 'ปิดกริด');
                      }}
                      className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
                        showGraticules ? 'bg-[#6f4315]' : 'bg-[#d3c8be]'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all shadow-xs ${
                          showGraticules ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Auto Rotate */}
                  <div className="flex items-center justify-between px-1 py-0.5">
                    <span className="text-[11px] text-[#3c3127] flex items-center gap-1.5">
                      <span className="text-xs">🔄</span> หมุนอัตโนมัติ
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAutoRotate(!autoRotate);
                        onToast(!autoRotate ? 'เปิดหมุน' : 'หยุดหมุน');
                      }}
                      className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
                        autoRotate ? 'bg-[#6f4315]' : 'bg-[#d3c8be]'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all shadow-xs ${
                          autoRotate ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Modal Footer */}
            <div className="p-2 bg-[#fbf7f0] border-t border-[#f0e9df]">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-1.5 rounded-lg bg-[#6f4315] hover:bg-[#58340f] text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs active:scale-98"
              >
                <span>เสร็จสิ้น</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
