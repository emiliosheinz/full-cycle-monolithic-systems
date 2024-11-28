import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { ClientModel } from "../../client-adm/repository/client.model";
import { CheckoutProductModel } from "./checkout-product.model";
import { NonAttribute } from "sequelize";

@Table({
  tableName: "checkout_order",
  timestamps: false,
})
export class CheckoutOrderModel extends Model {
  @PrimaryKey
  @Column({ allowNull: false })
  id: string;

  @Column({ allowNull: false })
  status: string;

  @ForeignKey(() => ClientModel)
  @Column({ allowNull: false })
  clientId: string;

  @BelongsTo(() => ClientModel)
  client: NonAttribute<ClientModel>;

  @HasMany(() => CheckoutProductModel, "orderId")
  products: NonAttribute<CheckoutProductModel[]>;
}
