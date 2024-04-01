# How to interpret these very vague examples

filename syntax

    [[Page imported]---pipeFunction]--->[Page exported]

In the file, both Page imported and exported are just CSS selectors mentioned in a comment

example:

```js
function example(param1) { // [tabindex="0"]   <--- Css selector used to extract info from Page imported
    return param1;
}

// [data-testid='send']   <--- Css selector used to paste info on Page exported
```