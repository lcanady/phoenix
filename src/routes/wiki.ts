import { Router } from "express";
import { WikiDB } from "../database";
import { Wiki } from "../definitions";
import flags from "../flags";
import auth from "../middleware/auth";

const router = Router();

router.post("/", auth, async (req, res, next) => {
  const exits = await WikiDB.findOne({
    $or: [
      { slug: new RegExp(req.body.slug, "i") },
      { title: new RegExp(req.body.title, "i") },
    ],
  });

  if (!flags.check(req.body.user.flags || "", "admin+"))
    return next(new Error("You do not have permission to do this"));

  console.log(exits);
  if (exits) return next(new Error("Article already exists"));

  const article: Wiki = {
    title: req.body.title,
    slug: req.body.slug,
    body: req.body.body,
    tags: req.body.tags || [],
    lock: req.body.lock || "",
    shortImg: req.body.shortImg || "",
    longImg: req.body.longImg || "",
    default: req.body.default || false,
    featured: req.body.featured || false,
    createdAt: Date.now(),
    category: req.body.category,
    updatedAt: Date.now(),
    CreatedBy: req.body.user._id,
    UpdatedBy: req.body.user._id,
  };

  if (!article.title || !article.slug || !article.body || !article.category)
    return next(new Error("Missing required fields"));
  try {
    if (article.default) {
      const articles = await WikiDB.find({ default: true });
      for (const article of articles) {
        await WikiDB.update(
          { _id: article._id },
          { ...article, default: false }
        );
      }
    }

    const wiki = await WikiDB.insert(article);
    res.status(200).json(wiki);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res) => {
  const wiki = await WikiDB.find({ default: true });
  res.status(200).json(wiki);
});

router.get("/featured", async (req, res) => {
  const wiki = await WikiDB.find({ featured: true });
  res.status(200).json(wiki);
});

router.get("/:slug", async (req, res) => {
  const wiki = await WikiDB.findOne({
    $or: [
      { _id: req.params.slug },
      { slug: new RegExp(req.params.slug, "i") },
      { title: new RegExp(req.params.slug, "i") },
    ],
  });
  res.status(200).json(wiki);
});

router.post("/:slug", auth, async (req, res, next) => {
  const exits = await WikiDB.findOne({
    $or: [
      { slug: new RegExp(req.params.slug, "i") },
      { title: new RegExp(req.params.slug, "i") },
    ],
  });

  if (!exits) return next(new Error("Article does not exist"));
  if (!flags.check(req.body.user.flags || "", "admin+"))
    return next(new Error("You do not have permission to do this"));

  try {
    const wiki = await WikiDB.update(
      { _id: exits._id },
      { ...exits, ...req.body }
    );
    res.status(200).json(wiki);
  } catch (error) {
    next(error);
  }
});

export default router;
