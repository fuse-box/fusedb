import { Foo } from "./models/Foo";
import { FuseDB } from '../FuseDB';
import { MongoAdapter } from '../adapters/MongoAdapter';


FuseDB.setup({
    adapter: MongoAdapter({})
});

async function test() {
    //await Foo.drop()
    const foo = new Foo({
        name: "hello201",
        date: new Date(),
        json: { foo: { bar: 1 } },
        json2: ["123", { foo: "123" }]
    });
    // const newRecord = await foo.save();


    // foo.name = "bar";
    // await foo.save();
    // const data = await Foo.find<Foo>({ _id: "5b290c1c0e173fab5a471baf" }).sort("date", "desc").first();
    // console.log(data);

    const record = await Foo.findById<Foo>("5b290c188e9f69ab51c3bd41");
    console.log(record);




    //console.log(data[0].json);


}

test();
