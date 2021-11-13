import axios, { AxiosResponse } from "axios";

export class AxiosService {

  constructor() {
  }

  public postRequest(url: string, payload: Object, headers?: any): Promise<AxiosResponse<any>> {
    return axios.post(url, payload, headers);
  }

  public getRequest(url: string, headers?: any): Promise<AxiosResponse<any>> {
    return axios.get(url, headers);
  }

}
