import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GlobePin, PinStyleType, TabType } from '../types';
import { AddPinModal, AddPinInitialData } from './AddPinModal';
import {
  EARTH_TEXTURE_URLS,
  loadEarthTexture,
  createProceduralEarthTexture,
  createGraticulesGroup,
  latLngToVector3,
} from '../utils/earthTextures';
import {
  WorldLocation,
  POPULAR_WORLD_LOCATIONS,
  searchLocalGazetteer,
  searchWorldwideGeocode,
  formatCoordinates,
  getLocationPhoto,
} from '../utils/worldLocations';

interface GlobeViewProps {
  pins: GlobePin[];
  onAddPin: (pin: GlobePin) => void;
  onUpdatePinDate?: (pinOrStampId: string, newDate: string) => void;
  onDeletePin?: (pinId: string) => void;
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
  onUpdatePinDate,
  onDeletePin,
  onNavigateTab,
  onToast,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Default selected pin
  const [selectedPin, setSelectedPin] = useState<GlobePin | null>(pins[0] || null);
  const [isEditingPinDate, setIsEditingPinDate] = useState<boolean>(false);
  const [editingPinDateText, setEditingPinDateText] = useState<string>('');
  const [pinToDelete, setPinToDelete] = useState<GlobePin | null>(null);

  // Card display mode: 'normal' | 'collapsed' | 'full' (กดให้ย่อไว้ หรือขยายแบบเต็มได้)
  const [cardMode, setCardMode] = useState<'normal' | 'collapsed' | 'full'>('normal');
  const [isGlobeExpanded, setIsGlobeExpanded] = useState<boolean>(false);

  // Earth visual mode: 'satellite' = Day (Realistic), 'night' = Night (Realistic City Lights), 'sample' = Vintage Cartography
  const [earthMode, setEarthMode] = useState<EarthStyleMode>('satellite');

  // Pin appearance customization
  const [globalPinStyle, setGlobalPinStyle] = useState<PinStyleType>('dot');
  const [globalPinColor, setGlobalPinColor] = useState<string>('#ffb703');

  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showClouds, setShowClouds] = useState<boolean>(true);
  const [showGraticules, setShowGraticules] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<WorldLocation[]>([]);
  const [activeTargetSpot, setActiveTargetSpot] = useState<WorldLocation | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isAddPinOpen, setIsAddPinOpen] = useState<boolean>(false);
  const [pinModalInitialData, setPinModalInitialData] = useState<AddPinInitialData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(2.55);

  // Three.js instances stored in refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const targetBeaconGroupRef = useRef<THREE.Group | null>(null);
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

  // Handle globe size expansion resize update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current && rendererRef.current && cameraRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [isGlobeExpanded]);

  // Focus smooth rotation onto a coordinate
  const focusOnCoordinates = useCallback((lat: number, lng: number) => {
    const targetY = -((lng * Math.PI) / 180) - Math.PI / 2;
    const targetX = (lat * Math.PI) / 180;
    targetRotationRef.current = { x: targetX, y: targetY };
    setAutoRotate(false);
  }, []);

  const handleSelectPin = (pin: GlobePin) => {
    setSelectedPin(pin);
    setActiveTargetSpot(null);
    focusOnCoordinates(pin.lat, pin.lng);
    onToast(`พิกัด: ${pin.city}, ${pin.country} (${pin.latLngDisplay})`);
  };

  // Select a 100% matched real-world location and link/rotate directly on 3D Earth
  const handleSelectLocation = useCallback(
    (loc: WorldLocation) => {
      setActiveTargetSpot(loc);
      setSelectedPin(null);
      setSearchQuery(`${loc.nameTh || loc.name} (${loc.countryTh || loc.country})`);
      setShowDropdown(false);
      focusOnCoordinates(loc.lat, loc.lng);
      onToast(
        `หมุนโลกไปยังพิกัดจริง: ${loc.nameTh || loc.name} • ${formatCoordinates(loc.lat, loc.lng)}`
      );
    },
    [focusOnCoordinates, onToast]
  );

  // Directly pin a searched location into the user's explorer log
  const handlePinFoundLocation = (loc: WorldLocation) => {
    const newPin: GlobePin = {
      id: `pin-${Date.now()}`,
      code: loc.code || 'LOC',
      city: loc.nameTh || loc.name,
      country: loc.countryTh || loc.country,
      region: loc.category,
      date: new Date().toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      lat: loc.lat,
      lng: loc.lng,
      latLngDisplay: formatCoordinates(loc.lat, loc.lng),
      categoryTag: loc.category,
      isStamped: true,
      memoriesCount: 1,
      imageUrl: getLocationPhoto(loc.nameTh || loc.name, loc.countryTh || loc.country),
      status: 'VERIFIED',
      pinStyle: globalPinStyle,
      pinColor: globalPinColor,
    };

    onAddPin(newPin);
    setSelectedPin(newPin);
    setActiveTargetSpot(null);
    onToast(`ปักหมุดสำเร็จ: ${newPin.city}, ${newPin.country} พิกัด ${newPin.latLngDisplay}`);
  };

  // Delete pin request handler -> Opens confirmation dialog with Yes or No
  const handleRequestDeletePin = (e: React.MouseEvent, pin: GlobePin) => {
    e.stopPropagation();
    setPinToDelete(pin);
  };

  const handleConfirmDeletePin = () => {
    if (!pinToDelete) return;
    onDeletePin?.(pinToDelete.id);
    if (selectedPin && selectedPin.id === pinToDelete.id) {
      const remaining = pins.filter((p) => p.id !== pinToDelete.id);
      setSelectedPin(remaining[0] || null);
    }
    onToast(`ลบรายการหมุด "${pinToDelete.city}, ${pinToDelete.country}" สำเร็จ`);
    setPinToDelete(null);
  };

  // Open Add Pin Modal with completely linked search data (เมื่อกดปักหมุด ให้ลิ้งค์ข้อมูลของการค้นหาต่างๆไปใส่ให้ครบถ้วน)
  const handleOpenAddPin = useCallback(() => {
    let targetData: AddPinInitialData | null = null;

    if (activeTargetSpot) {
      targetData = {
        city: activeTargetSpot.nameTh || activeTargetSpot.name,
        country: activeTargetSpot.countryTh || activeTargetSpot.country,
        region: activeTargetSpot.category || 'พิกัดโลกจริง 100%',
        lat: activeTargetSpot.lat,
        lng: activeTargetSpot.lng,
        categoryTag: activeTargetSpot.category || 'พิกัดสำรวจโลกจริง',
        code: activeTargetSpot.code,
        flag: activeTargetSpot.flag,
        sourceQuery: activeTargetSpot.nameTh || activeTargetSpot.name,
      };
    } else if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const local = searchLocalGazetteer(q);
      if (local.length > 0) {
        const item = local[0];
        targetData = {
          city: item.nameTh || item.name,
          country: item.countryTh || item.country,
          region: item.category || 'พิกัดโลกจริง',
          lat: item.lat,
          lng: item.lng,
          categoryTag: item.category || 'พิกัดสำรวจ',
          code: item.code,
          flag: item.flag,
          sourceQuery: q,
        };
      } else {
        const parts = q.split(/[,/—\-]+/).map((s) => s.trim()).filter(Boolean);
        targetData = {
          city: parts[0] || q,
          country: parts[1] || 'สากล (Global)',
          region: 'พิกัดสำรวจใหม่',
          lat: 13.7563,
          lng: 100.5018,
          categoryTag: 'การค้นพบใหม่',
          sourceQuery: q,
        };
      }
    } else if (selectedPin) {
      targetData = {
        city: selectedPin.city,
        country: selectedPin.country,
        region: selectedPin.region,
        lat: selectedPin.lat,
        lng: selectedPin.lng,
        categoryTag: selectedPin.categoryTag,
        code: selectedPin.code,
      };
    }

    setPinModalInitialData(targetData);
    setIsAddPinOpen(true);
  }, [activeTargetSpot, searchQuery, selectedPin]);

  // Handle live search input change (Instant local gazetteer + debounced 100% geocoding)
  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    const trimmed = val.trim();
    if (!trimmed) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // 1. Instant match in local gazetteer
    const local = searchLocalGazetteer(trimmed);

    // Also include any user pins matching
    const matchingPins: WorldLocation[] = pins
      .filter(
        (p) =>
          p.city.toLowerCase().includes(trimmed.toLowerCase()) ||
          p.country.toLowerCase().includes(trimmed.toLowerCase()) ||
          p.code.toLowerCase() === trimmed.toLowerCase()
      )
      .map((p) => ({
        id: p.id,
        name: p.city,
        nameTh: p.city,
        country: p.country,
        countryTh: p.country,
        code: p.code,
        lat: p.lat,
        lng: p.lng,
        flag: '📍',
        category: 'หมุดของคุณ',
      }));

    const combined = [...matchingPins, ...local];
    setSearchResults(combined);
    setShowDropdown(true);
  };

  // 100% Accurate Search Submit: searches gazetteer, user pins, and live worldwide geocoding
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);

    // 1. Check user pins
    const pinMatch = pins.find(
      (p) =>
        p.city.toLowerCase().includes(query.toLowerCase()) ||
        p.country.toLowerCase().includes(query.toLowerCase()) ||
        p.code.toLowerCase() === query.toLowerCase()
    );
    if (pinMatch) {
      handleSelectPin(pinMatch);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    // 2. Query 100% Worldwide Geocoding and Gazetteer
    const results = await searchWorldwideGeocode(query);
    setIsSearching(false);

    if (results.length > 0) {
      handleSelectLocation(results[0]);
    } else {
      onToast(`ค้นหา "${query}" ไม่พบพิกัด กรุณาลองใช้ชื่อเมืองหรือประเทศ`);
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

  // Re-build Target Beacon inside targetBeaconGroup whenever activeTargetSpot changes
  useEffect(() => {
    if (!targetBeaconGroupRef.current) return;
    const group = targetBeaconGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }

    if (!activeTargetSpot) return;

    const earthRadius = 1.0;
    const pos = latLngToVector3(activeTargetSpot.lat, activeTargetSpot.lng, earthRadius * 1.008);
    const normal = pos.clone().normalize();

    const beacon = new THREE.Group();
    beacon.position.copy(pos);

    // Glowing Radar Target Rings
    const ringGeo = new THREE.RingGeometry(0.018, 0.038, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    beacon.add(ring);

    // Inner ruby pulse core
    const coreGeo = new THREE.CircleGeometry(0.012, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xef233c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.z = 0.001;
    beacon.add(core);

    // Pin needle stem
    const needleStemGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.045, 12);
    const needleStemMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stem = new THREE.Mesh(needleStemGeo, needleStemMat);
    stem.position.y = 0.022;

    const pinSubGroup = new THREE.Group();
    pinSubGroup.add(stem);
    pinSubGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

    beacon.lookAt(new THREE.Vector3(0, 0, 0));
    group.add(beacon);
    group.add(pinSubGroup);
  }, [activeTargetSpot]);

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

    // 10. 100% Real-World Target Beacon Group
    const targetBeaconGroup = new THREE.Group();
    globeGroup.add(targetBeaconGroup);
    targetBeaconGroupRef.current = targetBeaconGroup;

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

      // Animate Target Beacon pulse
      if (targetBeaconGroupRef.current && targetBeaconGroupRef.current.children.length > 0) {
        const beacon = targetBeaconGroupRef.current.children[0] as THREE.Group;
        if (beacon && beacon.children[0]) {
          const ring = beacon.children[0] as THREE.Mesh;
          const wave = (Math.sin(time * 5) + 1) * 0.5;
          const s = 1.0 + wave * 0.35;
          ring.scale.set(s, s, 1);
          if (ring.material) {
            (ring.material as THREE.MeshBasicMaterial).opacity = 0.45 + wave * 0.5;
          }
        }
      }

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
        <div
          className={`relative w-full ${
            isGlobeExpanded ? 'h-[520px] sm:h-[580px]' : 'aspect-square max-h-[430px]'
          } bg-[#121212] rounded-2xl overflow-hidden shadow-2xl border border-[#d5c3b6]/50 transition-all duration-500`}
        >

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

            {/* Expand / Collapse Globe Viewport */}
            <button
              type="button"
              onClick={() => {
                setIsGlobeExpanded(!isGlobeExpanded);
                onToast(isGlobeExpanded ? 'ย่อมุมมองลูกโลก' : 'ขยายมุมมองลูกโลกแบบเต็ม');
              }}
              className="w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/80 hover:border-white/50 border border-white/20 shadow-md active:scale-90 transition-all cursor-pointer"
              title={isGlobeExpanded ? 'ย่อลูกโลก' : 'ขยายลูกโลกแบบเต็ม'}
            >
              <span className="material-symbols-outlined text-[16px] text-[#ffd700]">
                {isGlobeExpanded ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>
          </div>

          {/* Quick Add Pin Icon Button (Bottom Right) when no pin is selected */}
          {!selectedPin && (
            <div className="absolute bottom-3 right-3 z-10">
              <button
                type="button"
                onClick={handleOpenAddPin}
                className="w-10 h-10 rounded-full bg-[#6f4315] hover:bg-[#8b5a2b] text-white border border-[#ffd700]/70 shadow-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer hover:scale-105"
                title="ปักหมุดการเดินทาง"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add_location_alt
                </span>
              </button>
            </div>
          )}

          {/* Floating Glassmorphism Target Location Card (Shown when a 100% real location is searched) */}
          {activeTargetSpot && !selectedPin && (
            <div className="absolute bottom-3 inset-x-3 bg-[#1e1913]/94 text-white backdrop-blur-xl rounded-xl p-3 shadow-2xl border border-[#ffdea5]/60 flex items-center justify-between transition-all duration-300 z-10 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-lg bg-[#ffdea5]/20 border border-[#ffdea5]/50 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                  {activeTargetSpot.flag}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-label-coord text-[8px] bg-[#ffdea5] text-[#261900] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                      พิกัดโลกจริง 100%
                    </span>
                    <span className="font-label-coord text-[9px] text-[#ffd700] font-semibold truncate">
                      {activeTargetSpot.category}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-sm text-[#ffdea5] font-bold leading-tight truncate">
                    {activeTargetSpot.nameTh || activeTargetSpot.name}, {activeTargetSpot.countryTh || activeTargetSpot.country}
                  </h3>
                  <p className="font-label-coord text-[10px] text-[#e0d6c3] font-semibold mt-0.5 truncate">
                    LAT/LNG: {formatCoordinates(activeTargetSpot.lat, activeTargetSpot.lng)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePinFoundLocation(activeTargetSpot)}
                  className="px-3 py-2 rounded-lg bg-[#ffdea5] text-[#261900] hover:bg-[#ffe7be] active:scale-95 transition-all font-title-md text-xs font-bold shadow-md cursor-pointer flex items-center gap-1"
                  title="บันทึกปักหมุดพิกัดนี้ทันที"
                >
                  <span className="material-symbols-outlined text-[16px]">add_location</span>
                  <span>ปักหมุดที่นี่</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTargetSpot(null)}
                  className="w-7 h-7 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
                  title="ปิดการแสดงผล"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Floating Glassmorphism Destination Card - 1. COLLAPSED MODE (ย่อไว้: แถบเล็กกะทัดรัด เปิดมุมมองลูกโลก) */}
          {selectedPin && cardMode === 'collapsed' && (
            <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 bg-white/94 backdrop-blur-xl rounded-full px-3 py-1.5 shadow-2xl border border-white/70 flex items-center justify-between transition-all duration-300 z-10 animate-in fade-in slide-in-from-bottom-2">
              <div
                onClick={() => setCardMode('normal')}
                className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                title="แตะเพื่อเปิดดูรายละเอียด"
              >
                <span className="text-sm shrink-0">
                  {selectedPin.pinStyle === 'flag'
                    ? '🚩'
                    : selectedPin.pinStyle === 'needle'
                    ? '📍'
                    : '🔘'}
                </span>
                <span className="font-headline-sm text-xs text-[#201b0e] font-bold truncate">
                  {selectedPin.city}, {selectedPin.country}
                </span>
                <span className="font-label-coord text-[9px] bg-[#fdf3dc] text-[#6f4315] px-1.5 py-0.2 rounded font-semibold shrink-0 border border-[#d5c3b6]/60">
                  {selectedPin.date}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => {
                    setCardMode('normal');
                    onToast('คืนค่าขนาดการ์ดปกติ');
                  }}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#fdf3dc] hover:bg-[#ffdea5] text-[#6f4315] text-[10px] font-bold border border-[#d5c3b6]/60 transition-all cursor-pointer shadow-2xs"
                  title="คืนค่าขนาดปกติ"
                >
                  <span className="material-symbols-outlined text-[13px]">expand_less</span>
                  <span>ปกติ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCardMode('full');
                    onToast('ขยายการ์ดแบบเต็ม');
                  }}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#6f4315] hover:bg-[#8b5a2b] text-white text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                  title="ขยายแบบเต็ม (Full View)"
                >
                  <span className="material-symbols-outlined text-[13px]">open_in_full</span>
                  <span>ขยายเต็ม</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPin(null)}
                  className="w-6 h-6 rounded-full text-[#837469] hover:text-[#201b0e] hover:bg-black/5 flex items-center justify-center cursor-pointer transition-colors"
                  title="ปิดการ์ด"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Floating Glassmorphism Destination Card - 2. NORMAL MODE (ปกติ + ปุ่มย่อไว้ / ขยายเต็ม) */}
          {selectedPin && cardMode === 'normal' && (
            <div className="absolute bottom-3 inset-x-3 bg-white/94 backdrop-blur-xl rounded-xl p-2.5 shadow-2xl border border-white/60 flex items-center justify-between transition-all duration-300 z-10 animate-in fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={getLocationPhoto(selectedPin.city, selectedPin.country, selectedPin.imageUrl)}
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
                  {isEditingPinDate ? (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="text"
                        value={editingPinDateText}
                        onChange={(e) => setEditingPinDateText(e.target.value)}
                        placeholder="เช่น 14 ต.ค. 2026"
                        className="px-2 py-0.5 text-[10px] bg-white rounded border border-[#6f4315] text-[#201b0e] font-semibold focus:outline-none w-24"
                        autoFocus
                      />
                      <input
                        type="date"
                        onChange={(e) => {
                          if (e.target.value) {
                            const d = new Date(e.target.value);
                            const thaiMonths = [
                              'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                              'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
                            ];
                            const formatted = `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear()}`;
                            setEditingPinDateText(formatted);
                          }
                        }}
                        className="w-6 h-5 p-0 bg-white rounded border border-[#d5c3b6] text-[#6f4315] cursor-pointer"
                        title="เลือกวันที่จากปฏิทิน"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = editingPinDateText.trim();
                          if (trimmed) {
                            onUpdatePinDate?.(selectedPin.id, trimmed);
                            setSelectedPin((prev) => (prev ? { ...prev, date: trimmed } : null));
                            setIsEditingPinDate(false);
                            onToast(`แก้ไขวันที่บันทึกพิกัดเป็น "${trimmed}" สำเร็จ`);
                          }
                        }}
                        className="px-2 py-0.5 rounded text-[9px] bg-[#6f4315] hover:bg-[#8b5a2b] text-white font-bold cursor-pointer"
                      >
                        บันทึก
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingPinDate(false)}
                        className="px-1.5 py-0.5 rounded text-[9px] bg-[#ece2cc] text-[#51443a] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPinDateText(selectedPin.date);
                          setIsEditingPinDate(true);
                        }}
                        className="font-label-coord text-[9px] text-[#6f4315] font-semibold inline-flex items-center gap-0.5 bg-[#fdf3dc] hover:bg-[#ffeed3] px-1.5 py-0.2 rounded border border-[#d5c3b6]/60 cursor-pointer transition-colors"
                        title="คลิกเพื่อแก้ไขวันที่บันทึกพิกัด"
                      >
                        <span>{selectedPin.date}</span>
                        <span className="material-symbols-outlined text-[10px]">edit</span>
                      </button>
                      <span className="text-[8px] text-[#837469]">•</span>
                      <span className="font-label-coord text-[9px] text-[#465f88] font-semibold truncate">
                        {selectedPin.latLngDisplay}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2 shrink-0">
                {/* ปุ่มย่อไว้ (Collapse) */}
                <button
                  type="button"
                  onClick={() => {
                    setCardMode('collapsed');
                    onToast('ย่อการ์ดไว้เรียบร้อย');
                  }}
                  className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#f5ede2] text-[#6f4315] hover:bg-[#ece2cc] active:scale-95 transition-all border border-[#d5c3b6]/60 shadow-2xs cursor-pointer"
                  title="กดให้ย่อไว้ (เปิดมุมมองลูกโลก)"
                >
                  <span className="material-symbols-outlined text-[16px]">unfold_less</span>
                  <span className="font-label-ui text-[8.5px] font-bold">ย่อไว้</span>
                </button>

                {/* ปุ่มขยายแบบเต็ม (Expand to Full) */}
                <button
                  type="button"
                  onClick={() => {
                    setCardMode('full');
                    onToast('ขยายการ์ดแบบเต็ม');
                  }}
                  className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#fdf3dc] text-[#6f4315] hover:bg-[#ffdea5] active:scale-95 transition-all border border-[#d5c3b6]/60 shadow-2xs cursor-pointer"
                  title="กดขยายแบบเต็ม"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_full</span>
                  <span className="font-label-ui text-[8.5px] font-bold">ขยายเต็ม</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('passport')}
                  className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#fdf3dc] text-[#6f4315] hover:bg-[#f2e7d1] active:scale-95 transition-all border border-[#d5c3b6]/60 shadow-2xs cursor-pointer"
                  title="เปิดดูตราประทับในพาสปอร์ต"
                >
                  <span className="material-symbols-outlined text-[16px]">menu_book</span>
                  <span className="font-label-ui text-[8.5px] font-semibold">พาสปอร์ต</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRequestDeletePin(e, selectedPin)}
                  className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#fff0f0] text-[#ba1a1a] hover:bg-[#ffe2e2] active:scale-95 transition-all border border-[#ba1a1a]/30 shadow-2xs cursor-pointer"
                  title="ลบหมุดนี้"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span className="font-label-ui text-[8.5px] font-semibold">ลบ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPin(null)}
                  className="w-6 h-6 rounded-lg text-[#837469] hover:text-[#201b0e] hover:bg-black/5 flex items-center justify-center cursor-pointer transition-colors"
                  title="ปิดการแสดงการ์ดหมุด"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Floating Glassmorphism Destination Card - 3. FULL EXPANDED MODE (ขยายแบบเต็ม: ดูภาพใหญ่ รายละเอียดครบถ้วน) */}
          {selectedPin && cardMode === 'full' && (
            <div className="absolute inset-x-3 bottom-3 top-10 bg-white/96 backdrop-blur-2xl rounded-2xl p-3 shadow-2xl border border-white/80 flex flex-col justify-between transition-all duration-300 z-20 animate-in fade-in zoom-in-95 overflow-hidden">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-[#ece2cc] shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-label-stamp text-[8.5px] bg-[#ffdea5] text-[#261900] px-2 py-0.5 rounded font-bold shadow-2xs shrink-0">
                    {selectedPin.status}
                  </span>
                  <span className="font-label-coord text-[9.5px] text-[#837469] font-bold uppercase truncate">
                    {selectedPin.region || 'WORLD PIN'} • NO. {selectedPin.code}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {/* ปุ่มย่อกลับเป็นปกติ */}
                  <button
                    type="button"
                    onClick={() => {
                      setCardMode('normal');
                      onToast('ย่อกลับขนาดปกติ');
                    }}
                    className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-[#f5ede2] hover:bg-[#ece2cc] text-[#6f4315] text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                    title="ย่อกลับขนาดปกติ"
                  >
                    <span className="material-symbols-outlined text-[14px]">close_fullscreen</span>
                    <span>ย่อกลับ</span>
                  </button>

                  {/* ปุ่มย่อเล็กสุด */}
                  <button
                    type="button"
                    onClick={() => {
                      setCardMode('collapsed');
                      onToast('ย่อไว้เป็นแถบเล็ก');
                    }}
                    className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-[#f5ede2] hover:bg-[#ece2cc] text-[#6f4315] text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                    title="กดให้ย่อไว้เป็นแถบเล็ก"
                  >
                    <span className="material-symbols-outlined text-[14px]">unfold_less</span>
                    <span>ย่อเล็กสุด</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPin(null)}
                    className="w-7 h-7 rounded-lg text-[#837469] hover:text-[#201b0e] hover:bg-black/5 flex items-center justify-center cursor-pointer transition-colors ml-1"
                    title="ปิดการ์ด"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto py-2 space-y-2.5 no-scrollbar">
                {/* Large Photo Banner */}
                <div className="relative w-full h-28 sm:h-36 rounded-xl overflow-hidden shadow-inner bg-[#fdf3dc] shrink-0">
                  <img
                    src={getLocationPhoto(selectedPin.city, selectedPin.country, selectedPin.imageUrl)}
                    alt={selectedPin.city}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5">
                    <div className="text-white">
                      <span className="text-[11px] font-semibold flex items-center gap-1 drop-shadow">
                        <span>{selectedPin.pinStyle === 'flag' ? '🚩 หมุดธง' : selectedPin.pinStyle === 'needle' ? '📍 หมุดเข็ม' : '🔘 หมุดเรืองแสง'}</span>
                        <span>• {selectedPin.categoryTag || 'บันทึกการเดินทาง'}</span>
                      </span>
                      <h2 className="font-headline-md text-base sm:text-lg font-bold drop-shadow leading-tight">
                        {selectedPin.city}, {selectedPin.country}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {/* Date section */}
                  <div className="p-2 rounded-xl bg-[#fdf3dc]/80 border border-[#d5c3b6]/70 flex flex-col justify-between">
                    <span className="font-label-coord text-[8.5px] text-[#837469] uppercase font-bold block mb-1">
                      วันที่บันทึกพิกัด
                    </span>
                    {isEditingPinDate ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingPinDateText}
                          onChange={(e) => setEditingPinDateText(e.target.value)}
                          placeholder="เช่น 14 ต.ค. 2026"
                          className="px-2 py-0.5 text-[10px] bg-white rounded border border-[#6f4315] text-[#201b0e] font-semibold focus:outline-none flex-1"
                          autoFocus
                        />
                        <input
                          type="date"
                          onChange={(e) => {
                            if (e.target.value) {
                              const d = new Date(e.target.value);
                              const thaiMonths = [
                                'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                                'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
                              ];
                              const formatted = `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear()}`;
                              setEditingPinDateText(formatted);
                            }
                          }}
                          className="w-7 h-6 p-0 bg-white rounded border border-[#d5c3b6] text-[#6f4315] cursor-pointer"
                          title="เลือกวันที่จากปฏิทิน"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = editingPinDateText.trim();
                            if (trimmed) {
                              onUpdatePinDate?.(selectedPin.id, trimmed);
                              setSelectedPin((prev) => (prev ? { ...prev, date: trimmed } : null));
                              setIsEditingPinDate(false);
                              onToast(`แก้ไขวันที่บันทึกพิกัดเป็น "${trimmed}" สำเร็จ`);
                            }
                          }}
                          className="px-2 py-0.5 rounded text-[9px] bg-[#6f4315] text-white font-bold cursor-pointer"
                        >
                          บันทึก
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingPinDate(false)}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-[#ece2cc] text-[#51443a] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-label-stamp text-[11px] text-[#6f4315] font-bold">
                          {selectedPin.date}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPinDateText(selectedPin.date);
                            setIsEditingPinDate(true);
                          }}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-[#ffdea5] text-[#6f4315] hover:bg-[#ffeed3] font-bold flex items-center gap-0.5 cursor-pointer"
                          title="แก้ไขวันที่"
                        >
                          <span className="material-symbols-outlined text-[10px]">edit</span>
                          <span>แก้ไข</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* GPS Coordinates */}
                  <div className="p-2 rounded-xl bg-[#fdf3dc]/80 border border-[#d5c3b6]/70 flex flex-col justify-between">
                    <span className="font-label-coord text-[8.5px] text-[#837469] uppercase font-bold block mb-1">
                      พิกัด GPS บนโลกจริง
                    </span>
                    <span className="font-label-coord text-[10px] text-[#465f88] font-bold block truncate">
                      {selectedPin.latLngDisplay}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-[#ece2cc] flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigateTab('passport')}
                  className="flex-1 py-2 rounded-xl bg-[#6f4315] text-white hover:bg-[#8b5a2b] font-title-md text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">menu_book</span>
                  <span>เปิดดูตราประทับในพาสปอร์ต</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRequestDeletePin(e, selectedPin)}
                  className="py-2 px-3 rounded-xl bg-[#fff0f0] text-[#ba1a1a] hover:bg-[#ffe2e2] font-title-md text-xs font-bold border border-[#ba1a1a]/30 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>ลบ</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center Live Coordinates Gyro Indicator (ปรับให้มีขนาดเล็ก เพื่อการมองเห็นที่ง่าย) */}
        <div className="mt-1 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#fdf3dc]/85 hover:bg-[#f5e7c8] px-2.5 py-0.5 rounded-full border border-[#d5c3b6]/80 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="แตะเพื่อเปิดการตั้งค่า"
          >
            <span className="text-[10px]">
              {earthMode === 'satellite' ? '☀️' : earthMode === 'night' ? '🌙' : '🧭'}
            </span>
            <span className="material-symbols-outlined text-[12px] text-[#6f4315] animate-spin">
              explore
            </span>
            <span className="font-label-coord text-[9px] text-[#6f4315] font-bold">
              {activeTargetSpot
                ? `${formatCoordinates(activeTargetSpot.lat, activeTargetSpot.lng)} • ${activeTargetSpot.nameTh || activeTargetSpot.name}`
                : selectedPin?.latLngDisplay || "35°41' N • 139°41' E"}
            </span>
          </button>
        </div>
      </div>

      {/* Modern Search & Pin Bar (ค้นหาเจอ 100% ลิ้งค์กับตำแหน่งจริงของโลก) */}
      <div className="px-4 mt-3 relative">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6f4315] text-[18px]">
              {isSearching ? 'travel_explore' : 'search'}
            </span>
            <input
              type="text"
              placeholder="ค้นหาประเทศ เมือง หรือสถานที่"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white rounded-xl border border-[#d5c3b6] text-[#201b0e] focus:outline-none focus:ring-2 focus:ring-[#6f4315] shadow-xs placeholder:text-[#837469] font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowDropdown(false);
                  setActiveTargetSpot(null);
                }}
                className="absolute right-2.5 top-2 text-[#837469] hover:text-[#201b0e] p-0.5 cursor-pointer"
                title="ล้างคำค้นหา"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-[#6f4315] text-white font-title-md text-xs shadow-sm hover:bg-[#8b5a2b] active:scale-95 transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[16px]">explore</span>
            <span>{isSearching ? 'กำลังค้นหา...' : 'ค้นหาพิกัด'}</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddPin}
            className="px-3 py-2 rounded-xl bg-[#fdf3dc] text-[#6f4315] border border-[#d5c3b6] font-title-md text-xs shadow-2xs hover:bg-[#ffdea5]/50 active:scale-95 transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
            <span>+ ปักหมุด</span>
          </button>
        </form>

        {/* Live Autocomplete Dropdown - 100% Real World Match */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-white rounded-xl shadow-2xl border border-[#d5c3b6] z-50 max-h-60 overflow-y-auto divide-y divide-[#ece2cc] animate-in fade-in slide-in-from-top-1">
            <div className="px-3 py-1.5 bg-[#fdfaf3] text-[#6f4315] font-label-coord text-[9px] font-bold uppercase flex items-center justify-between">
              <span>ผลลัพธ์พิกัดจริงบนโลก ({searchResults.length})</span>
              <span className="text-[#837469]">แตะเพื่อหมุนลูกโลกไปยังตำแหน่ง</span>
            </div>
            {searchResults.map((loc) => (
              <div
                key={loc.id}
                onClick={() => handleSelectLocation(loc)}
                className="p-2.5 hover:bg-[#fff8f0] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{loc.flag}</span>
                  <div className="min-w-0">
                    <span className="font-headline-sm text-xs text-[#201b0e] font-bold block truncate">
                      {loc.nameTh || loc.name}
                      {loc.nameTh && loc.name !== loc.nameTh && (
                        <span className="font-label-coord text-[10px] text-[#837469] font-normal ml-1">
                          ({loc.name})
                        </span>
                      )}
                    </span>
                    <span className="font-label-coord text-[9px] text-[#837469] block truncate">
                      {loc.countryTh || loc.country} • {loc.category}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="font-label-coord text-[9px] text-[#465f88] font-bold block">
                    {formatCoordinates(loc.lat, loc.lng)}
                  </span>
                  <span className="font-label-stamp text-[8px] text-[#6f4315] hover:underline flex items-center justify-end gap-0.5">
                    <span>หมุนโลก</span>
                    <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Popular Destination Quick Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 no-scrollbar">
          <span className="font-label-coord text-[9px] text-[#837469] uppercase font-bold shrink-0">
            ยอดนิยม:
          </span>
          {[
            POPULAR_WORLD_LOCATIONS[0], // Bangkok
            POPULAR_WORLD_LOCATIONS[1], // Chiang Mai
            POPULAR_WORLD_LOCATIONS[2], // Phuket
            POPULAR_WORLD_LOCATIONS[9], // Tokyo
            POPULAR_WORLD_LOCATIONS[20], // Paris
            POPULAR_WORLD_LOCATIONS[21], // London
            POPULAR_WORLD_LOCATIONS[25], // Switzerland
            POPULAR_WORLD_LOCATIONS[26], // Iceland
            POPULAR_WORLD_LOCATIONS[34], // New York
          ].map((loc) => (
            <button
              key={`chip-${loc.id}`}
              type="button"
              onClick={() => handleSelectLocation(loc)}
              className="px-2 py-0.5 rounded-full bg-[#fdf3dc] text-[#6f4315] hover:bg-[#ffdea5] text-[10px] font-label-coord flex items-center gap-1 shrink-0 border border-[#d5c3b6]/60 transition-colors cursor-pointer shadow-2xs font-semibold"
            >
              <span>{loc.flag}</span>
              <span>{loc.nameTh}</span>
            </button>
          ))}
        </div>
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
                  className={`min-w-[154px] p-2 rounded-xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md shrink-0 relative group ${
                    isSelected
                      ? 'border-[#6f4315] ring-2 ring-[#ffdcc1] bg-[#fff8f0]'
                      : 'border-[#d5c3b6]/70 hover:border-[#6f4315]/50'
                  }`}
                >
                  <div className="relative w-full h-16 rounded-lg overflow-hidden mb-1.5 bg-[#fdf3dc]">
                    <img
                      src={getLocationPhoto(pin.city, pin.country, pin.imageUrl)}
                      alt={pin.city}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute top-1 left-1 bg-black/65 text-white text-[8px] font-label-coord px-1 rounded font-bold">
                      {pin.code}
                    </span>

                    {/* Delete Pin Button (สัญลักษณ์ X เล็กๆ และโปร่งแสง) */}
                    <button
                      type="button"
                      onClick={(e) => handleRequestDeletePin(e, pin)}
                      className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-black/40 hover:bg-[#ba1a1a]/85 backdrop-blur-xs text-white/90 hover:text-white border border-white/30 hover:border-white/60 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 z-10 hover:scale-110"
                      title={`ลบรายการหมุด ${pin.city}, ${pin.country}`}
                    >
                      <span className="material-symbols-outlined text-[10px] font-bold leading-none opacity-90 hover:opacity-100">
                        close
                      </span>
                    </button>

                    <span className="absolute bottom-1 right-1 text-xs drop-shadow">
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
        initialData={pinModalInitialData}
        onAddPin={(newPin) => {
          onAddPin(newPin);
          setSelectedPin(newPin);
          focusOnCoordinates(newPin.lat, newPin.lng);
          onToast(`ปักหมุดสำเร็จ: ${newPin.city}, ${newPin.country}!`);
        }}
      />

      {/* Delete Confirmation Modal (ยืนยัน Yes or No ก่อนลบ) */}
      {pinToDelete && (
        <div
          onClick={() => setPinToDelete(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-white rounded-2xl p-4.5 shadow-2xl border border-[#d5c3b6] text-center space-y-3 animate-in zoom-in-95 duration-150"
          >
            <div className="w-11 h-11 mx-auto rounded-full bg-[#fff0f0] text-[#ba1a1a] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">delete</span>
            </div>

            <div>
              <h3 className="font-headline-sm text-sm text-[#201b0e] font-bold">
                ยืนยันการลบรายการหมุดนี้?
              </h3>
              <p className="font-body-sm text-xs text-[#51443a] mt-1 leading-snug">
                คุณต้องการลบหมุด <span className="font-bold text-[#ba1a1a]">{pinToDelete.city}, {pinToDelete.country}</span> ออกจากบันทึกใช่หรือไม่?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPinToDelete(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#ece2cc] hover:bg-[#d5c3b6] text-[#51443a] text-xs font-bold transition-colors cursor-pointer"
              >
                No (ไม่ลบ)
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePin}
                className="flex-1 py-2 px-3 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer active:scale-95"
              >
                Yes (ยืนยัน)
              </button>
            </div>
          </div>
        </div>
      )}

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
