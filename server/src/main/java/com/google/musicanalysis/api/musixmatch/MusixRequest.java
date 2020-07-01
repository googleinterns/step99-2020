package com.google.musicanalysis.api.musixmatch;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;

/*
    Handles gathering data from the Musixmatch API.
    This is structured the way it is becuase I will be adding more
    to each function.
*/
public class MusixRequest {

  // Url building
  private static final String BASE_URL = "https://api.musixmatch.com/ws/1.1/";
  private String operation;
  private static final String OUTPUT_REQS = "?format=json&";
  private String parameters;
  private static final String apiKey = "&apikey=76aaf72ec2a763b4c7aaa7ea135f5ff0";

  /**
   * Constructor.
   *
   * @param operation the API method to send to Musixmatch
   * @param parameters the parameter string to be sent to Musixmatch
   */
  public MusixRequest(String operation, String parameters) {
    this.operation = operation;
    this.parameters = parameters;
  }

  /** @return the result from Musixmatch API as string */
  public String grabResponse() throws MalformedURLException, IOException {
    return getResult();
  }

  /**
   * Builds an appropriate URL with the information given.
   *
   * @param operation Musixmatch API method. See above.
   * @param parameters The parameter string. See above.
   */
  private URL buildUrl(String operation, String parameters) throws MalformedURLException {
    String urlString = BASE_URL + operation + OUTPUT_REQS + parameters + apiKey;
    URL url = new URL(urlString);
    return url;
  }

  /**
   * Calls the method and gets the result from Musixmatch. Reads data into an input buffer and
   * returns as string.
   *
   * @return string response.
   */
  private String getResult() throws MalformedURLException, IOException {

    StringBuffer buffer = new StringBuffer();

    URL url = buildUrl(this.operation, this.parameters);

    BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream(), "UTF-8"));

    // reading chunks of response into the buffer
    String chunk;
    while ((chunk = in.readLine()) != null) {
      buffer.append(chunk);
    }

    in.close();

    return buffer.toString();
  }
}
