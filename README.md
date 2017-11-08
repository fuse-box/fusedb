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