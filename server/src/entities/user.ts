import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  return hash;
};

export interface User {
  _id: ObjectId;
  email: string;
  password: string;
}

export interface MongoUser extends User {
  createdAt: Date;
  updatedAt: Date;
  lastLoggedInAt: Date;
}

export type UserId = { _id?: string };

export const createUser = async (
  email: string,
  password: string
): Promise<User> => {
  const hash = await hashPassword(password);

  return { _id: new ObjectId(), email, password: hash };
};

export const toMongoUser = (user: User, timestamp: Date) => ({
  _id: user._id,
  email: user.email,
  password: user.password,
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoggedInAt: timestamp,
});
