import * as THREE from 'three';

/**
 * High-definition, CORS-friendly NASA & Three.js Earth satellite textures
 */
export const EARTH_TEXTURE_URLS = {
  // Realistic daytime satellite photography
  dayAtmos: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
  dayBlueMarble: 'https://unpkg.com/three-globe@2.45.5/example/img/earth-blue-marble.jpg',
  // Nighttime glowing city lights
  nightLights: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png',
  nightDark: 'https://unpkg.com/three-globe@2.45.5/example/img/earth-night.jpg',
  // 3D elevation normal map for mountain & terrain relief
  normalMap: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
  // Water specular map (oceans glint with sunlight, continents stay matte)
  specularMap: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
  // Atmospheric satellite cloud layer
  clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
  // Topology bump map
  topology: 'https://unpkg.com/three-globe@2.45.5/example/img/earth-topology.png',
};

/**
 * Loads a texture with crossOrigin set to anonymous, with optional onLoad callback
 */
export function loadEarthTexture(
  url: string,
  onLoad?: (texture: THREE.Texture) => void
): THREE.Texture {
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const texture = loader.load(
    url,
    (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      if (onLoad) onLoad(tex);
    },
    undefined,
    (err) => {
      console.warn(`Failed loading texture from ${url}, using procedural fallback`, err);
    }
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Generates an ultra-detailed, photorealistic procedural Earth diffuse map (2048x1024)
 * Used as an immediate high-fidelity fallback or for the archival cartography mode
 */
export function createProceduralEarthTexture(mode: 'satellite' | 'vintage' | 'night' = 'satellite'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Ocean base gradient
  if (mode === 'vintage') {
    // Archival explorer antique parchment ocean - rich deep indigo-navy with warm aged vignette
    const oceanGrad = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.5,
      120,
      canvas.width * 0.5,
      canvas.height * 0.5,
      canvas.width * 0.72
    );
    oceanGrad.addColorStop(0, '#132338'); // Rich antique indigo-navy
    oceanGrad.addColorStop(0.4, '#0d1a29'); // Deep nautical navy
    oceanGrad.addColorStop(0.8, '#08121e'); // Antique midnight ocean
    oceanGrad.addColorStop(1, '#050c14');
    ctx.fillStyle = oceanGrad;
  } else if (mode === 'night') {
    // Deep dark space blue
    ctx.fillStyle = '#030812';
  } else {
    // โหมดกลางวัน (Day Mode) - โลกสีฟ้าเขียวสดใส (Radiant Blue-Green Tropical & Abyss Oceans as in sample image)
    const oceanGrad = ctx.createRadialGradient(
      canvas.width * 0.48,
      canvas.height * 0.46,
      80,
      canvas.width * 0.5,
      canvas.height * 0.5,
      canvas.width * 0.72
    );
    oceanGrad.addColorStop(0, '#00e5ff'); // Electric tropical cyan-turquoise shallows & barrier reefs
    oceanGrad.addColorStop(0.18, '#00b4d8'); // Bright azure-cyan ocean
    oceanGrad.addColorStop(0.42, '#0077b6'); // Radiant sapphire blue
    oceanGrad.addColorStop(0.72, '#023e8a'); // Rich royal deep blue
    oceanGrad.addColorStop(1, '#001b3a'); // Deep abyssal ocean blue
    ctx.fillStyle = oceanGrad;
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Helper: map (lat, lng) to pixel coords
  const toXY = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * canvas.width;
    const y = ((90 - lat) / 180) * canvas.height;
    return { x, y };
  };

  // Archival Explorer Cartography details for Vintage Model (Sample Image Model)
  if (mode === 'vintage') {
    // A. 16-point Navigational Rhumb Lines (เส้นทางเดินเรือโบราณ) radiating across oceans
    const rhumbCenters = [
      toXY(18, -35), // Central North Atlantic
      toXY(-26, -20), // South Atlantic
      toXY(-12, -135), // South Pacific
      toXY(20, 165), // Northwest Pacific
      toXY(-10, 80), // Indian Ocean
    ];

    ctx.save();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.22)';
    rhumbCenters.forEach((center) => {
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x + Math.cos(angle) * 480, center.y + Math.sin(angle) * 480);
        ctx.stroke();
      }
    });

    // B. Ornate Antique Golden Compass Rose (เข็มทิศทองคำโบราณ)
    const drawCompassRose = (cx: number, cy: number, radius: number) => {
      // Outer golden rings
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.78, 0, Math.PI * 2);
      ctx.stroke();

      // Degree tick marks
      for (let deg = 0; deg < 360; deg += 15) {
        const rad = (deg * Math.PI) / 180;
        const r1 = radius * 0.84;
        const r2 = radius;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
        ctx.lineTo(cx + Math.cos(rad) * r2, cy + Math.sin(rad) * r2);
        ctx.stroke();
      }

      // 8-point gold compass star
      const points = 8;
      for (let i = 0; i < points; i++) {
        const angle = (Math.PI * 2 * i) / points - Math.PI / 2;
        const halfAngle1 = angle - Math.PI / points;
        const halfAngle2 = angle + Math.PI / points;
        const tipRadius = radius * (i % 2 === 0 ? 0.95 : 0.65);
        const innerRadius = radius * 0.22;

        const tipX = cx + Math.cos(angle) * tipRadius;
        const tipY = cy + Math.sin(angle) * tipRadius;
        const midX1 = cx + Math.cos(halfAngle1) * innerRadius;
        const midY1 = cy + Math.sin(halfAngle1) * innerRadius;
        const midX2 = cx + Math.cos(halfAngle2) * innerRadius;
        const midY2 = cy + Math.sin(halfAngle2) * innerRadius;

        // Bright golden facet
        ctx.fillStyle = i % 2 === 0 ? '#ffd700' : '#e5c158';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(midX1, midY1);
        ctx.closePath();
        ctx.fill();

        // Dark burnished gold facet
        ctx.fillStyle = i % 2 === 0 ? '#a67c1e' : '#7a5a13';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(midX2, midY2);
        ctx.closePath();
        ctx.fill();
      }

      // Center gold pearl
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a420b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cardinal N marker
      ctx.fillStyle = '#ffe082';
      ctx.font = `bold ${Math.round(radius * 0.32)}px 'Georgia', serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('N', cx, cy - radius * 1.05);
    };

    const compass1 = toXY(-26, -24); // South Atlantic
    drawCompassRose(compass1.x, compass1.y, 48);

    const compass2 = toXY(-18, -135); // South Pacific
    drawCompassRose(compass2.x, compass2.y, 38);

    // C. Antique Cartographic Latin Ocean Inscriptions
    ctx.font = "italic bold 17px 'Georgia', serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(235, 205, 120, 0.45)';

    const atlanticLabel = toXY(8, -32);
    ctx.fillText('OCEANVS  ATLANTICVS', atlanticLabel.x, atlanticLabel.y);

    const pacificLabel = toXY(5, -145);
    ctx.fillText('OCEANVS  PACIFICVS', pacificLabel.x, pacificLabel.y);

    const indicusLabel = toXY(-18, 75);
    ctx.fillText('OCEANVS  INDICVS', indicusLabel.x, indicusLabel.y);

    const terraLabel = toXY(-75, 20);
    ctx.fillText('TERRA  INCOGNITA', terraLabel.x, terraLabel.y);

    ctx.restore();
  }

  // Coastal bathymetry shelf glow (Radiant antique gold for vintage, electric cyan/blue for day)
  ctx.shadowColor =
    mode === 'vintage'
      ? 'rgba(255, 215, 0, 0.85)'
      : mode === 'night'
      ? 'rgba(24, 140, 190, 0.3)'
      : 'rgba(56, 189, 248, 0.9)'; // Vivid sky-blue coastal shelf glow
  ctx.shadowBlur = mode === 'vintage' ? 22 : mode === 'satellite' ? 24 : 14;

  // Realistic continent outlines
  const continentPolygons: {
    points: [number, number][];
    baseColor: string;
    biomes?: { center: [number, number]; radius: number; color: string }[];
    isIce?: boolean;
  }[] = [
    // Eurasia
    {
      points: [
        [71, 28], [70, 32], [69, 36], [68, 44], [67, 50], [69, 60], [73, 72],
        [75, 82], [76, 95], [77, 105], [75, 115], [72, 130], [71, 142], [70, 160],
        [66, 170], [64, 173], [60, 163], [59, 150], [58, 143], [53, 140], [48, 136],
        [44, 131], [42, 130], [40, 128], [37, 126], [35, 119], [32, 120], [31, 121],
        [28, 120], [22, 114], [21, 108], [16, 107], [10, 104], [6, 102], [1, 103],
        [4, 100], [8, 98], [12, 98], [16, 96], [22, 91], [22, 89], [21, 87],
        [16, 82], [13, 80], [8, 77], [10, 76], [15, 74], [19, 73], [24, 69],
        [25, 62], [25, 57], [27, 51], [22, 59], [17, 55], [15, 54], [12, 44],
        [15, 42], [22, 38], [27, 35], [28, 34], [31, 35], [33, 35], [36, 36],
        [37, 33], [37, 27], [39, 26], [40, 26], [41, 28], [45, 29], [46, 21],
        [45, 14], [44, 12], [44, 8], [43, 3], [42, 3], [36, -5], [37, -9],
        [43, -9], [44, -1], [46, -1], [48, -4], [49, -1], [51, 2], [53, 5],
        [54, 8], [55, 12], [57, 10], [58, 11], [58, 15], [60, 18], [63, 19],
        [65, 22], [70, 25], [71, 28],
      ],
      baseColor: mode === 'vintage' ? '#c5a059' : mode === 'night' ? '#121820' : '#2d542b',
      biomes: [
        { center: [26, 48], radius: 240, color: mode === 'vintage' ? '#dfba63' : '#a88548' }, // Arabian desert
        { center: [42, 85], radius: 300, color: mode === 'vintage' ? '#d4a84b' : '#9c7b42' }, // Gobi desert
        { center: [28, 84], radius: 210, color: mode === 'vintage' ? '#8c6d3b' : '#6b573a' }, // Himalayas
        { center: [62, 100], radius: 380, color: mode === 'vintage' ? '#a27e34' : '#224825' }, // Siberian Taiga
      ],
    },
    // Africa
    {
      points: [
        [36, -5], [37, 5], [37, 10], [35, 11], [33, 11], [32, 20], [32, 24],
        [31, 32], [28, 34], [22, 38], [15, 42], [12, 44], [12, 51], [9, 50],
        [5, 48], [1, 44], [-4, 39], [-11, 40], [-17, 39], [-22, 36], [-26, 33],
        [-34, 26], [-34, 18], [-32, 18], [-28, 16], [-22, 14], [-16, 12], [-10, 13],
        [-5, 12], [0, 9], [4, 9], [5, 5], [5, 2], [5, -4], [4, -8], [7, -12],
        [11, -15], [15, -17], [21, -17], [25, -15], [28, -13], [32, -9], [36, -5],
      ],
      baseColor: mode === 'vintage' ? '#be984e' : mode === 'night' ? '#14181f' : '#3f6333',
      biomes: [
        { center: [24, 16], radius: 340, color: mode === 'vintage' ? '#e5c064' : '#c49a56' }, // Sahara dunes
        { center: [-1, 22], radius: 200, color: mode === 'vintage' ? '#9a752c' : '#1f5424' }, // Congo basin
        { center: [-23, 22], radius: 150, color: mode === 'vintage' ? '#d8b056' : '#a38148' }, // Kalahari
      ],
    },
    // North America
    {
      points: [
        [71, -156], [71, -145], [70, -130], [69, -114], [65, -105], [60, -94],
        [58, -80], [62, -75], [58, -64], [52, -56], [47, -53], [44, -64],
        [41, -70], [35, -75], [31, -81], [25, -80], [25, -81], [28, -83],
        [29, -89], [28, -96], [26, -97], [20, -97], [18, -94], [16, -93],
        [14, -87], [12, -86], [9, -83], [8, -77], [14, -92], [16, -96],
        [20, -103], [23, -106], [23, -110], [27, -112], [31, -114], [34, -119],
        [38, -123], [44, -124], [48, -124], [51, -128], [54, -130], [58, -136],
        [60, -145], [59, -152], [55, -162], [60, -165], [65, -168], [71, -156],
      ],
      baseColor: mode === 'vintage' ? '#c29d53' : mode === 'night' ? '#121820' : '#30582f',
      biomes: [
        { center: [33, -112], radius: 150, color: mode === 'vintage' ? '#deb85e' : '#ad874d' }, // Sonoran
        { center: [40, -100], radius: 190, color: mode === 'vintage' ? '#ce9f48' : '#5e723e' }, // Great Plains
        { center: [56, -115], radius: 280, color: mode === 'vintage' ? '#9e7a32' : '#1e4722' }, // Canadian Taiga
      ],
    },
    // South America
    {
      points: [
        [12, -72], [10, -62], [7, -58], [4, -51], [-1, -48], [-3, -40], [-5, -35],
        [-13, -39], [-18, -39], [-22, -41], [-23, -44], [-28, -49], [-33, -51],
        [-39, -58], [-46, -65], [-52, -68], [-54, -68], [-55, -73], [-50, -75],
        [-42, -73], [-35, -72], [-30, -71], [-23, -70], [-18, -70], [-14, -76],
        [-9, -79], [-5, -81], [1, -79], [8, -77], [10, -75], [12, -72],
      ],
      baseColor: mode === 'vintage' ? '#b89449' : mode === 'night' ? '#0f161c' : '#205e27',
      biomes: [
        { center: [-4, -62], radius: 260, color: mode === 'vintage' ? '#96742a' : '#164d1d' }, // Amazon
        { center: [-22, -69], radius: 130, color: mode === 'vintage' ? '#dfb65b' : '#94753c' }, // Atacama
        { center: [-44, -68], radius: 170, color: mode === 'vintage' ? '#c8a04c' : '#6b6652' }, // Patagonia
      ],
    },
    // Australia
    {
      points: [
        [-12, 136], [-12, 142], [-15, 145], [-20, 148], [-24, 153], [-30, 153],
        [-33, 151], [-38, 147], [-38, 140], [-35, 135], [-32, 132], [-32, 125],
        [-35, 117], [-32, 115], [-26, 113], [-22, 114], [-17, 122], [-14, 126],
        [-11, 132], [-12, 136],
      ],
      baseColor: mode === 'vintage' ? '#cca250' : mode === 'night' ? '#14181a' : '#946c36',
      biomes: [
        { center: [-24, 133], radius: 190, color: mode === 'vintage' ? '#e5b95b' : '#b27a3a' }, // Outback
        { center: [-34, 148], radius: 110, color: mode === 'vintage' ? '#ba9142' : '#3f6032' },
      ],
    },
    // Greenland
    {
      points: [
        [83, -30], [81, -20], [76, -19], [70, -22], [65, -39], [60, -43],
        [64, -52], [70, -54], [72, -56], [76, -65], [78, -69], [82, -50], [83, -30],
      ],
      baseColor: mode === 'vintage' ? '#ded5bf' : '#eef6ff',
      isIce: true,
    },
    // Antarctica
    {
      points: [
        [-65, -180], [-67, -140], [-71, -100], [-72, -80], [-64, -60], [-73, -40],
        [-68, 0], [-66, 40], [-65, 80], [-66, 120], [-65, 160], [-65, 180],
        [-90, 180], [-90, -180],
      ],
      baseColor: mode === 'vintage' ? '#ded5bf' : '#f0f7ff',
      isIce: true,
    },
  ];

  continentPolygons.forEach((land) => {
    ctx.beginPath();
    land.points.forEach(([lat, lng], idx) => {
      const pt = toXY(lat, lng);
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();

    ctx.fillStyle = land.baseColor;
    ctx.fill();

    ctx.strokeStyle = land.isIce
      ? mode === 'vintage'
        ? '#d4af37'
        : '#d4e6f8'
      : mode === 'vintage'
      ? '#ffd700'
      : mode === 'night'
      ? '#102a43'
      : '#0096c7';
    ctx.lineWidth = mode === 'vintage' ? 2.2 : mode === 'satellite' ? 1.6 : 1.2;
    ctx.stroke();

    if (land.biomes) {
      land.biomes.forEach((b) => {
        const center = toXY(b.center[0], b.center[1]);
        const grad = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, b.radius);
        grad.addColorStop(0, b.color);
        grad.addColorStop(0.7, b.color);
        grad.addColorStop(1, 'transparent');

        ctx.save();
        ctx.clip();
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      });
    }
  });

  // Glowing city lights only in night or vintage mode (Day mode stays radiant pure blue!)
  if (mode === 'night' || mode === 'vintage') {
    const cityLights: [number, number, number][] = [
      // East & Southeast Asia
      [35.68, 139.76, 22], [35.01, 135.76, 16], [34.69, 135.5, 17], // Tokyo / Kyoto / Osaka megalopolis
      [37.56, 126.97, 19], // Seoul
      [39.9, 116.4, 20], // Beijing
      [31.23, 121.47, 22], // Shanghai
      [22.31, 114.17, 18], [23.13, 113.26, 18], // Hong Kong / Guangzhou
      [25.03, 121.56, 15], // Taipei
      [13.75, 100.5, 18], // Bangkok
      [1.35, 103.81, 16], // Singapore
      [3.14, 101.69, 14], // Kuala Lumpur
      [-6.2, 106.84, 16], // Jakarta
      [14.59, 120.98, 15], // Manila
      [21.02, 105.83, 12], [10.82, 106.63, 13], // Hanoi & Ho Chi Minh City
      // South Asia & Middle East
      [19.07, 72.87, 19], [28.61, 77.2, 19], [12.97, 77.59, 15], // Mumbai, Delhi, Bangalore
      [25.2, 55.27, 18], [24.45, 54.37, 14], // Dubai, Abu Dhabi
      [24.71, 46.67, 15], [21.48, 39.19, 14], // Riyadh, Jeddah
      [30.04, 31.23, 18], [31.2, 29.91, 14], // Cairo & Alexandria (Nile Delta)
      [41.0, 28.97, 17], // Istanbul
      [32.08, 34.78, 14], // Tel Aviv
      // Europe
      [48.85, 2.35, 20], [51.5, -0.12, 21], [52.52, 13.4, 17], // Paris, London, Berlin
      [52.37, 4.89, 16], [50.85, 4.35, 15], // Amsterdam, Brussels
      [41.9, 12.49, 16], [45.46, 9.19, 16], // Rome, Milan
      [40.41, -3.7, 17], [41.38, 2.17, 16], // Madrid, Barcelona
      [55.75, 37.61, 19], [59.93, 30.33, 15], // Moscow, St. Petersburg
      [59.33, 18.06, 13], [60.17, 24.94, 12], // Stockholm, Helsinki
      // North America
      [40.71, -74.0, 24], [42.36, -71.05, 17], [39.95, -75.16, 17], // NYC, Boston, Philadelphia (Megapolis)
      [38.9, -77.03, 18], // Washington DC
      [41.87, -87.62, 19], // Chicago
      [25.76, -80.19, 18], [28.53, -81.37, 15], // Miami & Orlando
      [29.76, -95.36, 17], [32.77, -96.79, 16], // Houston & Dallas
      [34.05, -118.24, 22], [37.77, -122.41, 19], [32.71, -117.16, 15], // LA, SF Bay, San Diego
      [47.6, -122.33, 16], // Seattle
      [43.65, -79.38, 17], [45.5, -73.56, 16], // Toronto & Montreal
      [19.43, -99.13, 20], // Mexico City
      // South America
      [-23.55, -46.63, 20], [-22.9, -43.17, 18], // São Paulo & Rio de Janeiro
      [-34.6, -58.38, 18], // Buenos Aires
      [-33.44, -70.66, 16], // Santiago
      [-12.04, -77.04, 15], // Lima
      [4.71, -74.07, 16], // Bogotá
      // Australia & Oceania
      [-33.86, 151.2, 18], [-37.81, 144.96, 17], [-27.47, 153.02, 14], // Sydney, Melbourne, Brisbane
      [-31.95, 115.86, 13], // Perth
      [-36.84, 174.76, 14], // Auckland
      // Africa
      [-26.2, 28.04, 16], [-33.92, 18.42, 15], // Johannesburg & Cape Town
      [6.52, 3.37, 16], // Lagos
      [-1.29, 36.82, 14], // Nairobi
      [31.62, -7.98, 12], [33.57, -7.58, 14], // Marrakech & Casablanca
    ];

    cityLights.forEach(([lat, lng, intensity]) => {
      const pt = toXY(lat, lng);
      // Outer soft glowing aura
      const rad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, intensity * 1.6);
      rad.addColorStop(0, 'rgba(255, 245, 210, 0.98)');
      rad.addColorStop(0.2, 'rgba(255, 210, 120, 0.85)');
      rad.addColorStop(0.45, 'rgba(255, 160, 50, 0.5)');
      rad.addColorStop(0.75, 'rgba(255, 110, 20, 0.18)');
      rad.addColorStop(1, 'rgba(255, 80, 0, 0)');
      ctx.fillStyle = rad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, intensity * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // White-hot core pinpoint for metropolitan centers
      if (intensity >= 16) {
        ctx.fillStyle = 'rgba(255, 255, 240, 0.95)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, intensity * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural swirling cloud texture fallback for photorealistic Earth atmosphere
 */
export function createProceduralCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Swirling cloud bands using overlapping feathered organic strokes
  const cloudBands = [
    { lat: 0, count: 28, maxR: 45, opacity: 0.35 }, // Intertropical Convergence Zone (ITCZ)
    { lat: 45, count: 35, maxR: 60, opacity: 0.4 }, // Mid-latitude cyclones North
    { lat: -50, count: 38, maxR: 65, opacity: 0.45 }, // Roaring Forties cyclones South
    { lat: 20, count: 20, maxR: 35, opacity: 0.25 }, // Trade wind clouds
    { lat: -20, count: 20, maxR: 35, opacity: 0.25 },
    { lat: 68, count: 18, maxR: 40, opacity: 0.3 }, // Polar vortex North
    { lat: -70, count: 22, maxR: 45, opacity: 0.35 }, // Polar vortex South
  ];

  cloudBands.forEach((band) => {
    const yCenter = ((90 - band.lat) / 180) * canvas.height;
    for (let i = 0; i < band.count; i++) {
      const x = Math.random() * canvas.width;
      const y = yCenter + (Math.random() - 0.5) * 60;
      const r = 20 + Math.random() * band.maxR;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(255, 255, 255, ${band.opacity})`);
      grad.addColorStop(0.5, `rgba(240, 248, 255, ${band.opacity * 0.6})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.5, r * 0.7, (Math.random() - 0.5) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates 3D coordinate graticule grid lines (Parallels and Meridians)
 * Matching the sample image model in WanderMark (golden explorer wireframe)
 */
export function createGraticulesGroup(radius: number, color = 0xd4af37, opacity = 0.28): THREE.Group {
  const graticules = new THREE.Group();

  // 1. Parallels (Latitude circles every 30 degrees)
  const latitudes = [-60, -30, 0, 30, 60];
  latitudes.forEach((lat) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const r = radius * Math.sin(phi);
    const y = radius * Math.cos(phi);

    const points: THREE.Vector3[] = [];
    const segments = 90;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const isEquator = lat === 0;
    const mat = new THREE.LineBasicMaterial({
      color: isEquator ? 0xffdf80 : color,
      transparent: true,
      opacity: isEquator ? opacity * 1.6 : opacity,
      linewidth: isEquator ? 1.5 : 1,
    });
    graticules.add(new THREE.Line(geo, mat));
  });

  // 2. Meridians (Longitude full circles every 30 degrees)
  for (let lng = 0; lng < 180; lng += 30) {
    const points: THREE.Vector3[] = [];
    const segments = 90;
    const rad = (lng * Math.PI) / 180;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = radius * Math.sin(angle) * Math.cos(rad);
      const z = radius * Math.sin(angle) * Math.sin(rad);
      const y = radius * Math.cos(angle);
      points.push(new THREE.Vector3(x, y, z));
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: lng === 0 ? 0xffdf80 : color,
      transparent: true,
      opacity: lng === 0 ? opacity * 1.5 : opacity,
      linewidth: 1,
    });
    graticules.add(new THREE.Line(geo, mat));
  }

  // 3. Special Explorer Tropics (Dashed Golden Lines for Tropic of Cancer & Capricorn)
  const tropics = [23.44, -23.44];
  tropics.forEach((lat) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const r = radius * Math.sin(phi);
    const y = radius * Math.cos(phi);

    const points: THREE.Vector3[] = [];
    const segments = 72;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({
      color: 0xffd580,
      transparent: true,
      opacity: opacity * 1.3,
      dashSize: 0.05,
      gapSize: 0.03,
    });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    graticules.add(line);
  });

  return graticules;
}

/**
 * Converts Geographic (lat, lng) to 3D Cartesian coordinates on a sphere of radius R
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}
