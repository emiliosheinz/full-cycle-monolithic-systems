import AggregateRoot from "../../@shared/domain/entity/aggregate-root.interface";
import BaseEntity from "../../@shared/domain/entity/base.entity";
import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import InvoiceItem from "./invoice-item";

type InvoiceProps = {
  id?: Id
  name: string
  document: string,
  address: Address,
  items: InvoiceItem[],
};

export default class Invoice extends BaseEntity implements AggregateRoot {
  public readonly name: string;
  public readonly document: string;
  public readonly address: Address;
  public readonly items: InvoiceItem[];

  constructor(props: InvoiceProps) {
    super(props.id);
    this.name = props.name
    this.document = props.document
    this.address = props.address
    this.items = props.items
  }

  getTotal(): number {
    return this.items.reduce((acc, item) => acc + item.price, 0)
  }
}
