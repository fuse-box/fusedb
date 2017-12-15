import { Model, Field } from '../../index';



export class Foo extends Model<Foo> {
    @Field()
    public name: string;
}