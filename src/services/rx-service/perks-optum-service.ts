import { AxiosResponse } from "axios";

import { parse } from "node-html-parser";
import { Constant } from "../../config";
import { IAllDrugCouponPayload, IDrugScraperResponse } from "../../interfaces";
import { MiscHelper } from "../../helpers";

import { AxiosService, PuppeteerService } from "../http-service";

export class PerksOptumService {

  private puppeteerService: PuppeteerService;
  private readonly constant: Constant;
  private readonly axiosService: AxiosService;
  private readonly miscHelper: MiscHelper;

  constructor() {
    this.constant = new Constant();
    this.axiosService = new AxiosService();
    this.miscHelper = new MiscHelper();
  }

  public getFormattedDrugName(drugPayload: IAllDrugCouponPayload): string {
    const lowerCaseDrug: string = drugPayload.drug_name.toLowerCase();
    const encodedName: string = this.miscHelper.encodeDrugName(lowerCaseDrug, "perks_optum");
    return this.constant.getMedicineUrl("perks_optum", encodedName);
  }

  public getFetchDrug(formattedUrl: string): Promise<Object | any> {
    return new Promise(async (resolve, reject) => {
      try {
        this.puppeteerService = new PuppeteerService();
        const fetchDrug: Object | any = await this.puppeteerService.perksOptumStateData(formattedUrl);
        resolve(fetchDrug);
      } catch (ex) {
        reject();
      }
    });
  }

  private getPerksOptumToken(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const tokenResponse: AxiosResponse<any> = await this.axiosService.postRequest("https://perks.optum.com/api/oauth/token", {}, {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9,hi;q=0.8,la;q=0.7",
          "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
          "sec-ch-ua-mobile": "?0",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-dtpc": "x-dtpc",
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
        });

        resolve(tokenResponse.data);
      } catch (ex) {
        console.log(ex.message);
        reject(ex);
      }
    });
  }

  private fetchPerksOptumApi(ndc: string, zipCode: string, quantity: string, brandGeneric: string, drugName: string): Promise<Array<any>> {
    return new Promise(async (resolve, reject) => {
      try {

        const { data } = await this.axiosService.getRequest(`https://www.goodrx.com/api/v4/location?query=${zipCode}`);
        const { latitude, longitude } = data;
        const encodedLatLong: string = `${latitude},${longitude}`;
        const tokenResponse: Object | any = await this.getPerksOptumToken();
        const apiResponse: AxiosResponse<any> = await this.axiosService.getRequest(this.constant.getApiUrl("perks_optum_drug_api")(ndc, zipCode, quantity, encodedLatLong, brandGeneric, drugName),
          {
            headers: {
              "x-app-id": "Optum Perks",
              "x-correlation-id": "x-correlation-id",
              "x-account-id": "x-account-id",
              "authorization": `${tokenResponse.token_type} ${tokenResponse.access_token}`,
            }
          });

        const apiResponseData: Array<any> = apiResponse.data.data.map((api: any) => {
          const responseCoordinates: [number, number] = [
            api.retailer.location.coordinates.latitude,
            api.retailer.location.coordinates.longitude,
          ];

          return {
            ...api,
            miles: this.miscHelper.haversineDistance(responseCoordinates, [Number(latitude), Number(longitude)], true),
          };
        });

        resolve(apiResponseData);
      } catch (ex) {
        console.log(ex);
        reject(ex);
      }
    });
  }

  public getNextDataObject(siteUrl: string) {
    return new Promise(async (resolve, reject) => {
      try {

        const nextDataObject: AxiosResponse<any> = await this.axiosService.getRequest(siteUrl);
        const pageData: HTMLElement | any = parse(nextDataObject.data)
        const jsonString: string = pageData.querySelector("script[id='__NEXT_DATA__']").text;
        const nextInfo: Object | any = JSON.parse(jsonString);
        let { defaultSettings, ...fetchDrug } = nextInfo.props.initialState.drugs.fetchDrug;
        resolve(fetchDrug);

      } catch (ex) {
        console.log(ex.message);
        reject(ex);
      }
    });
  }

  public setPerksOptumResponse(formDosageNdc: Object | any, drugPayload: IAllDrugCouponPayload, drugName: string): Promise<IDrugScraperResponse[]> {
    return new Promise(async (resolve, reject) => {
      try {

        const drugId: number = formDosageNdc.id;
        const ndc: string = formDosageNdc.drugId;
        const drugUrlSlug: string = formDosageNdc.drugUrlSlug;
        const dosage: string = formDosageNdc.dosage.display;

        const apiResponse: Array<any> = await this.fetchPerksOptumApi(formDosageNdc.ndc, drugPayload.zip_code, drugPayload.quantity, formDosageNdc.drugType, drugName);

        const finalResult: Array<IDrugScraperResponse> = apiResponse.map((apiData) => {
          const payload = {
            name: apiData.retailer.name,
            price: apiData.price.amount,
            distance: [Number(apiData.miles).toFixed(2)],
            priceCurrency: apiData.price.currency,
            drugName,
            dosageDisplay: dosage,
            drugUrlSlug,
            lowPriceAmount: apiData.price.amount,
            formulationId: ndc,
            pbmId: apiData.pbmId,
            ndc,
            quantityDisplay: drugPayload.quantity,
            drugId,
            triggerPerks: true,
          };

          return {
            ...payload,
            reference_details: JSON.stringify(payload),
          };
        })
          .filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i) // Remove duplicates
          .filter((store) => store.name != "Optum Store") // remove optum store.
          .sort((a, b) => { return Number(a.price) - Number(b.price) });

        resolve(finalResult);

      } catch (ex) {
        console.log(ex.message);
        reject(ex);
      }
    });
  }

  public scrapePerksOptum(drugPayload: IAllDrugCouponPayload): Promise<IDrugScraperResponse[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const formattedUrl: string = this.getFormattedDrugName(drugPayload);
        const fetchDrug: Object | any = await this.getNextDataObject(formattedUrl);
        const formDosageNdc: Object | any = fetchDrug.formulations.find((formulation: any) => formulation.name === drugPayload.drug_name);
        const result: Array<IDrugScraperResponse> = await this.setPerksOptumResponse(formDosageNdc, drugPayload, drugPayload.drug_name);
        resolve(result);
      } catch (ex) {
        resolve([]);
      }
    });
  }

}
