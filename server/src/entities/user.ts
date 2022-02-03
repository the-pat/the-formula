import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  return hash;
};

export interface BaseUser {
  _id: ObjectId;
  email: string;
  password: string;
}

export interface MongoUser extends BaseUser {
  createdAt: Date;
  updatedAt: Date;
  lastLoggedInAt: Date;
}

export type UserId = { _id?: string };

export class User implements BaseUser {
  public _id: ObjectId;
  public email: string;
  public password: string;

  private constructor(email: string, password: string) {
    this._id = new ObjectId();
    this.email = email;
    this.password = password;
  }

  static async create(email: string, password: string): Promise<User> {
    const hash = await hashPassword(password);

    return new User(email, hash);
  }

  toMongo(): MongoUser {
    const timestamp = new Date();
    return {
      _id: this._id,
      email: this.email,
      password: this.password,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastLoggedInAt: timestamp,
    };
  }
}
