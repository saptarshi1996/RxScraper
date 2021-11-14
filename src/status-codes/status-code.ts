export class StatusCode {

  private statusObject: { [key: string]: string };

  constructor() {
    this.setStatusCode();
  }

  private setStatusCode(): void {
    this.statusObject = {
      "SCRAPER200": "Scraper data fetched successfully",
      "SERVER500": "Internal Server Error",
    };
  }

  public getStatusByCode(key: string): string {
    return this.statusObject[key];
  }

};