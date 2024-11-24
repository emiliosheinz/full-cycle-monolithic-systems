import { Router } from "express";

export const productRoute = Router();

productRoute.post("/", async () => {
  console.log(">>> POST Product");
});
