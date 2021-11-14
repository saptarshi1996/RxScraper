import { Server } from "@hapi/hapi";

import { AllDrugCouponValidation } from "../validations";
import { ScraperController } from "../controllers";

class ScraperRoute {

  private routes: Array<any>;
  private readonly scraperController: ScraperController;
  private readonly tags: Array<string>;
  private readonly allDrugCouponValidation: AllDrugCouponValidation;

  constructor() {
    this.scraperController = new ScraperController();
    this.allDrugCouponValidation = new AllDrugCouponValidation();
    this.tags = ["api", "scraper"];
    this.setRoute();
  }

  private setRoute(): void {
    this.routes = [
      {
        method: "POST",
        path: "/scraper/all-drug-coupons",
        config: {
          auth: false,
          tags: this.tags,
          description: "Scrape drug coupon data",
          handler: this.scraperController.allPricesAndCouponsController,
          validate: this.allDrugCouponValidation.getSchema(),
        }
      }
    ];
  }

  public getRoute(): Object {
    return {
      name: "scraper",
      register: (server: Server) => server.route(this.routes),
    }
  }

};

export default new ScraperRoute().getRoute();
