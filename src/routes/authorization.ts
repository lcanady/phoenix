import { Router } from "express";
import { sha512 } from "js-sha512";
import { db } from "../database";
import flags from "../flags";
import { signToken, verifyToken } from "../jwt";
import { dbObj, player } from "../utils";

const router = Router();

router.post("/", async (req, res) => {
  const user = await player(req.body?.username || "");
  if (!user)
    return res.status(401).json({ error: "Invalid Username or Password" });
  if (user.data?.password !== sha512(req.body?.password || ""))
    return res.status(401).json({ error: "Invalid Username or Password" });
  const token = await signToken(user._id!);

  res.status(200).json({
    token,
    user: {
      id: user?._id,
      dbref: `#${user.dbref}`,
      username: user?.name,
      flags: user?.flags,
      isAdmin: flags.check(user?.flags || "", "builder+"),
    },
  });
});

router.get("/user", async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || "";
  if (token) {
    try {
      const _id = await verifyToken(token || "");
      const user = await db.findOne({ _id });
      if (!user) {
        next(new Error("Invalid Token"));
      } else {
        const data = {
          user: {
            id: user?._id,
            dbref: `#${user.dbref}`,
            username: user?.name,
            flags: user?.flags,
            isAdmin: flags.check(user?.flags || "", "builder+"),
          },
        };
        return res.status(200).json(data);
      }

      next(new Error("Invalid user"));
    } catch (error) {
      next(error);
    }
  }

  next(new Error("Invalid Token"));
});

router.post("/register", async (req, res) => {
  const user = await player(req.body.username);
  if (user) return res.status(401).json({ error: "Username already exists" });

  const obj = await dbObj(req.body.username, "player", {
    password: sha512(req.body.password),
  });

  const token = await signToken(obj?._id || "");
  res.status(200).json({
    token,
    user: {
      id: obj?._id,
      dbref: `#${obj.dbref}`,
      username: obj?.name,
      flags: obj?.flags,
      isAdmin: flags.check(obj?.flags || "", "builder+"),
    },
  });
});

export default router;
