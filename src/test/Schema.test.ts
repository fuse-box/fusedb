import { Model } from "../Model";
import { Field } from "../decorators/FIeld";
import { should } from "fuse-test-runner"

class FooBar extends Model<FooBar> {
    @Field()
    public name : string;

    
}

export class SchemaTest {
    "Should set only id by field"() {
        const foobar = new FooBar();
        
        const collection = foobar.$schema.getCollection();
        

        should(collection.name).beOkay();
    }
}