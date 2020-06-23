# jetty

When running under App Engine with Java 11, we are required to have a file with a `main()` method in
it for App Engine to call. In the Java 8 version, this was abstracted away because you could _only_
use servlets, but Java 11 allows people to use frameworks other than servlets, so it's a little more
complex.

All the code in this folder does is replicate the functionality that App Engine was doing for us: it
makes a dead-simple HTTP server that just hands off all of the work to our servlets. This means that
the code in this folder is not likely to change over the course of this project.
