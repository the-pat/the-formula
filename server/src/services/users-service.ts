import _ from "lodash";
import { Db, ObjectId } from "mongodb";

import { User } from "../entities/user";
import { doesPasswordMatch } from "./auth-service";

export class UsersService {
  private _db: Db;

  constructor(db: Db) {
    this._db = db;
  }

  getByEmail(email: string) {
    return this._db.collection("users").findOne<User>({ email });
  }

  getById(id: string) {
    return this._db
      .collection("users")
      .findOne<User>({ _id: new ObjectId(id) });
  }

  async create(user: User) {
    const newUser = await User.create(user.email, user.password);
    await this._db.collection("users").insertOne(newUser.toMongo());
    return newUser;
  }

  async update(user: Partial<User>) {
    return await this._db
      .collection("users")
      .updateOne({ _id: user._id }, { $set: _.omit(user, "_id") });
  }

  async updatelastLoggedInAt(userId: ObjectId, lastLoginDate: Date) {
    return await this._db
      .collection("users")
      .updateOne({ _id: userId }, { $set: { lastLoggedInAt: lastLoginDate } });
  }

  async login(email: string, password: string) {
    const user = await this.getByEmail(email);
    if (!user) {
      throw "Invalid email or password";
    }

    const isMatch = await doesPasswordMatch(password, user.password);
    if (isMatch) {
      await this.updatelastLoggedInAt(user._id, new Date());
      return _.omit(user, "password");
    }

    throw "Invalid email or password";
  }
}
