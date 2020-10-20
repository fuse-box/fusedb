import { Model, Field } from '../../index';


export class Foo extends Model<Foo> {
    @Field()
    public name: string;

    @Field()
    public json: any;

    @Field()
    public json2: any;

    @Field()
    public date: Date;

    @Field()
    public bars: Array<Bar>;


    async onBeforeSave() {

    }

}

export class Bar extends Model<Bar>{
    @Field()
    public name: string;

    @Field()
    public foo: Foo;

    @Field()
    public subBars: Array<SubBar>;
}


export class SubBar extends Model<Bar>{
    @Field()
    public name: string;
   
}