import axios from 'axios';

export interface GeocodingResult {
  name: string;
  type?: string;
  lat?: number;
  lon?: number;
  address?: any;
}

const GEOCODING_BASE = process.env.EXPO_PUBLIC_GEOCODING_URL || '';

export const geocoding = {
  async search(query: string): Promise<GeocodingResult[]> {
    if (!GEOCODING_BASE || !query.trim()) return [];
    try {
      const res = await axios.get(GEOCODING_BASE, { params: { q: query, limit: 5 } });
      const items = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      return items.map((it: any) => ({
        name: it.display_name || it.name || it.formatted || query,
        type: it.type || it.category,
        lat: parseFloat(it.lat || it.latitude),
        lon: parseFloat(it.lon || it.longitude),
        address: it.address || it,
      }));
    } catch (e) {
      console.warn('Geocoding failed', e);
      return [];
    }
  }
};

export default geocoding;