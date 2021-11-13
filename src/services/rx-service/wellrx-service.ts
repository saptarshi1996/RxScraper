import { IAllDrugCouponPayload, IDrugScraperResponse } from "../../interfaces";
import { PuppeteerService } from "../http-service";

export class WellRxService {

  constructor() {
  }

  /**
   * Update dosage amount details for drug.
   * @param drugPayload 
   * @param drugDetails 
   * @param gsnDetails 
   * @returns { Promise }
   */
  public scrapeWellRx(drugPayload: IAllDrugCouponPayload): Promise<IDrugScraperResponse[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const result: IDrugScraperResponse[] = await new PuppeteerService().getWellRxData(drugPayload);
        resolve(result);
      } catch (ex) {
        console.log(ex.message);
        resolve([]);
      }
    });
  }
  
}
