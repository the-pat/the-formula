import { MongoClient, Db } from "mongodb";
import { Config } from "../config";

let db: Db;

export const init = async (config: Config) => {
  if (db) {
    return db;
  }

  db = await MongoClient.connect(config.mongo.connectionString).then((client) =>
    client.db(config.mongo.database)
  );

  return db;
};
