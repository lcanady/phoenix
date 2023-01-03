"use strict";

import BrowserViewFactory from "express-svelte/lib/browser-view-factory.js";

export default await BrowserViewFactory.create("views/**/*.svelte", {
  relative: "views/",
  outputDir: "public/dist",
  // Only create legacy builds for production
  legacy: process.env.NODE_ENV !== "development",
});
