import bcrypt from "bcryptjs";
import { Strategy } from "passport-local";
import passport from "passport";

import * as repo from "../repositories/mongo";
import * as usersService from "./users-service";
import { UserId } from "../entities/user";

const db = repo.getInstance();

const localStrategy = new Strategy(
  { usernameField: "email" },
  async (email, password, done) => {
    const user = await usersService.login(email, password);
    return done(null, user);
  }
);

passport.use(localStrategy);

passport.serializeUser((user: UserId, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await usersService.getById(id);
  if (user) {
    return done(null, user);
  }

  return done("User not found");
});

const strategy = {
  initialized: passport.initialize(),
  session: passport.session(),
};

export default strategy;

export const doesPasswordMatch = bcrypt.compare;
