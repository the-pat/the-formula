import compression from "compression";
import mongoSession from "connect-mongodb-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import createError, { HttpError } from "http-errors";
import logger from "morgan";
import { Config } from "./config";

import authController from "./presentation/auth-controller";
import usersController from "./presentation/users-controller";
import mongo from "./repositories/mongo";
import strategy from "./services/auth-service";

type SetupHandler = (app: Express, config: Config) => void;

const setupMiddleware: SetupHandler = (app, config) => {
  app.use(logger("dev"));
  app.use(compression());
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // sessions
  const MongoSessionStore = mongoSession(session);
  const sessionStore = new MongoSessionStore({
    uri: config.mongo.connectionString,
    collection: "sessions",
  });

  const defaultCookieOptions = { maxAge: 604800000 };
  const cookieOptions: session.CookieOptions =
    config.environment === "production"
      ? { ...defaultCookieOptions, secure: true, httpOnly: true }
      : defaultCookieOptions;

  app.use(
    session({
      secret: config.session.secret,
      resave: true,
      saveUninitialized: true,
      cookie: cookieOptions,
      store: sessionStore,
    })
  );

  return app;
};

const setupAuth: SetupHandler = (app, _config) => {
  const { initialized, session } = strategy;

  app.use(initialized);
  app.use(session);
};

const setupRoutes: SetupHandler = (app, _config) => {
  app.use(authController.path, authController.router);
  app.use(usersController.path, usersController.router);

  app.use((_req, _res, next) => {
    next(createError(404));
  });

  app.use(
    (err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500);
      res.json({
        message: err.message,
        status: err.status,
      });
    }
  );

  return app;
};

export default async (config: Config) => {
  const app = express();
  await mongo(config);

  setupMiddleware(app, config);
  setupAuth(app, config);
  setupRoutes(app, config);

  app.listen(config.port, () => {
    console.log(`Listening at ${config.port}`);
  });
};
