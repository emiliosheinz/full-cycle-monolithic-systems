import { Router } from "express";

export const invoiceRoute = Router();

invoiceRoute.get("/:id", async () => {
  console.log(">>> GET Invoice");
});
