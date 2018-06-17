import { Model, Field } from '../../index';



export class Foo extends Model<Foo> {
    @Field()
    public name: string;


    async onBeforeSave() {
        console.log("here");
    }

    onAssignProperties(props) {
        console.log("assign", props);
    }
}