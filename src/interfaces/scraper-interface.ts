export interface IAllDrugCouponPayload { 
  drug_name: string;
  zip_code: string;
  quantity: string;
};

export interface IDrugScraperResponse {
  name?: string;
  distance?: Array<string>;
  price?: number;
}
