#!/bin/bash
mvn clean package || { echo "build failed"; exit 1; } 
cd ../jetty

export APP_ENV=development
export SPOTIFY_CALLBACK_URI=http://localhost:8080/api/oauth/callback/spotify

if [ "$DOMAIN" = "" ] 
then 
  export DOMAIN=http://localhost:8080
fi

mvn exec:java -Dexec.args="../server/target/site.war"
