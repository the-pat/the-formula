export class Config {
  environment: string;
  port: number;
  mongo: {
    connectionString: string;
    database: string;
  };
  session: {
    secret: string;
  };

  constructor() {
    this.environment = process.env.ENV || "development";
    this.port = parseInt((process.env.PORT || 4000) as string, 10);

    this.mongo = {
      connectionString: process.env.MONGO_CONNECTIONSTRING || "",
      database: process.env.MONGO_DATABASE || "",
    };
    this.session = {
      secret: process.env.SESSION_SECRET || "",
    };
  }
}
