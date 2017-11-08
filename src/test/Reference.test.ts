import { Model } from "../Model";
import { Field } from "../decorators/FIeld";
import { should } from "fuse-test-runner"
import { Stub } from './Stub';
const stub = new Stub();


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




export class ReferenceTEst {
    after() {
        //  stub.clear();
    }
    async "Should create records correctly (string because not mapped)"() {
        const john = new Author({ name: "John" });
        await john.save();

        const book1 = new Book({ name: "book1", author: john });
        const book2 = new Book({ name: "book2", author: john });

        await book1.save();
        await book2.save();


        john.books = [book1, book2];
        await john.save();

        // it's not mapped so it should be a string
        const foundBook1 = await Book.find<Book>().first();
        should(foundBook1.author).beString();
    }

    async "Should use with correctly on a single object"() {
        // it's not mapped so it should be a string
        const books =
            await Book.find<Book>()
                .with("author", Author)
                .all();

        should(books[0].author.name).equal("John")
        should(books[1].author.name).equal("John")
    }

    async "Should use with correctly on array"() {
        // it's not mapped so it should be a string
        const author = await Author.find<Author>()
            .with("books", Book)
            .first()
        should(author.books).beArray().haveLength(2)
        should(author.books[0].name).equal("book1");
        should(author.books[1].name).equal("book2");
    }
}