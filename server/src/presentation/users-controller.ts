import { RequestHandler, Router } from "express";

import * as usersService from "../services/users-service";
import { Controller } from "./controller";

const createUser: RequestHandler = async (req, res, next) => {
  const result = await usersService.create(req.body);

  req.login(result, (err) => {
    if (err) {
      next(err);
    }
    res.json(result);
  });
};

const getCurrentUser: RequestHandler = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw "UNAUTHORIZED";
  }

  res.json(user);
};

const router = Router();

router.post("/create", createUser);
router.get("/me", getCurrentUser);

const usersController: Controller = {
  path: "/users",
  router,
};

export default usersController;
