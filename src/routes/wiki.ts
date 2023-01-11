import { Router } from "express";
import { db, WikiDB } from "../database";
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
    landing: req.body.landing || false,
    createdAt: Date.now(),
    category: req.body.category,
    updatedAt: Date.now(),
    createdBy: req.body.user._id,
    updatedBy: req.body.user._id,
  };

  if (!article.title || !article.slug || !article.body || !article.category)
    return next(new Error("Missing required fields"));
  try {
    if (article.default) {
      const articles = await WikiDB.find({
        default: true,
      });
      for (const article of articles) {
        await WikiDB.update(
          { _id: article._id },
          { ...article, default: false }
        );
      }
    }

    if (article.landing) {
      const articles = await WikiDB.find({
        landing: true,
      });
      for (const article of articles) {
        await WikiDB.update(
          { _id: article._id },
          { ...article, landing: false }
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
  let wiki = await WikiDB.find({ default: true });
  wiki = await Promise.all(
    wiki.map(async (article) => {
      article.updatedBy = (await db.findOne({ _id: article.updatedBy })).name;
      return article;
    })
  );
  res.status(200).json(wiki);
});

router.get("/featured", async (req, res) => {
  const wiki = await WikiDB.find({ featured: true });

  res.status(200).json(wiki);
});

router.get("/landing", async (req, res) => {
  let wiki = await WikiDB.find({ landing: true });
  wiki = await Promise.all(
    wiki.map(async (article) => {
      article.updatedBy = (await db.findOne({ _id: article.updatedBy })).name;
      return article;
    })
  );
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

  wiki.updatedBy = (await db.findOne({ _id: wiki.updatedBy })).name;

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
    if (req.body.default) {
      const articles = await WikiDB.find({
        default: true,
      });
      for (const article of articles) {
        await WikiDB.update(
          { _id: article._id },
          { ...article, default: false }
        );
      }
    }

    if (req.body.landing) {
      const articles = await WikiDB.find({
        landing: true,
      });
      for (const article of articles) {
        await WikiDB.update(
          { _id: article._id },
          { ...article, landing: false }
        );
      }
    }

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
