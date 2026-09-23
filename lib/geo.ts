const EARTH_RADIUS_KM = 6371;

const degToRad = (deg: number) => (deg * Math.PI) / 180;

export function distanceInKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const dLat = degToRad(bLat - aLat);
  const dLon = degToRad(bLon - aLon);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(degToRad(aLat)) * Math.cos(degToRad(bLat)) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
