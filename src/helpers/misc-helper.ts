export class MiscHelper {

  private readonly radiusOfEarthInKm: number;

  constructor() {
    this.radiusOfEarthInKm = 6371;
  }

  /**
   * Encode drug name for url.
   * @param drugName 
   * @param siteName 
   * @returns { Number }
   */
  public encodeDrugName(drugName: string, siteName: string): string {
    if (siteName == 'well_rx') {
      return drugName;
    } else {
      return drugName.replace(/\s+/g, "-");
    }
  }
  
  /**
   * Get qa url from live
   * @param formattedUrl 
   * @returns 
   */
  public editSingleCareUrl(formattedUrl: string): string { 
    const qaUrl: string = formattedUrl.replace(/\/prescription\//g, "/api/prescription/");
    return qaUrl.replace(/www/g, "qa");
  }

  /**
   * Get distance
   * @param a 
   * @param b 
   * @returns { Number }
   */
  private distance(a: number, b: number): number {
    return (Math.PI / 180) * (a - b);
  }

  /**
   * Convert to radian
   * @param angle 
   * @returns { Number }
   */
  private toRadian(angle: number) {
    return (Math.PI / 180) * angle;
  }

  /**
   * Calculate Haversine distance.
   * @param param0
   * @param param1 
   * @param isMiles
   * @returns { Number }
   */
  public haversineDistance = ([lat1, lon1]: [number, number], [lat2, lon2]: [number, number], isMiles: boolean = false): number => {

    const dLat = this.distance(lat2, lat1);
    const dLon = this.distance(lon2, lon1);

    lat1 = this.toRadian(lat1);
    lat2 = this.toRadian(lat2);

    // Haversine Formula
    const a: number = Math.pow(Math.sin(dLat / 2), 2) + Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    const c: number = 2 * Math.asin(Math.sqrt(a));

    let finalDistance: number = this.radiusOfEarthInKm * c;

    if (isMiles) {
      finalDistance /= 1.60934;
    }

    return finalDistance;
  }

}
