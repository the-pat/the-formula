import { throws } from "assert";
import { NextFunction, Request, Response, Router } from "express";
import { Db } from "mongodb";

import { UsersService } from "../services/users-service";

export class UsersController {
  static path = "/users";
  public router: Router;
  private readonly _usersService: UsersService;

  constructor(db: Db) {
    console.log("here");
    this.router = Router();
    this._usersService = new UsersService(db);

    this.router.post("/create", this.createUser);
    this.router.get("/me", this.getCurrentUser);
  }

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    const result = await this._usersService.create(req.body);

    req.login(result, (err) => {
      if (err) {
        next(err);
      }
      res.json(result);
    });
  };

  getCurrentUser = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw "UNAUTHORIZED";
    }

    res.json(user);
  };
}
