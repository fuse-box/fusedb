import { Foo } from "./models/Foo";

async function test() {
    await Foo.drop()
    const foo = new Foo({ name: "hello" });



}

test();
