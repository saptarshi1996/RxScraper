import puppeteer, { Browser, Page } from "puppeteer";

import { IAllDrugCouponPayload } from "../../interfaces";

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
    this.browser = await puppeteer.launch();
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
