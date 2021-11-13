import { AxiosResponse } from "axios";

import { Constant } from "../../config";
import { IAllDrugCouponPayload, IDrugScraperResponse } from "../../interfaces";
import { MiscHelper } from "../../helpers";

import { AxiosService, PuppeteerService } from "../http-service";

export class BuzzRxService {

  private readonly constant: Constant;
  private readonly miscHelper: MiscHelper;
  private readonly axiosService: AxiosService;

  private puppeteerService: PuppeteerService;

  constructor() {
    this.miscHelper = new MiscHelper();
    this.constant = new Constant();
    this.axiosService = new AxiosService();
  }

  private getFormattedDrugName(drugPayload: IAllDrugCouponPayload): string {
    const lowerCaseDrug: string = drugPayload.drug_name.toLowerCase();
    const encodedName: string = this.miscHelper.encodeDrugName(lowerCaseDrug, "buzz_rx");
    return this.constant.getMedicineUrl("buzz_rx", encodedName);
  }

  private async getGetRequestCookies(drugName: string, formattedUrl: string): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      try {
        this.puppeteerService = new PuppeteerService();
        const requestHeaders = await this.puppeteerService.getBuzzRxCookies(drugName, formattedUrl);
        resolve(requestHeaders);
      } catch (ex) {
        console.log(ex.message);
        reject(ex);
      }
    });
  }

  private getBuzzRxHeaders(drugPayload: IAllDrugCouponPayload, formattedUrl: string): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      try {
        let requestHeaders: Object | any = await this.getGetRequestCookies(drugPayload.drug_name, formattedUrl);
        resolve(requestHeaders);
      } catch (ex) {
        console.log(ex.message);
        reject(ex);
      }
    });
  }

  private getFinalResult(drugPayload: IAllDrugCouponPayload, formFound: Object | any, requestHeaders: Object, dosageFound: any, drugType: string): Promise<IDrugScraperResponse[]> {
    return new Promise(async (resolve, reject) => {
      try {

        const formatHclName: string = this.formatHCLUrl(drugPayload.drug_name);
        const finalUrl: string = this.constant.getApiUrl("buzz_rx_service_url")(formatHclName, dosageFound, drugType, formFound.form, drugPayload.quantity, drugPayload.zip_code);
        const finalResponse: AxiosResponse<any> = await this.axiosService.getRequest(finalUrl, requestHeaders);
        const finalResult: Array<IDrugScraperResponse> = finalResponse.data.data.map((drug: Object | any) => {
          return {
            name: drug.PharmacyName,
            price: drug.network_price,
            distance: [0],
          };
        });
        resolve(finalResult);
      } catch (ex) {
        console.log(ex.message);
        reject(ex);
      }
    });
  }

  private formatHCLUrl(drugName: string): string {
    // If the name has HCL. we send only the first part of the name to API.
    return drugName.includes("HCL") || drugName.includes("Hcl") || drugName.includes("hcl") ? drugName.split(" ")[0] : drugName.replace(/\s+/g, "+");
  }

  private getBuzzRxFormDosageData(drugPayload: IAllDrugCouponPayload, requestHeaders: Object): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      try {

        const formatHclName: string = this.formatHCLUrl(drugPayload.drug_name);
        const drugType: string = "G";
        const drugUrl: string = `${this.constant.getApiUrl("buzz_rx_api")}&drug_type=${drugType}&name=${formatHclName}`;
        const responseBuzz1: AxiosResponse<any> = await this.axiosService.getRequest(drugUrl, requestHeaders);
        
        const formFoundKey = Object.keys(responseBuzz1.data.data.forms).find((key, value) => responseBuzz1.data.data.forms[key].select);
        const dosageFound: Object | any = Object.keys(responseBuzz1.data.data.strengths).find((key) => responseBuzz1.data.data.strengths[key].select);

        const formFound: Object | any = responseBuzz1.data.data.forms[formFoundKey];
        const dosageObject: Object | any = responseBuzz1.data.data.strengths[dosageFound];

        resolve({ dosageFound, drugType, dosageObject, formFound });
        
      } catch (ex) {
        console.log(ex.message);
        reject(ex);
      }
    })
  }

  public scrapeBuzzRx(drugPayload: IAllDrugCouponPayload): Promise<IDrugScraperResponse[]> {
    return new Promise(async (resolve, reject) => { 
      try {
        const formattedUrl: string = this.getFormattedDrugName(drugPayload);
        const requestHeaders: Object = await this.getBuzzRxHeaders(drugPayload, formattedUrl);
        const { dosageFound, drugType, dosageObject, formFound } = await this.getBuzzRxFormDosageData(drugPayload, requestHeaders) as Object | any;
        const result: IDrugScraperResponse[] = await this.getFinalResult(drugPayload, formFound, requestHeaders, dosageFound, drugType);
        resolve(result);
      } catch (ex) {
        console.log(ex.message);
        resolve([]);
      }
    });
  }

}
