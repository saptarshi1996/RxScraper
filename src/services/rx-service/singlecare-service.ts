import { AxiosResponse } from "axios";

import { MiscHelper } from "../../helpers";
import { Constant } from "../../config";
import { IAllDrugCouponPayload, IDrugScraperResponse } from "../../interfaces";
import { AxiosService } from "../http-service";

export class SingleCareService {

  private readonly constant: Constant;
  private readonly axiosService: AxiosService;
  private readonly miscHelper: MiscHelper;

  constructor() {
    this.axiosService = new AxiosService();
    this.constant = new Constant();
    this.miscHelper = new MiscHelper();
  }

  private getFormattedDrugName(drugPayload: IAllDrugCouponPayload): string {
    const lowerCaseDrug: string = drugPayload.drug_name.toLowerCase();
    const encodedName: string = this.miscHelper.encodeDrugName(lowerCaseDrug, "single_care");
    return this.constant.getMedicineUrl("single_care", encodedName);
  }

  private getSingleCareTargetNdc(qaUrl: string, drugPayload: IAllDrugCouponPayload): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {

        const qaResponse: AxiosResponse = await this.axiosService.getRequest(`${qaUrl}?zipCode=${drugPayload.zip_code}`);
        const { drugStructure: { brandTypes } } = qaResponse.data as any;
        const brandExists: Object | any = brandTypes.find((brand: any) => brand.brand.toLowerCase() === drugPayload.drug_name.toLowerCase());

        const targetNDC: string = brandExists.ndc;
        resolve(targetNDC);

      } catch (ex) {
        console.log(ex.message);
        reject(ex);
      }
    });
  }

  private getFinalResult(targetNDC: string, drugPayload: IAllDrugCouponPayload, formattedUrl: string): Promise<Array<IDrugScraperResponse>> {
    return new Promise(async (resolve, reject) => {
      try {

        const reqUrl: string = this.constant.getApiUrl("single_care_pricing")(targetNDC, drugPayload.quantity, drugPayload.zip_code);
        const qaPriceResponse: AxiosResponse = await this.axiosService.getRequest(reqUrl);
        const { PharmacyPricings } = qaPriceResponse.data as any;
        const pharmacyList: Array<any> = PharmacyPricings;
        const finalResult: Array<IDrugScraperResponse> = pharmacyList.map((pharmacy: Object | any) => {
          const { Prices, Pharmacy, isGeniusRx }: any = pharmacy;
          if (!isGeniusRx) {
            return {
              name: Pharmacy.Name,
              distance: [Number(Pharmacy.Distance).toFixed(2)],
              price: Number(Prices[0].LoyaltyPrice),
            };
          }
        }).filter(pharmacy => pharmacy);

        resolve(finalResult);

      } catch (ex) {
        console.log(ex.message);
        reject(ex);
      }
    });
  }

  public scrapeSingleCare(drugPayload: IAllDrugCouponPayload): Promise<IDrugScraperResponse[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const formattedUrl: string = this.getFormattedDrugName(drugPayload);
        const qaUrl: string = this.miscHelper.editSingleCareUrl(formattedUrl);
        const targetNDC: string = await this.getSingleCareTargetNdc(qaUrl, drugPayload);
        const result: Array<IDrugScraperResponse> = await this.getFinalResult(targetNDC, drugPayload, formattedUrl);
        resolve(result);
      } catch (ex) {
        resolve([]);
      }
    });
  }

}
