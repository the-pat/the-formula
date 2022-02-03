import _ from "lodash";
import { ObjectId } from "mongodb";

import * as mongo from "../repositories/mongo";
import { User, createUser, toMongoUser } from "../entities/user";
import { doesPasswordMatch } from "./auth-service";

const db = mongo.getInstance();

export const getByEmail = async (email: string) => {
  return await db.collection("users").findOne<User>({ email });
};

export const getById = async (id: string) => {
  return await db.collection("users").findOne<User>({ _id: new ObjectId(id) });
};

export const create = async (user: User) => {
  const newUser = await createUser(user.email, user.password);
  await db.collection("users").insertOne(toMongoUser(newUser, new Date()));
  return newUser;
};

export const update = async (user: Partial<User>) => {
  return await db
    .collection("users")
    .updateOne({ _id: user._id }, { $set: _.omit(user, "_id") });
};

export const updatelastLoggedInAt = async (
  userId: ObjectId,
  lastLoginDate: Date
) => {
  return await db
    .collection("users")
    .updateOne({ _id: userId }, { $set: { lastLoggedInAt: lastLoginDate } });
};

export const login = async (email: string, password: string) => {
  const user = await getByEmail(email);
  if (!user) {
    throw "Invalid email or password";
  }

  const isMatch = await doesPasswordMatch(password, user.password);
  if (isMatch) {
    await updatelastLoggedInAt(user._id, new Date());
    return _.omit(user, "password");
  }

  throw "Invalid email or password";
};
