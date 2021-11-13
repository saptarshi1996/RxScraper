import Joi from "joi";

export class AllDrugCouponValidation {

  private payload: Joi.ObjectSchema;
  private query: Joi.ObjectSchema;

  constructor() { 
    this.setPayload();
    this.setQuery();
  }

  private setPayload(): void {
    this.payload = Joi.object({
      drug_name: Joi.string().label("Drug name"),
      zip_code: Joi.string().length(5).required().label("Zip code"),
    });
  }

  private getPayload(): Joi.ObjectSchema {
    return this.payload;
  }

  private setQuery(): void {
    this.query = Joi.object({
      site_name: Joi.string().allow(
        "buzz_rx2",
        "good_rx",
        "well_rx",
        "america_pharmacy",
        "perks_optum",
        "discount_drugs",
        "single_care",
      ).required().label("Site name"),
    });
  }

  private getQuery(): Joi.ObjectSchema {
    return this.query;
  } 

  public getSchema(): Object {
    return {
      payload: this.getPayload(),
      query: this.getQuery(),
    };
  }

}
