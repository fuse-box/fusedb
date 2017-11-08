# FuseDB


FuseDB is an ORM with traditional ActiveRecord approach, that provides a simple yet powerful API. FuseDB stores data in the filesystem ([nedb](https://github.com/louischatriot/nedb)) or MongoDB. You write your own [adapter](https://github.com/fuse-box/fusedb/blob/master/src/adapters/Adapter.ts) and implement a different database suppport.

It's perfectly suitable for medium scale databases or Electron apps and takes 5 minutes to dive in.

## Setting up a connection

Everything is working by default, and the files will be stored in your home folder e.g `/home/user/.fusedb` on linux or `/Users/user/.fusedb` on mac. In order to customise it, do the following

```js
import { FuseDB, FileAdapter } from "fusedb"

FuseDB.setup({
    adapter : FileAdapter({
        path: path.join(os.homedir(), ".fusedb"),
        database: path.dirname(process.cwd())
    })
});
```

## Create a model

```js
import { Field, Model } from "fusedb";

class Author extends Model<Author> {
    @Field()
    public name: string;

    @Field()
    public books: Book[];
}


class Book extends Model<Book> {
    @Field()
    public name: string;

    @Field()
    public author: Author;
}
```

`Field` decorator tells fusedb to serialize the field. There are a few reserved methods:

### Creating records

```js
const john = new Author({ name: "John" });
await john.save();

const book1 = new Book({ name: "book1", author: john });
const book2 = new Book({ name: "book2", author: john });

await book1.save();
await book2.save();


john.books = [book1, book2];
await john.save();
```

FuseDB will save references as `ids` and it won't store the entire model

### Finding

First record:

```js
const author = await Author.find<Author>({ name: "john" }).first();
```

All records:

```js
const authors = await Author.find<Author>({
        name : {$in : ["a", "b"]}
        }).all();
```

Count:

```js
const num = await Author.find<Author>().count();
```

### Chaining query

```js
const authors 
    = await Author.find<Author>({active : true})
            .sort("name", "desc")
            .limit(4)
            .skip(2)
            .all()
```

### Joining references

FuseDB can automatically join referenced fields by making optimised requests (collecting all ids and making additional queries to the database)
e.g

```js
const books = await Book.find<Book>().with("author", Author).all();
```

## Saving

```js
const author = new Author();
author.name = "john"
await autor.save() 
```


## Removing
```js
const author = await Author.find({name : "john"});
await author.remove(;)
```

## Validators

Validators in FuseDb are quite easy to use and implement. The framework offers a few default validators, 
in order to enable them call a function in your entry point (before you start importing your models)

```js
import { enableDefaultDecorators } from "fusedb"
enableDefaultDecorators();
```

Now you can start using them in your models, like that:

```js
class FooBarMax extends Model<FooBarMin> {
    @Field() @Validate({max : 3})
    public name: string;
}
```

Default validators can assert a custom message

```js
@Validate({nameOftheValidator : { message :"Failed", value : 3}})
```

### Min Symbols Validator

```js
class FooBarMin extends Model<FooBarMin> {
    @Field() @Validate({min : 3})
    public name: string;
}
```

### Max Symbols Validator

```js
class FooBarMax extends Model<FooBarMax> {
    @Field() @Validate({max : 3})
    public name: string;
}
```

### Email Validator

```js
class FooBarEmail extends Model<FooBarEmail> {
    @Field() @Validate({email : true})
    public name: string;
}
```

### RegExp Validator

```js
class FooBarRegExp extends Model<FooBarRegExp> {
    @Field() @Validate({regExp : /\d{2}/})
    public name: string;
}
```

### Function validator

```js
class FooBarCustom extends Model<FooBarCustom> {
    @Field() 
    @Validate({fn : value => {
        if( value !== "foo") throw new Error("Value should be foo only")
    }})
    public name: string;
}
```

## Your own validators

Define a class with `Validator`
```js
import { Validator, FieldValidator } from "fusedb";

@Validator()
export class OopsValidator implements FieldValidator {
    validate(field: string, props: any, value: any) {
        throw "Somethign wentWrong"
    }
}
```

A validator with name `oops` has be registered, how you can use it in your models

```js
class Hello extends Model<Hello> {
    @Field() @Validate({oops : true})
    public name: string;
}
```