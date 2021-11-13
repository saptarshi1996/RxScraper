import { AxiosResponse } from "axios";

import { Constant } from "../../config";
import { IAllDrugCouponPayload, IDrugScraperResponse } from "../../interfaces";
import { AxiosService, PuppeteerService } from "../http-service";

export class GoodRxService {

  private readonly constant: Constant;

  private axiosService: AxiosService;

  constructor() {
    this.constant = new Constant();
  }

  public scrapeGoodRx(drugPayload: IAllDrugCouponPayload): Promise<Array<IDrugScraperResponse>> {
    return new Promise(async (resolve, reject) => {
      try {

        const drugId: number = await new PuppeteerService().getGoodRxDrugId(drugPayload);
        this.axiosService = new AxiosService();

        const { data } = await this.axiosService.getRequest(`https://www.goodrx.com/api/v4/location?query=${drugPayload.zip_code}`);
        const { latitude, longitude } = data;
        const encodedLatLong: string = `${latitude}%2C${longitude}`;
        const goodRXUrl: string = this.constant.getApiUrl("goodrx_all_drug")(drugId, encodedLatLong, drugPayload.quantity);
        const drugResponse: AxiosResponse = await this.axiosService.getRequest(goodRXUrl, {
          headers: {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9,hi;q=0.8,la;q=0.7",
            "grx-api-client-id": "8f9b4435-0377-46d7-a898-e1b656649408",
            "grx-api-version": "2017-11-17",
            "sec-ch-ua": "\"Chromium\";v=\"94\", \"Google Chrome\";v=\"94\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Linux\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-grx-internal-user": "true",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
            "referrer": "https://www.goodrx.com/",
          }
        });

        let finalResult: Array<IDrugScraperResponse> = [];
        if (drugResponse && drugResponse.data) {
          const { results } = drugResponse.data as any;
          finalResult = results.map((result: Object | any) => {
            const name: string = result.pharmacy.name;
            const distance: string = Number(result.pharmacy.distance_mi).toFixed(2);
            const coupon: any = result.prices.find((price: Object | any) => price.type === 'COUPON');
            return {
              name,
              distance: [distance],
              price: coupon ? Number(coupon.price).toFixed(2) : null,
            };
          });

          finalResult = finalResult.filter(res => res.price);
        }

        resolve(finalResult);

      } catch (ex) {
        console.log(ex.message);
        reject(ex);
      }
    });
  }

}
