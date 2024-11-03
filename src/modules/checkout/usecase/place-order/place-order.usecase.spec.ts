import PlaceOrderUserCase from "./palce-order.usecase";
import { PlaceOrderUseCaseInputDTO } from "./place-order.dto";

const mockDate = new Date(2000, 1, 1);

describe("Place Order use case", () => {
  describe("Execute method", () => {
    it("should throw an error when client is not found", async () => {
      const mockClientFacade = {
        find: jest.fn().mockResolvedValue(null),
      };

      // @ts-expect-error - no params in constructor
      const placeOrderUseCase = new PlaceOrderUserCase();
      // @ts-expect-error - foce set clientFacade
      placeOrderUseCase["_clientFacade"] = mockClientFacade;

      const input: PlaceOrderUseCaseInputDTO = { clientId: "0", products: [] };

      await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
        new Error("Client not found"),
      );
    });

    it("should throw an error when products are not valid", async () => {
      const mockClientFacade = {
        find: jest.fn().mockResolvedValue(true),
      };

      // @ts-expect-error - no params in constructor
      const placeOrderUseCase = new PlaceOrderUserCase();

      const mockValidateProducts = jest
        // @ts-expect-error - spy on private method
        .spyOn(placeOrderUseCase, "validateProducts")
        // @ts-expect-error - not return never
        .mockRejectedValue(new Error("No products selected"));

      // @ts-expect-error - foce set clientFacade
      placeOrderUseCase["_clientFacade"] = mockClientFacade;

      const input: PlaceOrderUseCaseInputDTO = { clientId: "1", products: [] };

      await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
        new Error("No products selected"),
      );
      expect(mockValidateProducts).toHaveBeenCalledTimes(1);
    });
  });

  describe("validateProducts method", () => {
    // @ts-expect-error - no params in constructor
    const placeOrderUsecase = new PlaceOrderUserCase();

    it("should throw an error when no products are selected", async () => {
      const input: PlaceOrderUseCaseInputDTO = { clientId: "1", products: [] };

      await expect(
        placeOrderUsecase["validateProducts"](input),
      ).rejects.toThrow(new Error("No products selected"));
    });

    it("should throw an error when product is out of stock", async () => {
      const mockProductFacade = {
        checkStock: jest.fn(({ productId }: { productId: string }) =>
          Promise.resolve({
            productId,
            stock: productId === "1" ? 0 : 1,
          }),
        ),
      };

      // @ts-expect-error - foce set productFacade
      placeOrderUsecase["_productFacade"] = mockProductFacade;

      let input: PlaceOrderUseCaseInputDTO = {
        clientId: "1",
        products: [{ productId: "1" }],
      };
      await expect(
        placeOrderUsecase["validateProducts"](input),
      ).rejects.toThrow(new Error("Product 1 is not available in stock"));

      input = {
        clientId: "1",
        products: [{ productId: "0" }, { productId: "1" }],
      };
      await expect(
        placeOrderUsecase["validateProducts"](input),
      ).rejects.toThrow(new Error("Product 1 is not available in stock"));
      expect(mockProductFacade.checkStock).toHaveBeenCalledTimes(3);

      input = {
        clientId: "1",
        products: [{ productId: "0" }, { productId: "1" }, { productId: "2" }],
      };
      expect(placeOrderUsecase["validateProducts"](input)).rejects.toThrow(
        new Error("Product 1 is not available in stock"),
      );
      expect(mockProductFacade.checkStock).toHaveBeenCalledTimes(5);
    });
  });

  describe("getProducts method", () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    // @ts-expect-error - no params in constructor
    const placeOrderUsecase = new PlaceOrderUserCase();

    it("should throw an error when product is not found", async () => {
      const mockCatalogFacade = {
        find: jest.fn().mockResolvedValue(null),
      };

      // @ts-expect-error - foce set catalogFacade
      placeOrderUsecase["_catalogFacade"] = mockCatalogFacade;

      await expect(placeOrderUsecase["getProduct"]("0")).rejects.toThrow(
        new Error("Product 1 not found"),
      );
    });
  });
});
