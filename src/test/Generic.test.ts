import { Model } from "../Model";
import { Field } from "../decorators/FIeld";
import { should } from "fuse-test-runner"
import { Stub } from "./Stub";
import { each } from 'realm-utils';

const stub = new Stub();
class FooBar extends Model<FooBar> {
    @Field()
    public name: string;
}

class Woo extends Model<Woo> {
    @Field()
    public name: string;

    @Field()
    public createdAt: Date;
}

export class SchemaTest {
    after() {
        //å    stub.clear();
    }
    async "Should save record"() {
        const foobar = new FooBar({ name: "b" });
        await foobar.save();
        should(foobar._id).beString();
        should(foobar.name).equal("b")
    }

    async "Should save another one"() {
        const foobar = new FooBar({ name: "a" });

        await foobar.save();
        should(foobar._id).beString();
        should(foobar.name).equal("a")
    }

    async "Should query for all records"() {
        const results = await FooBar.find().sort("name").all();
        should(results).beArray();
        should(results[0]).mutate(item => item.name).equal("a");
        should(results[1]).mutate(item => item.name).equal("b");
    }

    async "Should query for one record (name asc)"() {
        const result = await FooBar.find().sort("name").first();
        should(result).mutate(item => item.name).equal("a");
    }

    async "Should query for one record (name desc)"() {
        const result = await FooBar.find().sort("name", "desc").first();
        should(result).mutate(item => item.name).equal("b");
    }

    async "Should sort asc"() {
        const results = await FooBar.find().sort("name", "asc").all();
        should(results).beArray();
        should(results[0]).mutate(item => item.name).equal("a");
        should(results[1]).mutate(item => item.name).equal("b");
    }

    async "Should sort desc"() {
        const results = await FooBar.find().sort("name", "desc").all();
        should(results).beArray();
        should(results[0]).mutate(item => item.name).equal("b");
        should(results[1]).mutate(item => item.name).equal("a");
    }

    async "Should create more records"() {
        const data = ["c", "d", "e", "f", "g"]
        for (let letter of data) {
            let item = new FooBar({ name: letter })
            await item.save();
        }
    }

    async "should give correct count"() {
        const count = await FooBar.find().sort("name").count()
        should(count).equal(7);
    }

    async "should sort more records correctly"() {
        const results = await FooBar.find().sort("name", "desc").all();
        should(results[0]).mutate(item => item.name).equal("g")
    }


    async "should update record"() {
        const result = await FooBar.find<FooBar>({ name: "g" }).first();

        should(result.name).equal("g");
        result.name = "gg";
        await result.save();
    }

    async "should verify udpated record"() {
        const result = await FooBar.find<FooBar>({ name: "gg" }).first();
        should(result.name).equal("gg");
    }

    async "count should be still 7"() {
        const count = await FooBar.find().sort("name").count()
        should(count).equal(7);
    }

    async "should remove a record"() {
        const result = await FooBar.find<FooBar>({ name: "gg" }).first();
        await result.remove();
        const count = await FooBar.find().sort("name").count()
        should(count).equal(6);
    }
}