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


    async onBeforeSave() {
        console.log("here");
    }

    serialize(props) {
        console.log("assign", props);
    }
}