import { Foo } from "./models/Foo";

async function test() {
    await Foo.drop()
    const foo = new Foo({ name: "hello" });
    await foo.save();

    const data = await Foo.find().all();
    console.log(data);


}

test();
