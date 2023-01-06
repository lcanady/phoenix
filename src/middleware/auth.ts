import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../jwt";
import { player } from "../utils";

export default async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(new Error("No token provided"));

  try {
    const _id = await verifyToken(token);
    req.body.user = await player(_id);

    next();
  } catch (error) {
    next(error);
  }
};
