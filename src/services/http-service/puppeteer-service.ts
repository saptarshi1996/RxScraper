import puppeteer, { Browser, Page } from "puppeteer";

import { IAllDrugCouponPayload, IDrugScraperResponse } from "../../interfaces";

export class PuppeteerService {

  private browser: Browser;
  private page: Page;

  constructor() {
  }

  /**
   * Create a new browser instance from env
   * @param useProxy 
   */
  public async createBrowser(): Promise<void> {
    this.browser = await puppeteer.connect({ browserWSEndpoint: 'ws://browserless:3000' });
  }

  /**
   * Create a new page for the browser
   * @returns 
   */
  public createPage(): Promise<Page> {
    return new Promise(async (resolve, reject) => {
      this.page = await this.browser.newPage();
      await this.page.setRequestInterception(true);
      resolve(this.page);
    });
  }

  /**
   * Close browser if open
   */
  public async closeBrowser(): Promise<void> {
    try {
      await this.browser.close();
    } catch (ex) {
      console.log(ex.message);
    }
  }

  /**
   * Get goodrx data
   * @param drugPayload 
   * @returns 
   */
  public getGoodRxDrugId(drugPayload: IAllDrugCouponPayload): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {

        await this.createBrowser();
        await this.createPage();
        this.page.on("request", (request) => {
          if ([].indexOf(request.resourceType()) !== -1) {
            request.abort();
          } else {
            request.continue();
          }
        });

        const url: string = `https://www.goodrx.com/${drugPayload.drug_name.toLowerCase()}`;
        await this.page.goto(url, {
          waitUntil: "domcontentloaded",
        });

        const state: any = await this.page.evaluate(() => {
          return (window as any).__state__;
        });

        await this.closeBrowser();

        const choiceList: any[] = state.reduxAsyncConnect.catchAllPageData.drugConcepts.choices;
        const choice: any = choiceList.find((choice: any) => drugPayload.drug_name.toLowerCase() == choice.label.name.toLowerCase());
        const drugId: number = choice.id;

        resolve(drugId);

      } catch (ex) {
        await this.closeBrowser();
        reject(ex);
      }
    });
  }

  public getWellRxData(drugPayload: IAllDrugCouponPayload): Promise<IDrugScraperResponse[]> { 
    return new Promise(async (resolve, reject) => {
      try {

        await this.createBrowser();
        await this.createPage();

        const siteUrl: string = `https://www.wellrx.com/prescriptions/${drugPayload.drug_name}/${drugPayload.zip_code}`;
        this.page.on("request", (request) => {
          if (["font", "image", "stylesheet"].indexOf(request.resourceType()) !== -1) {
            request.abort();
          } else {
            request.continue();
          }
        });

        await this.page.goto(siteUrl, {
          waitUntil: "networkidle0",
        });

        const result: IDrugScraperResponse[] | any = await this.page.evaluate(() => {
          return Array.from(document.getElementsByClassName("grid-x pharmCard")).map((grid: any) => {
            const name: any = grid.getElementsByClassName("list-title")[0].textContent ? grid.getElementsByClassName("list-title")[0].textContent : grid.getElementsByClassName("list-title")[0].children[0].innerText;
            const price = grid.getElementsByClassName("price price-large")[0].textContent.replace(/\$/g, "");    
            return {
              name: name,
              price,
              distance: Array.from(grid.getElementsByClassName("pharmacy-locations")).map((distances: any) => {
                return Array.from(distances.getElementsByClassName("list-contact-text")).map((distance: any) => distance.textContent.replace(/[\s\n]/g, "")).filter(distance => distance.includes("mi"));
              })[0],
            };
          });
        });

        await this.closeBrowser();
        resolve(result)

      } catch (ex) {
        console.log(ex.message);
        await this.closeBrowser();
        resolve([]);
      }
    });
  }

  /**
   * Get well rx cookie from browser
   * @param drugPayload
   * @returns 
   */
  public getWellRxCookie(drugPayload: IAllDrugCouponPayload): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {

        await this.createBrowser();
        await this.createPage();

        const siteUrl: string = `https://www.wellrx.com/prescriptions/${drugPayload.drug_name}/`;
        this.page.on("request", (request) => {
          if (["font", "image", "stylesheet"].indexOf(request.resourceType()) !== -1) {
            request.abort();
          } else {
            request.continue();
          }
        });

        await this.page.goto(siteUrl, {
          waitUntil: "networkidle0",
        });


        const cookies: Array<any> = await this.page.cookies();
        await this.closeBrowser();
        const cookieKeyValue = cookies.map((cookie) => `${cookie.name}=${cookie.value};`);
        const cookieString = cookieKeyValue.join(" ");
        resolve(cookieString);

      } catch (ex) {
        await this.closeBrowser();
        reject(ex);
      }
    });
  }

  /**
   * Get Buzzrx Cookie
   * @param drugName 
   * @param url 
   * @returns 
   */
  public getBuzzRxCookies(drugName: string, url: string): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.createBrowser();
        await this.createPage();
        let reqHeaders: { cookie?: Object } = {};
        this.page.on("request", (request) => {
          if (request.url().includes(`https://www.buzzrx.com/drug-info/${drugName}?`)) {
            reqHeaders = request.headers();
          }
          if (["font", "image", "stylesheet"].indexOf(request.resourceType()) !== -1) {
            request.abort();
          } else {
            request.continue();
          }
        });

        await this.page.goto(url, {
          waitUntil: "networkidle0",
        });

        const cookies: Array<any> = await this.page.cookies();
        await this.closeBrowser();
        const cookieKeyValue = cookies.map((cookie) => `${cookie.name}=${cookie.value};`);
        const cookieString = cookieKeyValue.join(" ");
        reqHeaders.cookie = cookieString;
        resolve(reqHeaders);
      } catch (ex) {
        await this.closeBrowser();
        reject(ex);
      }
    });
  }

  /**
   * Fetch perks optum state data from site
   * @param url 
   * @returns 
   */
  public perksOptumStateData(url: string) {
    return new Promise(async (resolve, reject) => {
      try {
        // Prevent the following in list from loading
        await this.createBrowser();
        await this.createPage();
        const components: Array<string> = ["font", "image", "stylesheet"];
        this.page.on("request", async (request) => {
          if (components.indexOf(request.resourceType()) !== -1) {
            request.abort();
          } else {
            request.continue();
          }
        });
        // Load page
        await this.page.goto(url, {
          waitUntil: "networkidle0",
          timeout: 0,
        });

        let masterProperties = JSON.parse(await this.page.$eval('#__NEXT_DATA__', (el: Element) => el.textContent));
        await this.closeBrowser();
        let { defaultSettings, ...fetchDrug } = masterProperties.props.initialState.drugs.fetchDrug;
        resolve(fetchDrug);
      } catch (ex) {
        console.log(ex.message);
        await this.closeBrowser();
        reject(ex);
      }
    });
  }


}
