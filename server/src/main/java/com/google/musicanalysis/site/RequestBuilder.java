package com.google.musicanalysis.site;

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
public class RequestBuilder {

  // Url building
  private String baseUrl = "https://api.musixmatch.com/ws/1.1/";
  private String operation;
  private String outputReqs = "?format=jsonp&callback=callback&";
  private String parameters;
  private final String apiKey = "&apikey=";

  private String response;

  /**
   * Constructor.
   *
   * @param operation the API method to send to Musixmatch
   * @param parameters the parameter string to be sent to Musixmatch
   */
  public RequestBuilder(String operation, String parameters) {
    this.operation = operation;
    this.parameters = parameters;
  }

  /** @return the result from Musixmatch API */
  public String grabResponse() throws MalformedURLException, IOException {
    getResult();
    return this.response;
  }

  /**
   * Builds an appropriate URL with the information given.
   *
   * @param operation Musixmatch API method. See above.
   * @param parameters The parameter string. See above.
   */
  private URL buildUrl(String operation, String parameters) throws MalformedURLException {
    String urlString = baseUrl + operation + outputReqs + parameters + apiKey;
    URL url = new URL(urlString);
    return url;
  }

  /**
   * Calls the method and gets the result from Musixmatch. Reads data into an input buffer and
   * returns as string.
   *
   * @return string response.
   */
  private void getResult() throws MalformedURLException, IOException {

    StringBuffer buffer = new StringBuffer();

    URL url = buildUrl(this.operation, this.parameters);

    BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream(), "UTF-8"));

    // reading chunks of response into the buffer
    String chunk;
    while ((chunk = in.readLine()) != null) {
      buffer.append(chunk);
    }

    in.close();

    this.response = buffer.toString();
  }
}
