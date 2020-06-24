#!/bin/bash
mvn clean package
cd ../jetty
mvn install
mvn exec:java -Dexec.args="../server/target/site.war"
