import { Router } from "express";
import { sha512 } from "js-sha512";
import { db } from "../database";
import { signToken } from "../jwt";
import { dbObj, player } from "../utils";

const router = Router();

router.post("/", async (req, res) => {
  const user = await player(req.body?.username || "");
  if (!user)
    return res.status(401).json({ error: "Invalid Username or Password" });
  if (user.data?.password !== sha512(req.body?.password || ""))
    return res.status(401).json({ error: "Invalid Username or Password" });
  const token = await signToken(user._id!);

  res.status(200).json({ token });
});

router.post("/register", async (req, res) => {
  const user = await player(req.body.username);
  if (user) return res.status(401).json({ error: "Username already exists" });

  const obj = await dbObj(req.body.username, "player", {
    password: sha512(req.body.password),
  });

  const token = await signToken(obj?._id || "");
  res.status(200).json({ token });
});

export default router;
