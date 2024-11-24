import Id from "../../../@shared/domain/value-object/id.value-object";
import Product from "../../domain/product.entity";
import PlaceOrderUseCase from "./place-order.usecase";
import { PlaceOrderUseCaseInputDTO } from "./place-order.dto";

const mockDate = new Date(2000, 1, 1);

describe("Place Order use case", () => {
  describe("Execute method", () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("should throw an error when client is not found", async () => {
      const mockClientFacade = {
        find: jest.fn().mockResolvedValue(null),
      };

      // @ts-expect-error - no params in constructor
      const placeOrderUseCase = new PlaceOrderUseCase();
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
      const placeOrderUseCase = new PlaceOrderUseCase();

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

    describe("place order", () => {
      const clientProps = {
        id: "1c",
        name: "Client 1",
        document: "123456789",
        email: "client@email.com",
        street: "Client street",
        number: "123",
        complement: "Client complement",
        city: "Client city",
        state: "Client state",
        zipCode: "12345678",
      };

      const mockClientFacade = {
        find: jest.fn().mockResolvedValue(clientProps),
      };

      const mockPaymentFacade = {
        process: jest.fn(),
      };

      const mockCheckoutRepository = {
        addOrder: jest.fn(),
      };

      const mockInvoiceFacade = {
        generate: jest.fn().mockResolvedValue({ id: "1i" }),
      };

      const placeOrderUsecase = new PlaceOrderUseCase(
        // @ts-expect-error - wrong parameter type
        mockClientFacade,
        null,
        null,
        mockCheckoutRepository,
        mockInvoiceFacade,
        mockPaymentFacade,
      );

      const products = [
        new Product({
          id: new Id("1p"),
          name: "Product 1",
          description: "Product 1 description",
          salesPrice: 10,
        }),
        new Product({
          id: new Id("2p"),
          name: "Product 2",
          description: "Product 2 description",
          salesPrice: 20,
        }),
      ];

      const mockValidateProducts = jest
        // @ts-expect-error - spy on private method
        .spyOn(placeOrderUsecase, "validateProducts")
        // @ts-expect-error - spy on private method
        .mockResolvedValue(null);

      const mockGetProduct = jest
        // @ts-expect-error - spy on private method
        .spyOn(placeOrderUsecase, "getProduct")
        // @ts-expect-error - spy on private method
        .mockImplementation((productId: string) => {
          return products.find((p) => p.id.id === productId);
        });

      it("should not be approved", async () => {
        mockPaymentFacade.process = mockPaymentFacade.process.mockReturnValue({
          transactionId: "1t",
          orderId: "1o",
          amount: 100,
          status: "error",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const input: PlaceOrderUseCaseInputDTO = {
          clientId: "1c",
          products: [{ productId: "1p" }, { productId: "2p" }],
        };

        const output = await placeOrderUsecase.execute(input);

        expect(output.invoiceId).toBeNull();
        expect(output.total).toBe(30);
        expect(output.products).toStrictEqual([
          { productId: "1p" },
          { productId: "2p" },
        ]);
        expect(mockClientFacade.find).toHaveBeenCalledTimes(1);
        expect(mockClientFacade.find).toHaveBeenCalledWith({ id: "1c" });
        expect(mockValidateProducts).toHaveBeenCalledTimes(1);
        expect(mockValidateProducts).toHaveBeenCalledWith(input);
        expect(mockGetProduct).toHaveBeenCalledTimes(2);
        expect(mockCheckoutRepository.addOrder).toHaveBeenCalledTimes(1);
        expect(mockPaymentFacade.process).toHaveBeenCalledTimes(1);
        expect(mockPaymentFacade.process).toHaveBeenCalledWith({
          orderId: output.id,
          amount: output.total,
        });
        expect(mockInvoiceFacade.generate).toHaveBeenCalledTimes(0);
      });

      it("should be approved", async () => {
        mockPaymentFacade.process = mockPaymentFacade.process.mockReturnValue({
          transactionId: "1t",
          orderId: "1o",
          amount: 100,
          status: "approved",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const input: PlaceOrderUseCaseInputDTO = {
          clientId: "1c",
          products: [{ productId: "1p" }, { productId: "2p" }],
        };

        const output = await placeOrderUsecase.execute(input);

        expect(output.invoiceId).toBe("1i");
        expect(output.total).toBe(30);
        expect(output.products).toStrictEqual([
          { productId: "1p" },
          { productId: "2p" },
        ]);
        expect(mockClientFacade.find).toHaveBeenCalledTimes(1);
        expect(mockClientFacade.find).toHaveBeenCalledWith({ id: "1c" });
        expect(mockValidateProducts).toHaveBeenCalledTimes(1);
        expect(mockGetProduct).toHaveBeenCalledTimes(2);
        expect(mockCheckoutRepository.addOrder).toHaveBeenCalledTimes(1);
        expect(mockPaymentFacade.process).toHaveBeenCalledTimes(1);
        expect(mockPaymentFacade.process).toHaveBeenCalledWith({
          orderId: output.id,
          amount: output.total,
        });
        expect(mockInvoiceFacade.generate).toHaveBeenCalledTimes(1);
        expect(mockInvoiceFacade.generate).toHaveBeenCalledWith({
          name: clientProps.name,
          document: clientProps.document,
          street: clientProps.street,
          number: clientProps.number,
          city: clientProps.city,
          complement: clientProps.complement,
          state: clientProps.state,
          zipCode: clientProps.zipCode,
          items: products.map((p) => ({
            id: p.id.id,
            name: p.name,
            price: p.salesPrice,
          })),
        });
      });
    });

    describe("validateProducts method", () => {
      // @ts-expect-error - no params in constructor
      const placeOrderUsecase = new PlaceOrderUseCase();

      it("should throw an error when no products are selected", async () => {
        const input: PlaceOrderUseCaseInputDTO = {
          clientId: "1",
          products: [],
        };

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
        expect(mockProductFacade.checkStock).toHaveBeenCalledTimes(1);

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
          products: [
            { productId: "0" },
            { productId: "1" },
            { productId: "2" },
          ],
        };
        await expect(
          placeOrderUsecase["validateProducts"](input),
        ).rejects.toThrow(new Error("Product 1 is not available in stock"));
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
      const placeOrderUsecase = new PlaceOrderUseCase();

      it("should throw an error when product is not found", async () => {
        const mockCatalogFacade = {
          find: jest.fn().mockResolvedValue(null),
        };

        // @ts-expect-error - foce set catalogFacade
        placeOrderUsecase["_catalogFacade"] = mockCatalogFacade;

        await expect(placeOrderUsecase["getProduct"]("0")).rejects.toThrow(
          new Error("Product 0 not found"),
        );
      });

      it("should return a product", async () => {
        const mockCatalogFacade = {
          find: jest.fn().mockResolvedValue({
            id: "1",
            name: "Product 1",
            description: "Product 1 description",
            salesPrice: 10,
          }),
        };

        // @ts-expect-error - foce set catalogFacade
        placeOrderUsecase["_catalogFacade"] = mockCatalogFacade;

        const product = await placeOrderUsecase["getProduct"]("1");

        expect(product).toEqual(
          new Product({
            id: new Id("1"),
            name: "Product 1",
            description: "Product 1 description",
            salesPrice: 10,
          }),
        );
        expect(mockCatalogFacade.find).toHaveBeenCalledTimes(1);
      });
    });
  });
});
