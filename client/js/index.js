function BadFunction() 
{
    // This is just a test to make sure the linter is working correctly.
    // It should flag the fact that I put the braces in the wrong place,
    // I indented using four spaces, I capitalized this function name
    // for no reason, and I didn't include a JSDoc comment.

    const x = 3;
    console.log(x);
}

BadFunction();
