import { Router } from "express";

export const checkoutRoute = Router();

checkoutRoute.post("/", async () => {
  console.log(">>> POST Checkout");
});
