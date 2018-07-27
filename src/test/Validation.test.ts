import { Model } from "../Model";
import { Field } from "../decorators/FIeld";
import { should } from "fuse-test-runner"
import { Stub } from "./Stub";
import { Validate } from "../decorators/Validate";
import { enableDefaultDecorators } from "../index";

const stub = new Stub();
enableDefaultDecorators();

class FooBarMin extends Model<FooBarMin> {
    @Field() @Validate({ min: 3 })
    public name: string;
}

class FooBarMax extends Model<FooBarMin> {
    @Field() @Validate({ max: 3 })
    public name: string;
}

class FooBarCustom extends Model<FooBarMin> {
    @Field()
    @Validate({
        fn: value => {
            if (value !== "foo") {
                throw new Error("Value should be foo only")
            }
        }
    })
    public name: string;
}

class FooBarRegExp extends Model<FooBarMin> {
    @Field() @Validate({ regExp: /\d{2}/ })
    public name: string;
}

class FooBarEmail extends Model<FooBarMin> {
    @Field() @Validate({ email: true })
    public name: string;
}

class RequiredModal extends Model<FooBarMin> {
    @Field() @Validate({ required: true })
    public a: string;

    @Field() @Validate({ required: true })
    public n: string;

    onBeforeSave() {
        if (this.n === "you-should-fail") {
            this.a = undefined;
        }
    }

}
export class ValidationTest {
    after() {
        stub.clear();
    }
    async "Should validate min 3 (error)"() {
        const record = new FooBarMin({ name: "a" })
        await should().throwException(() => record.save())
    }

    async "Should validate min 4 (ok)"() {
        const record = new FooBarMin({ name: "abc" })
        return record.save()
    }

    async "Should validate max 3 (error)"() {
        const record = new FooBarMax({ name: "1234" })
        await should().throwException(() => record.save())
    }

    async "Should validate max 4 (ok)"() {
        const record = new FooBarMax({ name: "123" })
        await record.save()
    }

    async "Should make custom validation"() {
        const record = new FooBarCustom({ name: "1" })
        await should().throwException(() => record.save())
    }

    async "Should pass custom validation"() {
        const record = new FooBarCustom({ name: "foo" })
        await record.save();
    }

    async "Should validate RegExp (error)"() {
        const record = new FooBarRegExp({ name: "ab" })
        await should().throwException(() => record.save())
    }

    async "Should validate RegExp (ok)"() {
        const record = new FooBarRegExp({ name: "12" })
        return record.save()
    }

    async "Should validate email (error)"() {
        const record = new FooBarEmail({ name: "123123@" })
        await should().throwException(() => record.save())
    }

    async "Should validate email (ok)"() {
        const record = new FooBarEmail({ name: "foobar@gmail.com" })
        return record.save()
    }

    async "Should validate using required"() {
        const record = new RequiredModal({})
        try {
            await record.save();
        } catch (e) {
            should(e.$fields).deepEqual({ a: 'This field required', n: 'This field required' });
        }
    }

    async "Should validate using required (failed because of onBeforeSave"() {
        const record = new RequiredModal({ a: "1", n: 'you-should-fail' })
        try {
            await record.save();
        } catch (e) {
            should(e.$fields).deepEqual({ a: 'This field required' });
        }
    }

    async "Should pass required validations"() {
        const record = new RequiredModal({ a: "1", n: '2' })
        try {
            const response = await record.save();

            should(record.a).equal("1")
            should(record.n).equal("2")
            should(record._id).beOkay();
        } catch (e) {
            throw "Shouldn't happen"
        }
    }
}