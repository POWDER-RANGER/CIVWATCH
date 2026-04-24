/**
 * CIVWATCH Feed Normalizer
 * Converts raw API responses from heterogeneous sources into a canonical FeedEvent.
 *
 * FeedEvent schema:
 * {
 *   source_id: string,
 *   source_type: 'dot_camera' | 'yt_live' | 'webcam_embed',
 *   label: string,
 *   embed_url: string | null,
 *   snapshot_url: string | null,
 *   timestamp_utc: ISO8601 string,
 *   geo: { lat: number, lng: number } | null,
 *   tags: string[],
 *   raw_id: string | null
 * }
 */

function normalizeEvent(source, raw) {
  const base = {
    source_id: source.id,
    source_type: source.type,
    label: source.label,
    embed_url: null,
    snapshot_url: null,
    timestamp_utc: new Date().toISOString(),
    geo: source.geo || null,
    tags: source.tags || [],
    raw_id: null
  };

  switch (source.type) {

    case 'yt_live':
      return { ...base, embed_url: source.url, snapshot_url: null };

    case 'webcam_embed':
      return { ...base, embed_url: source.url, snapshot_url: source.snapshot_url || null };

    case 'dot_camera': {
      if (!raw) return base;

      // Iowa / Minnesota / NY 511 pattern
      if (raw.Latitude !== undefined && raw.Longitude !== undefined) {
        return {
          ...base,
          label: raw.Name || raw.Description || source.label,
          embed_url: raw.VideoUrl || raw.Url || null,
          snapshot_url: raw.SnapshotUrl || raw.ImageUrl || null,
          geo: { lat: parseFloat(raw.Latitude), lng: parseFloat(raw.Longitude) },
          raw_id: raw.ID || raw.CameraID || null
        };
      }

      // WSDOT pattern
      if (raw.CameraLocation) {
        return {
          ...base,
          label: raw.Title || raw.Description || source.label,
          embed_url: null,
          snapshot_url: raw.ImageUrl || null,
          geo: {
            lat: parseFloat(raw.CameraLocation.Latitude),
            lng: parseFloat(raw.CameraLocation.Longitude)
          },
          raw_id: raw.CameraID || null
        };
      }

      // Colorado COTrip pattern
      if (raw.deviceLocation) {
        return {
          ...base,
          label: raw.staticMessage || source.label,
          snapshot_url: raw.imageUrl || null,
          geo: {
            lat: parseFloat(raw.deviceLocation.latitude),
            lng: parseFloat(raw.deviceLocation.longitude)
          },
          raw_id: raw.deviceId || null
        };
      }

      // Generic fallback
      return {
        ...base,
        label: raw.name || raw.label || raw.title || source.label,
        snapshot_url: raw.imageUrl || raw.snapshot || raw.url || null,
        geo: raw.lat && raw.lng ? { lat: parseFloat(raw.lat), lng: parseFloat(raw.lng) } : base.geo,
        raw_id: raw.id || raw.ID || null
      };
    }

    default:
      return base;
  }
}

module.exports = { normalizeEvent };
