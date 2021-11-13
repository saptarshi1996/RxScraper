import { Request, ResponseToolkit } from "@hapi/hapi";

import { IAllDrugCouponPayload } from "../interfaces";
import { ResponseHelper } from "../helpers";

export class ScraperController { 

  private readonly responseHelper: ResponseHelper;
  constructor() { 
    this.responseHelper = new ResponseHelper();
  }

  public allPricesAndCouponsController = (req: Request, h: ResponseToolkit) => {
    try {

      const allDrugCoupon = req.payload as IAllDrugCouponPayload;
      const siteName = req.query.site_name as string;

      console.log(allDrugCoupon);

      switch (siteName) {
        case "single_care":
          break;
        case "good_rx":
          break;
        case "america_pharmacy":
          break;
        case "buzz_rx":
          break;
        case "perks_optum":
          break;
        case "discount_drugs":
          break;
        case "well_rx":
          break;
      }

      return this.responseHelper.success(h, "SCRAPER200");

    } catch (ex) { 
      return this.responseHelper.error(h, "SERVER500", ex);
    }
  }

}
