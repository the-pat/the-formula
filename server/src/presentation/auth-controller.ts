import { RequestHandler, Router } from "express";
import passport from "passport";
import { Controller } from "./controller";

const login: RequestHandler = (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err || !user) {
      return res.status(401).json("AUTH_INVALID");
    }

    return req.logIn(user, (err) => {
      return err ? next(err) : next();
    });
  })(req, res, next);
};

const getLoggedInUser: RequestHandler = (req, res) => {
  return res.json(req.user);
};

const logout: RequestHandler = (req, res) => {
  req.logout();
  res.redirect("/");
};

const router = Router();

// POST /login
router.post("/login", login, getLoggedInUser);

// POST /logout
router.post("/logout", logout);

const authController: Controller = {
  path: "/auth",
  router,
};

export default authController;
