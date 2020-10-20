import * as path from "path";
import { ActiveQuery } from "../ActiveQuery";
import { FuseDB } from "../FuseDB";
import { FileAdapter } from "../adapters/FileAdapter";
import { MongoAdapter } from "../adapters/MongoAdapter";
import { Bar, Foo, SubBar } from "./models/Foo";

FuseDB.setup({
  adapter: MongoAdapter({}),
});

// FuseDB.setup({
//     adapter: FileAdapter({
//         path: path.resolve("./.db"),
//         database: "test"
//     })
// });

async function test() {
  //   await Foo.drop();
  //   await Bar.drop();
  //   await SubBar.drop();
  //   const subBarData = [{ name: "sub1" }, { name: "sub2" }];
  //   const subBars = [];
  //   for (const item of subBarData) {
  //     const r = new SubBar(item);
  //     subBars.push(r);
  //     await r.save();
  //   }

  //   const barData = [{ name: "oi" }, { name: "woi" }];
  //   const bars = [];
  //   for (const item of barData) {
  //     const r = new Bar(item);
  //     r.subBars = subBars;
  //     bars.push(r);
  //     await r.save();
  //   }

  //   const firstFoo = new Foo({ bars: [], name: "foo" });
  //   firstFoo.bars = bars;
  //   await firstFoo.save();

  //   const data = await Foo.find<Foo>()
  //     .with("bars", Bar.find().with("subBars", SubBar))
  //     .all();

  //   data.map((item) => {
  //     item.bars.map((item) => {
  //       //console.log(item);
  //     });
  //   });
  // await Bar.drop()

  // const foo = new Foo({
  //     name: "hello201",
  //     date: new Date(),
  //     json: { foo: { bar: 1 } },
  //     json2: ["123", { foo: "123" }]
  // });
  // await foo.save();
  // //console.log("foo", foo);
  // const bar = new Bar({ name: "oo", foo: foo })
  // await bar.save();
  // // const newRecord = await foo.save();

  // foo.name = "bar";
  // await foo.save();
  // const data = await Foo.find<Foo>({ _id: "5b290c1c0e173fab5a471baf" }).sort("date", "desc").first();
  // console.log(data);

  setInterval(async () => {
    const result = await FuseDB.checkConnection();
    console.log(result);
  }, 1000);

  //  console.log(record);

  //console.log(data[0].json);
}

test();
