import { config } from "dotenv";

export class Constant {

  private Environment: Object | any;
  private MedicineUrl: Object | any;
  private ApiUrl: Object | any;

  constructor() {
    config();
    this.setEnvironment();
    this.setMedicineUrl();
    this.setApiUrl();
  }

  private setEnvironment(): void {
    this.Environment = {
      "PORT": process.env.PORT,
      "ENV": process.env.ENV,
    };
  }

  public getEnvironment(): Object | any {
    return this.Environment;
  }

  public getEnvironmentByKey(key: string): string {
    return this.Environment[key];
  }

  private setMedicineUrl(): void {
    this.MedicineUrl = {
      "single_care": (drug_name: string) => `https://www.singlecare.com/prescription/${drug_name}`,
      "perks_optum": (drug_name: string) => `https://perks.optum.com/${drug_name}`,
      "americas_pharmacy": (drug_name: string, zip_code: string) => `https://www.americaspharmacy.com/drug/${drug_name}/${zip_code}`,
      "good_rx": (drug_name: string) => `https://www.goodrx.com/${drug_name}?sort_type=price`,
      "buzz_rx": (drug_name: string) => `https://www.buzzrx.com/${drug_name}-coupon`,
      "well_rx": (drug_name: string, zip_code: string) => `https://www.wellrx.com/prescriptions/${drug_name}/${zip_code}`
    };
  }

  public getMedicineUrl(key: string, drugName?: string, zipCode?: string): string {
    return this.MedicineUrl[key](drugName, zipCode);
  }

  private setApiUrl(): void {
    this.ApiUrl = {
      "well_rx_fresh_url": (drugName: string) => `https://www.wellrx.com/prescriptions/${drugName}/?freshSearch=true`,
      "well_rx_umbraco_url": (drugName: string, type: string, quantity: number, gsn: number, drugForm: string) => `https://www.wellrx.com/umbraco/Surface/DrugPricing/SetFilter?drugName=${drugName}&brand=${type}&gsn=${gsn}&bRef=${drugName}&drugForm=${drugForm}&qty=${quantity}&_=1634884050850`,
      "well_rx_mod_url": (drugName: string, zipCode: number) => `https://www.wellrx.com/prescriptions/${drugName}/${zipCode}/?isModSearch=true`,
      "americas_pharmacy_coupon_url": (name: string, dosage: string, quantity: string, form: string, price: string, groupPharmacyName: string) => `https://www.americaspharmacy.com/couponprint?q=&drugName=${name}&drugStrength=${dosage}&drugQuantity=${quantity} ${form}&price=${price}&pharmacyName=${groupPharmacyName}`,
      "buzz_rx_service_url": (drugName: string, dosageFound: string, drugType: string, form: string, quantity: string, zipCode: string) => `https://drug-service.buzzrx.com/api/v2/drug/prices?name=${drugName}&ndc=${dosageFound}&drug_type=${drugType}&form=${form}&qty=${quantity}&zip=${zipCode}&key=TJG33Q3HvGTPqZKNnXjvdVJM7zeGwDuckUpKuVwrrzaNJ9qsJB`,
      "buzz_rx_coupon_url": (couponEncode: string) => `https://www.buzzrx.com/discount-coupon?di=${couponEncode}&layout=nonav`,
      "buzz_rx_logo_url": (pharmacyName: string) => `https://buzzrx.s3.amazonaws.com/pharmacies-logos/card-logos/${pharmacyName}-200x150.png`,
      "single_care_pricing": (ndc: string, quantity: string, zipCode: string) => `https://qa.singlecare.com/api/prescription/pricing/${ndc}?quantity=${quantity}&zipCode=${zipCode}&isCustomQuantity=true`,
      "buzz_rx_api": `https://drug-service.pdcgroupservices.net/api/v2/drug/options?key=TJG33Q3HvGTPqZKNnXjvdVJM7zeGwDuckUpKuVwrrzaNJ9qsJB`,
      "discount_drugs_api": (drugName: string) => `https://api.discountdrugnetwork.com/api/Drug/FindDrugs?v=1.0&numPharm=2&zip=30301&drugName=${drugName.replace(/\s+/g, "+")}`,
      "discount_drugs_api_dose": (drugName: string) => `https://api.discountdrugnetwork.com/api/Drug/FindDrugs?v=1.0&numPharm=2&zip=30301&referencedBN=${drugName.replace(/\s+/g, "+")}`,
      "well_rx": (drug_name: string) => `https://www.wellrx.com/prescriptions/${drug_name}`,
      "discount_drug_all_pharmacy": (drugName: string, zipCode: string) => `https://api.discountdrugnetwork.com/api/Drug/FindDrugs?v=1.0&numPharm=50&zip=${zipCode}&brandIndicator=G&maxDistance=5&drugName=${drugName}`,
      "goodrx_all_drug": (drugId: string, latLong: string, quantity: number) => `https://www.goodrx.com/api/v4/drugs/${drugId}/prices?backend_drive_thru_flag_desktop_override=show_flag&location=${latLong}&location_type=LAT_LNG&quantity=${quantity}&sort_type=PRICE`,
      "perks_optum_drug_api": (ndc: string, zipCode: string, quantity: number, encodedLatLong: string, brandOrGeneric: string, drugName: string) => `https://api.perks.optum.com/api/optumperks/v1/prices?dn=${drugName}&b-g=${brandOrGeneric}&quantity=${quantity}&formulationId=${ndc}&searchLocationZipCode=${zipCode}&searchLocation=${encodedLatLong}`
    };
  }

  public getApiUrl(key: string): any {
    return this.ApiUrl[key];
  }

}
