import compression from "compression";
import mongoSession from "connect-mongodb-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import createError, { HttpError } from "http-errors";
import { Db } from "mongodb";
import logger from "morgan";
import { Config } from "./config";

import { AuthController } from "./presentation/auth-controller";
import { UsersController } from "./presentation/users-controller";
import { init } from "./repositories/db";
import { getStrategy } from "./services/auth-service";

function setupMiddleware(app: Express, config: Config) {
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
    process.env.ENV === "production"
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
}

function setupAuth(app: Express, db: Db) {
  const { initialized, session } = getStrategy(db);

  app.use(initialized);
  app.use(session);
}

function setupRoutes(app: Express, db: Db) {
  app.use(AuthController.path, new AuthController().router);
  app.use(UsersController.path, new UsersController(db).router);

  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(createError(404));
  });

  app.use(
    (err: HttpError, req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500);
      res.json({
        message: err.message,
        status: err.status,
      });
    }
  );

  return app;
}

export default async function start(config: Config) {
  const app = express();
  const db = await init(config);

  setupMiddleware(app, config);
  setupAuth(app, db);
  setupRoutes(app, db);

  app.listen(config.port, () => {
    console.log(`Listening at ${config.port}`);
  });
}
