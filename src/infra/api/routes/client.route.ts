import { Router } from "express";

export const clientRoute = Router();

clientRoute.post("/", async () => {
  console.log(">>> POST Client");
});
