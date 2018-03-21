# ensure-named-export-rule

There is a rule to disallow default exports [`no-default-export`][1]
This rule makes it, so to say, one step further.
Using `ensure-named-export-rule` one can assert that a module has named export named over the file name.
 
# Example

A file, named `mySuperModule.js`, must a have an export, also named `mySuperModule`.

The rule supports an option to specify case conversion. Using which one can say:
A file, named `mySuperModule.js`, must a have an export, named `my_super_module` or `MySuperModule` etc.

[1]:https://palantir.github.io/tslint/rules/no-default-export/
