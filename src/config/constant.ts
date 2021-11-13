import { config } from "dotenv";

export class Constant {

  Environment: Object | any;

  constructor() {
    config();
    this.setEnvironment();
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

}
