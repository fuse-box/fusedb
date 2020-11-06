import { Field, Model } from "../../index";

export class Foo extends Model<Foo> {
  @Field()
  public name: string;

  @Field()
  public json: any;

  @Field()
  public num: number;

  @Field()
  public json2: any;

  @Field()
  public date: Date;

  async onBeforeSave() {}
}
