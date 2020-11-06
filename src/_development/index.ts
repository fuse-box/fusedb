import { FuseDB } from "../FuseDB";
import { MongoAdapter } from "../adapters/MongoAdapter";
import { Foo } from "./models/Foo";

const MONGO_URL = process.env.MONGO_URL || `mongodb://localhost:27017/test_db`;
FuseDB.setup({
  adapter: MongoAdapter({
    dbName: "test_db",
    options: {
      useUnifiedTopology: true,
    },
    url: MONGO_URL,
  }),
});

// FuseDB.setup({
//     adapter: FileAdapter({
//         path: path.resolve("./.db"),
//         database: "test"
//     })
// });

async function test() {
  await Foo.drop()
  const docs = [];
  for (let index = 0; index < 20; index++) {
    docs.push({num : index})
  }

  const a = await Foo.insertMany(docs)
  console.log(a);

//  await Foo.find({ num: { $gte: 10 } }).updateMany({ num: 2222 });

  // const deleteCount = await Foo.find({ num: { $gte: 10 } }).deleteMany();
  // console.log("Delte count", deleteCount);
}

test();
