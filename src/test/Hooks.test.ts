import { Model } from "../Model";
import { Field } from "../decorators/FIeld";
import { should } from "fuse-test-runner"
import { Stub } from './Stub';

const stub = new Stub();






export class HooksTest {
    after() {
        //  stub.clear();
    }

    async "Should trigger onBeforeSave and set value"() {
        class FooBarTest extends Model<FooBarTest> {
            @Field()
            public name: string;
            onBeforeSave() {
                this.name = "foobar";
            }
        }
        const record = new FooBarTest({});
        await record.save();
        should(record.name).equal('foobar');
    }

    async "Should not save becaose onBeforeSave throws an error"() {
        class FooBarTest extends Model<FooBarTest> {
            @Field()
            public name: string;
            onBeforeSave() {
                throw new Error("Can't save");
            }
        }
        const record = new FooBarTest({});
        try {
            await record.save()
        } catch (e) {
            should(e.message).equal("Can't save");
        }
    }

    async "Should trigger onAfterSave"() {
        class FooBarTest extends Model<FooBarTest> {
            @Field()
            public name: string;
            onBeforeSave() {
                this.name = "stored"
            }

            onAfterSave() {
                this.name = "aa"
            }
        }
        FooBarTest.drop();
        const record = new FooBarTest({});

        await record.save();
        should(record.name).equal('aa');

        const results = await FooBarTest.find<FooBarTest>().all()
        should(results[0].name).equal('stored');
    }
}