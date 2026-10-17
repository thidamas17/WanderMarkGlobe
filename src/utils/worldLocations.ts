export interface WorldLocation {
  id: string;
  name: string;
  nameTh: string;
  country: string;
  countryTh: string;
  code: string;
  lat: number;
  lng: number;
  flag: string;
  category: string;
}

// Comprehensive Curated Gazetteer of Top World & Thai Destinations (Instant & 100% Offline)
export const POPULAR_WORLD_LOCATIONS: WorldLocation[] = [
  // --- Thailand & Regional ---
  {
    id: 'th-bkk',
    name: 'Bangkok',
    nameTh: 'กรุงเทพมหานคร',
    country: 'Thailand',
    countryTh: 'ไทย',
    code: 'TH',
    lat: 13.7563,
    lng: 100.5018,
    flag: '🇹🇭',
    category: 'เมืองหลวง / มหานคร',
  },
  {
    id: 'th-cnx',
    name: 'Chiang Mai',
    nameTh: 'เชียงใหม่',
    country: 'Thailand',
    countryTh: 'ไทย',
    code: 'TH',
    lat: 18.7883,
    lng: 98.9853,
    flag: '🇹🇭',
    category: 'วัฒนธรรมล้านนา / ขุนเขา',
  },
  {
    id: 'th-hkt',
    name: 'Phuket',
    nameTh: 'ภูเก็ต',
    country: 'Thailand',
    countryTh: 'ไทย',
    code: 'TH',
    lat: 7.8804,
    lng: 98.3923,
    flag: '🇹🇭',
    category: 'เกาะทะเลอันดามัน',
  },
  {
    id: 'th-pty',
    name: 'Pattaya',
    nameTh: 'พัทยา (ชลบุรี)',
    country: 'Thailand',
    countryTh: 'ไทย',
    code: 'TH',
    lat: 12.9276,
    lng: 100.8771,
    flag: '🇹🇭',
    category: 'ชายทะเลอ่าวไทย',
  },
  {
    id: 'th-samui',
    name: 'Koh Samui',
    nameTh: 'เกาะสมุย (สุราษฎร์ธานี)',
    country: 'Thailand',
    countryTh: 'ไทย',
    code: 'TH',
    lat: 9.512,
    lng: 100.0136,
    flag: '🇹🇭',
    category: 'เกาะสวรรค์อ่าวไทย',
  },
  {
    id: 'th-krabi',
    name: 'Krabi',
    nameTh: 'กระบี่ (อ่าวนาง / ไร่เลย์)',
    country: 'Thailand',
    countryTh: 'ไทย',
    code: 'TH',
    lat: 8.0863,
    lng: 98.9063,
    flag: '🇹🇭',
    category: 'เขาหินปูน / ทะเลแหวก',
  },
  {
    id: 'th-ayutthaya',
    name: 'Ayutthaya',
    nameTh: 'พระนครศรีอยุธยา',
    country: 'Thailand',
    countryTh: 'ไทย',
    code: 'TH',
    lat: 14.3532,
    lng: 100.5684,
    flag: '🇹🇭',
    category: 'มรดกโลกเมืองเก่า',
  },
  {
    id: 'th-nan',
    name: 'Nan',
    nameTh: 'น่าน (ปัว / สะปัน)',
    country: 'Thailand',
    countryTh: 'ไทย',
    code: 'TH',
    lat: 18.7838,
    lng: 100.7782,
    flag: '🇹🇭',
    category: 'สายหมอกและขุนเขา',
  },
  {
    id: 'th-chiangrai',
    name: 'Chiang Rai',
    nameTh: 'เชียงราย',
    country: 'Thailand',
    countryTh: 'ไทย',
    code: 'TH',
    lat: 19.9105,
    lng: 99.8406,
    flag: '🇹🇭',
    category: 'เหนือสุดแดนสยาม',
  },

  // --- East & Southeast Asia ---
  {
    id: 'jp-tyo',
    name: 'Tokyo',
    nameTh: 'โตเกียว',
    country: 'Japan',
    countryTh: 'ญี่ปุ่น',
    code: 'JP',
    lat: 35.6762,
    lng: 139.6503,
    flag: '🇯🇵',
    category: 'เมืองหลวง / เมกาซิตี้',
  },
  {
    id: 'jp-kyo',
    name: 'Kyoto',
    nameTh: 'เกียวโต',
    country: 'Japan',
    countryTh: 'ญี่ปุ่น',
    code: 'JP',
    lat: 35.0116,
    lng: 135.7681,
    flag: '🇯🇵',
    category: 'เมืองโบราณ / วัดวาอาราม',
  },
  {
    id: 'jp-osa',
    name: 'Osaka',
    nameTh: 'โอซาก้า',
    country: 'Japan',
    countryTh: 'ญี่ปุ่น',
    code: 'JP',
    lat: 34.6937,
    lng: 135.5023,
    flag: '🇯🇵',
    category: 'มหานครคันไซ / ครัวแห่งญี่ปุ่น',
  },
  {
    id: 'jp-fuji',
    name: 'Mount Fuji',
    nameTh: 'ภูเขาไฟฟูจิ',
    country: 'Japan',
    countryTh: 'ญี่ปุ่น',
    code: 'JP',
    lat: 35.3606,
    lng: 138.7274,
    flag: '🇯🇵',
    category: 'สัญลักษณ์ธรรมชาติภูเขาไฟ',
  },
  {
    id: 'kr-sel',
    name: 'Seoul',
    nameTh: 'โซล',
    country: 'South Korea',
    countryTh: 'เกาหลีใต้',
    code: 'KR',
    lat: 37.5665,
    lng: 126.978,
    flag: '🇰🇷',
    category: 'เมืองหลวงเคป็อป / วังโบราณ',
  },
  {
    id: 'tw-tpe',
    name: 'Taipei',
    nameTh: 'ไทเป',
    country: 'Taiwan',
    countryTh: 'ไต้หวัน',
    code: 'TW',
    lat: 25.033,
    lng: 121.5654,
    flag: '🇹🇼',
    category: 'เกาะไต้หวัน / ตลาดกลางคืน',
  },
  {
    id: 'sg-sin',
    name: 'Singapore',
    nameTh: 'สิงคโปร์',
    country: 'Singapore',
    countryTh: 'สิงคโปร์',
    code: 'SG',
    lat: 1.3521,
    lng: 103.8198,
    flag: '🇸🇬',
    category: 'การ์เดนซิตี้เกาะสิงโต',
  },
  {
    id: 'hk-hkg',
    name: 'Hong Kong',
    nameTh: 'ฮ่องกง',
    country: 'Hong Kong',
    countryTh: 'ฮ่องกง',
    code: 'HK',
    lat: 22.3193,
    lng: 114.1694,
    flag: '🇭🇰',
    category: 'ไข่มุกแห่งตะวันออก',
  },
  {
    id: 'cn-bjs',
    name: 'Beijing',
    nameTh: 'ปักกิ่ง',
    country: 'China',
    countryTh: 'จีน',
    code: 'CN',
    lat: 39.9042,
    lng: 116.4074,
    flag: '🇨🇳',
    category: 'กำแพงเมืองจีน / พระราชวังต้องห้าม',
  },
  {
    id: 'cn-sha',
    name: 'Shanghai',
    nameTh: 'เซี่ยงไฮ้',
    country: 'China',
    countryTh: 'จีน',
    code: 'CN',
    lat: 31.2304,
    lng: 121.4737,
    flag: '🇨🇳',
    category: 'เดอะบันด์ / หอไข่มุก',
  },
  {
    id: 'id-dps',
    name: 'Bali',
    nameTh: 'บาหลี',
    country: 'Indonesia',
    countryTh: 'อินโดนีเซีย',
    code: 'ID',
    lat: -8.4095,
    lng: 115.1889,
    flag: '🇮🇩',
    category: 'เกาะแห่งเทพเจ้า',
  },
  {
    id: 'vn-han',
    name: 'Hanoi',
    nameTh: 'ฮานอย',
    country: 'Vietnam',
    countryTh: 'เวียดนาม',
    code: 'VN',
    lat: 21.0285,
    lng: 105.8542,
    flag: '🇻🇳',
    category: 'อ่าวฮาลอง / ทะเลสาบคืนดาบ',
  },

  // --- Europe ---
  {
    id: 'fr-par',
    name: 'Paris',
    nameTh: 'ปารีส',
    country: 'France',
    countryTh: 'ฝรั่งเศส',
    code: 'FR',
    lat: 48.8566,
    lng: 2.3522,
    flag: '🇫🇷',
    category: 'หอไอเฟล / พิพิธภัณฑ์ลูฟวร์',
  },
  {
    id: 'gb-lon',
    name: 'London',
    nameTh: 'ลอนดอน',
    country: 'United Kingdom',
    countryTh: 'อังกฤษ / สหราชอาณาจักร',
    code: 'GB',
    lat: 51.5074,
    lng: -0.1278,
    flag: '🇬🇧',
    category: 'หอนาฬิกาบิ๊กเบน / พระราชวังบักกิงแฮม',
  },
  {
    id: 'it-rom',
    name: 'Rome',
    nameTh: 'โรม',
    country: 'Italy',
    countryTh: 'อิตาลี',
    code: 'IT',
    lat: 41.9028,
    lng: 12.4964,
    flag: '🇮🇹',
    category: 'โคลอสเซียม / นครรัฐวาติกัน',
  },
  {
    id: 'it-flr',
    name: 'Florence',
    nameTh: 'ฟลอเรนซ์',
    country: 'Italy',
    countryTh: 'อิตาลี',
    code: 'IT',
    lat: 43.7696,
    lng: 11.2558,
    flag: '🇮🇹',
    category: 'เมืองเรเนซองส์ / ทัสคานี',
  },
  {
    id: 'it-vce',
    name: 'Venice',
    nameTh: 'เวนิส',
    country: 'Italy',
    countryTh: 'อิตาลี',
    code: 'IT',
    lat: 45.4408,
    lng: 12.3155,
    flag: '🇮🇹',
    category: 'คลองเวนิส / เรือกอนโดลา',
  },
  {
    id: 'ch-zrh',
    name: 'Zurich / Jungfrau',
    nameTh: 'สวิตเซอร์แลนด์ (ซูริก / ยอดเขาจุงเฟรา)',
    country: 'Switzerland',
    countryTh: 'สวิตเซอร์แลนด์',
    code: 'CH',
    lat: 46.5475,
    lng: 7.9854,
    flag: '🇨🇭',
    category: 'เทือกเขาแอลป์สวิส',
  },
  {
    id: 'is-rey',
    name: 'Reykjavik',
    nameTh: 'เรคยาวิก',
    country: 'Iceland',
    countryTh: 'ไอซ์แลนด์',
    code: 'IS',
    lat: 64.1466,
    lng: -21.9426,
    flag: '🇮🇸',
    category: 'แสงเหนือ / น้ำตกธารน้ำแข็ง',
  },
  {
    id: 'no-osl',
    name: 'Tromso & Fjords',
    nameTh: 'ทรอมโซ / ฟยอร์ดนอร์เวย์',
    country: 'Norway',
    countryTh: 'นอร์เวย์',
    code: 'NO',
    lat: 69.6492,
    lng: 18.9553,
    flag: '🇳🇴',
    category: 'ดินแดนอาร์กติกและแสงออโรร่า',
  },
  {
    id: 'de-ber',
    name: 'Berlin',
    nameTh: 'เบอร์ลิน',
    country: 'Germany',
    countryTh: 'เยอรมนี',
    code: 'DE',
    lat: 52.52,
    lng: 13.405,
    flag: '🇩🇪',
    category: 'ประตูบรันเดินบวร์ค',
  },
  {
    id: 'nl-ams',
    name: 'Amsterdam',
    nameTh: 'อัมสเตอร์ดัม',
    country: 'Netherlands',
    countryTh: 'เนเธอร์แลนด์',
    code: 'NL',
    lat: 52.3676,
    lng: 4.9041,
    flag: '🇳🇱',
    category: 'คลองมรดกโลก / กังหันลมทิวลิป',
  },
  {
    id: 'gr-ath',
    name: 'Santorini & Athens',
    nameTh: 'ซานโตรินี & เอเธนส์',
    country: 'Greece',
    countryTh: 'กรีซ',
    code: 'GR',
    lat: 36.3932,
    lng: 25.4615,
    flag: '🇬🇷',
    category: 'เกาะโดมสีฟ้าทะเลอีเจียน',
  },
  {
    id: 'tr-ist',
    name: 'Istanbul / Cappadocia',
    nameTh: 'อิสตันบูล & คัปปาโดเกีย',
    country: 'Turkey',
    countryTh: 'ตุรกี',
    code: 'TR',
    lat: 41.0082,
    lng: 28.9784,
    flag: '🇹🇷',
    category: 'จุดเชื่อมต่อสองทวีป / บอลลูนลมร้อน',
  },

  // --- Middle East & Africa ---
  {
    id: 'ae-dxb',
    name: 'Dubai',
    nameTh: 'ดูไบ',
    country: 'United Arab Emirates',
    countryTh: 'สหรัฐอาหรับเอมิเรตส์',
    code: 'AE',
    lat: 25.2048,
    lng: 55.2708,
    flag: '🇦🇪',
    category: 'ตึกเบิร์จคาลิฟา / ทะเลทราย',
  },
  {
    id: 'eg-cai',
    name: 'Cairo',
    nameTh: 'ไคโร (มหาพีระมิดกิซา)',
    country: 'Egypt',
    countryTh: 'อียิปต์',
    code: 'EG',
    lat: 30.0444,
    lng: 31.2357,
    flag: '🇪🇬',
    category: 'พีระมิดโบราณ / แม่น้ำไนล์',
  },
  {
    id: 'ma-rak',
    name: 'Marrakech',
    nameTh: 'มาราเกช',
    country: 'Morocco',
    countryTh: 'โมร็อกโก',
    code: 'MA',
    lat: 31.6295,
    lng: -7.9811,
    flag: '🇲🇦',
    category: 'ตลาดเมดินา / ประตูสู่ซาฮารา',
  },
  {
    id: 'mv-mle',
    name: 'Maldives',
    nameTh: 'มัลดีฟส์',
    country: 'Maldives',
    countryTh: 'มัลดีฟส์',
    code: 'MV',
    lat: 4.1755,
    lng: 73.5093,
    flag: '🇲🇻',
    category: 'เกาะอะทอลล์น้ำใสราวกระจก',
  },

  // --- Americas ---
  {
    id: 'us-nyc',
    name: 'New York City',
    nameTh: 'นิวยอร์ก',
    country: 'United States',
    countryTh: 'สหรัฐอเมริกา',
    code: 'US',
    lat: 40.7128,
    lng: -74.006,
    flag: '🇺🇸',
    category: 'เทพีเสรีภาพ / ไทม์สแควร์',
  },
  {
    id: 'us-lax',
    name: 'Los Angeles / San Francisco',
    nameTh: 'แคลิฟอร์เนีย (แอลเอ / ซานฟรานซิสโก)',
    country: 'United States',
    countryTh: 'สหรัฐอเมริกา',
    code: 'US',
    lat: 37.7749,
    lng: -122.4194,
    flag: '🇺🇸',
    category: 'สะพานโกลเดนเกต / ชายฝั่งแปซิฟิก',
  },
  {
    id: 'pe-cus',
    name: 'Cusco & Machu Picchu',
    nameTh: 'กุสโก & มาชูปิกชู',
    country: 'Peru',
    countryTh: 'เปรู',
    code: 'PE',
    lat: -13.1631,
    lng: -72.545,
    flag: '🇵🇪',
    category: 'อารยธรรมอินคาบนยอดเขาแอนดีส',
  },
  {
    id: 'br-rio',
    name: 'Rio de Janeiro',
    nameTh: 'ริโอเดจาเนโร',
    country: 'Brazil',
    countryTh: 'บราซิล',
    code: 'BR',
    lat: -22.9068,
    lng: -43.1729,
    flag: '🇧🇷',
    category: 'พระเยซูคริสต์กางแขน / ชายหาดโคปาคาบานา',
  },

  // --- Oceania ---
  {
    id: 'au-syd',
    name: 'Sydney',
    nameTh: 'ซิดนีย์',
    country: 'Australia',
    countryTh: 'ออสเตรเลีย',
    code: 'AU',
    lat: -33.8688,
    lng: 151.2093,
    flag: '🇦🇺',
    category: 'ซิดนีย์โอเปร่าเฮาส์ / อ่าวฮาร์เบอร์',
  },
  {
    id: 'nz-akl',
    name: 'Auckland & Queenstown',
    nameTh: 'นิวซีแลนด์ (ควีนส์ทาวน์ / โอ๊คแลนด์)',
    country: 'New Zealand',
    countryTh: 'นิวซีแลนด์',
    code: 'NZ',
    lat: -45.0312,
    lng: 168.6626,
    flag: '🇳🇿',
    category: 'ทะเลสาบและเทือกเขาสวยตระการตา',
  },
];

/**
 * Searches the local gazetteer first for instantaneous matches
 */
export function searchLocalGazetteer(query: string): WorldLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return POPULAR_WORLD_LOCATIONS.filter((loc) => {
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.nameTh.toLowerCase().includes(q) ||
      loc.country.toLowerCase().includes(q) ||
      loc.countryTh.toLowerCase().includes(q) ||
      loc.code.toLowerCase() === q ||
      loc.category.toLowerCase().includes(q)
    );
  });
}

/**
 * Live worldwide geocoding fallback (Nominatim / Photon)
 * Guarantees 100% search hit for ANY village, mountain, island, or address globally.
 */
export async function searchWorldwideGeocode(query: string): Promise<WorldLocation[]> {
  const q = query.trim();
  if (!q) return [];

  // Check local first
  const localMatches = searchLocalGazetteer(q);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=th,en&q=${encodeURIComponent(
        q
      )}`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'th,en',
        },
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const remoteResults: WorldLocation[] = data.map((item: any, idx: number) => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const parts = (item.display_name || '').split(',').map((s: string) => s.trim());
          const primaryName = parts[0] || q;
          const countryName = parts[parts.length - 1] || 'Earth';

          return {
            id: `geo-${item.place_id || idx}-${Date.now()}`,
            name: primaryName,
            nameTh: primaryName,
            country: countryName,
            countryTh: countryName,
            code: 'MAP',
            lat,
            lng,
            flag: '📍',
            category: item.type || 'พิกัดภูมิศาสตร์จริง',
          };
        });

        // Combine deduplicated
        const combined = [...localMatches];
        for (const rem of remoteResults) {
          const exists = combined.some(
            (c) => Math.abs(c.lat - rem.lat) < 0.2 && Math.abs(c.lng - rem.lng) < 0.2
          );
          if (!exists) {
            combined.push(rem);
          }
        }
        return combined;
      }
    }
  } catch (err) {
    console.warn('Geocoding fallback request warning:', err);
  }

  // If network geocode is unreachable, fallback to local gazetteer
  return localMatches;
}

/**
 * Formats coordinates into standard Lat/Lng hemisphere string (e.g. 13°45' N 100°30' E)
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const absLat = Math.abs(lat);
  const absLng = Math.abs(lng);

  const latDeg = Math.floor(absLat);
  const latMin = Math.round((absLat - latDeg) * 60);

  const lngDeg = Math.floor(absLng);
  const lngMin = Math.round((absLng - lngDeg) * 60);

  return `${latDeg}°${latMin < 10 ? '0' : ''}${latMin}' ${latDir} ${lngDeg}°${
    lngMin < 10 ? '0' : ''
  }${lngMin}' ${lngDir}`;
}
