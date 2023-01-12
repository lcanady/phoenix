import { decode, sign, verify } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const signToken = async (_id: string) =>
  new Promise<any>((resolve, reject) =>
    sign(
      _id,
      process.env.JWT_SECRET || "youshouldreallychangethis",
      {},
      (err: any, token: any) => {
        if (err) reject(err);
        resolve(token);
      }
    )
  );

export const verifyToken = async (token: string) =>
  new Promise<any>((resolve, reject) =>
    verify(
      token,
      process.env.JWT_SECRET || "youshouldreallychangethis",
      (err: any, decoded: any) => {
        if (err) reject(err);
        resolve(decoded);
      }
    )
  );
