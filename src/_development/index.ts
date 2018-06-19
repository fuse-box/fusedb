import { Foo, Bar } from "./models/Foo";
import { FuseDB } from '../FuseDB';
import { MongoAdapter } from '../adapters/MongoAdapter';
import { FileAdapter } from '../adapters/FileAdapter';
import * as path from "path";

// FuseDB.setup({
//     adapter: MongoAdapter({})
// });

FuseDB.setup({
    adapter: FileAdapter({
        path: path.resolve("./.db"),
        database: "test"
    })
});

async function test() {
    await Foo.drop()
    await Bar.drop()

    const foo = new Foo({
        name: "hello201",
        date: new Date(),
        json: { foo: { bar: 1 } },
        json2: ["123", { foo: "123" }]
    });
    await foo.save();
    //console.log("foo", foo);
    const bar = new Bar({ name: "oo", foo: foo })
    await bar.save();
    // const newRecord = await foo.save();


    // foo.name = "bar";
    // await foo.save();
    // const data = await Foo.find<Foo>({ _id: "5b290c1c0e173fab5a471baf" }).sort("date", "desc").first();
    // console.log(data);

    const record = await Foo.findById<Foo>("5b290c188e9f69ab51c3bd41");
    //  console.log(record);




    //console.log(data[0].json);


}

test();
