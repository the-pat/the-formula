import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";

export class AuthController {
  static path = "/auth";
  public router: Router;

  constructor() {
    this.router = Router();

    // POST /login
    this.router.post("/login", this.login, this.getLoggedInUser);

    // POST /logout
    this.router.post("/logout", this.logout);
  }

  login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("local", function (err, user) {
      if (err || !user) {
        return res.status(401).json("AUTH_INVALID");
      }

      return req.logIn(user, function (err) {
        return err ? next(err) : next();
      });
    })(req, res, next);
  }

  getLoggedInUser(req: Request, res: Response) {
    return res.json(req.user);
  }

  logout(req: Request, res: Response) {
    req.logout();
    res.redirect("/");
  }
}
