# server

This is where all of the server-side code for this project will live.

## how to run

1. If you are on Cloud Shell, skip to step 3
2. Install Cloud SDK
   1. Download it: `wget -O gcloud.tar.gz
      https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-298.0.0-linux-x86_64.tar.gz`
   2. Unzip it: `tar -xzvf gcloud.tar.gz`
   3. Install it: `./google-cloud-sdk/install.sh`
   4. Close your terminal and open a new one.
   5. Initialize it: `gcloud init`
   6. Install the App Engine component: `gcloud components install app-engine-java`
   7. Install the Cloud Firestore emulator: `gcloud components install cloud-firestore-emulator`
   8. Log in to create application default credentials: `gcloud auth application-default login`
3. (First time only) run `install.sh`
4. Run `run.sh`

## pitfalls

- `run.sh` will assume that your server is running at `localhost:8080`. if you are running on Cloud
  Shell, then you cannot access the website at `localhost:8080`. you can get around this by setting
  the `DOMAIN` environment variable to the address of your Cloud Shell web preview instance, but
  keep in mind that this address will change frequently.

## faq

- **Q: Why do I have to log in using `gcloud`?**
- A: The server retrieves secrets, such as the Spotify API client secret, using the [Secrets Manager](https://cloud.google.com/secret-manager). You need to either be running on Google Cloud,
  or be authenticated, in order to access the secrets.
- **Q: How do I change the port where the server runs?**
- A: Set the `PORT` environment variable. Keep in mind that you will need to change the `DOMAIN`
  environment variable too, if you do this. And if you don't run the server on port 8080, then you
  will also have to reconfigure the client dev server if you are interested in using it.
