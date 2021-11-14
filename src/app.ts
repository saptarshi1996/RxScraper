import { Server, ServerRegisterPluginObject } from "@hapi/hapi";

import * as HapiSwagger from 'hapi-swagger';
import * as Vision from "@hapi/vision";
import * as Inert from "@hapi/inert";

import { Constant } from "./config";
import { Route } from "./routes";

export class Application { 

  private readonly constant: Constant;

  // Create server
  private server: Server;
  private swaggerOptions: HapiSwagger.RegisterOptions;

  constructor() {

    this.constant = new Constant();
    
    this.server = new Server({
      port: this.constant.getEnvironmentByKey("PORT"),
      routes: {
        cors: true,
      }
    });

    this.swaggerOptions = {
      info: {
        title: 'RX Scraper API Documentation'
      },
      grouping: 'tags',
      basePath: '/scraper',
      documentationPath: '/scraper/documentation',
      jsonPath: '/scraper/swagger.json',
      swaggerUIPath: '/scraper/swagger/ui',
      schemes: ['https', 'http'], 
    };
  }
  
  private async setPlugin() {

    const plugin: Array<ServerRegisterPluginObject<any>> = [ 
      {
        plugin: Inert
      },
      {
        plugin: Vision
      },
      {
        plugin: HapiSwagger,
        options: this.swaggerOptions,
      },
    ];

    await this.server.register(plugin);

  }

  private async setRoute() {
    this.server.register(Route, {
      routes: {
        prefix: '/scraper'
      }
    });
  }

  public async start() {

    // Load setters.
    await this.setRoute();
    await this.setPlugin();
    
    // Start server
    console.log(`Server on port ${this.constant.getEnvironmentByKey("PORT")}`);
    await this.server.start();
  }

}