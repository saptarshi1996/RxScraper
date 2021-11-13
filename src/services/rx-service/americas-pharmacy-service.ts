import { parse } from "node-html-parser";
import { AxiosResponse } from "axios";

import { Constant } from "../../config";
import { MiscHelper } from "../../helpers";
import { AxiosService } from "../http-service";
import { IAllDrugCouponPayload, IDrugScraperResponse } from "../../interfaces";

export class AmericaPharmacyService {

  private readonly axiosService: AxiosService;
  private readonly constant: Constant;
  private readonly miscHelper: MiscHelper;

  constructor() {
    this.constant = new Constant();
    this.axiosService = new AxiosService();
    this.miscHelper = new MiscHelper();
  }

  private getFormattedDrugName(drugPayload: IAllDrugCouponPayload): string {
    const lowerCaseDrug: string = drugPayload.drug_name.toLowerCase();
    const encodedName: string = this.miscHelper.encodeDrugName(lowerCaseDrug, "americas_pharmacy");
    return this.constant.getMedicineUrl("americas_pharmacy", encodedName, drugPayload.zip_code);
  }

  private fetchBaseSiteAndStoreData(formattedUrl: string): Promise<Object | any> { 
    return new Promise(async (resolve, reject) => {  
      try {
        const siteResponse: AxiosResponse<any> = await this.axiosService.getRequest(formattedUrl);
        const pageData: any = parse(siteResponse.data);
        const jsonString: string = pageData.querySelector("script[type='application/json']").text;
        const drugInfoJSON: Object = JSON.parse(jsonString);
        resolve(drugInfoJSON);
      } catch(ex) {
        console.log(ex.message);
        reject(ex);
      }
    });
  }

  private getSiteResponseAmericaPharmacy(formattedUrl: string, drugPayload: IAllDrugCouponPayload): Promise<IDrugScraperResponse[]> {
    return new Promise(async (resolve, reject) => {
      try {

        // Check if base site response exists?
        const drugInfoJSON: Object | any = await this.fetchBaseSiteAndStoreData(formattedUrl);
        const alternateDrugFound: Object | any = drugInfoJSON.search_map_options.data.alternateDrugs.find((drug: any) => drug.medName.toLowerCase() == drugPayload.drug_name.toLowerCase());
        const selectedDrugResponse: AxiosResponse<any> = await this.axiosService.postRequest(formattedUrl, `locationName=${drugPayload.zip_code}&bdrugnameFilter=${alternateDrugFound.bgFlag}_${alternateDrugFound.medName}&form_id=drug_search_filter_form&filterType=name&bgFlag=${alternateDrugFound.bgFlag}`, { 'Content-Type': 'application/x-www-form-urlencoded' });
        const pageDataAlternate: any = parse(selectedDrugResponse.data);
        const jsonStringAlternate: string = pageDataAlternate.querySelector("script[type='application/json']").text;
        const drugInfoJSONAlternate: Object | any = JSON.parse(jsonStringAlternate);
        const finalResult: Array<IDrugScraperResponse> = drugInfoJSONAlternate.search_map_options.data.drugArray.map((drug: any) => {
          const distances: Array<string> = drug.pharmacyPrices.map((price: Object | any) => price.pharmacy.distance);
          return {
            name: drug.groupPharmacyName,
            price: drug.price,
            distance: distances,
          };
        });
        
        resolve(finalResult);

      } catch (ex) {
        console.log(ex.message);
        reject(ex);
      }
    });
  }

  public scrapeAmericasPharmacy(drugPayload: IAllDrugCouponPayload): Promise<IDrugScraperResponse[]> {
    return new Promise(async (resolve, reject) => { 
      try {
        const formattedUrl: string = this.getFormattedDrugName(drugPayload);
        const result: IDrugScraperResponse[] = await this.getSiteResponseAmericaPharmacy(formattedUrl, drugPayload) as Object | any;
        resolve(result);
      } catch (ex) { 
        resolve([]);
      }
    });
  }

}
