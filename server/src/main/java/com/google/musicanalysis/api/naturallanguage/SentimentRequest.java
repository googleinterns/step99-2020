package com.google.musicanalysis.api.naturallanguage;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

public class SentimentRequest {

  private String text;

  public SentimentRequest(String text) {
    this.text = text;
  }

  /**
   * Sends out request JSON Object and returns the JSON response from Perspective API.
   *
   * @return the JSON response as string
   */
  public String getResponse() throws MalformedURLException, IOException {
    URL url = new URL("https://language.googleapis.com/v1/documents:analyzeSentiment?key=");

    // Open up the connection
    HttpURLConnection con = (HttpURLConnection) url.openConnection();
    con.setRequestMethod("POST");
    con.setRequestProperty("Content-Type", "application/json; utf-8");
    con.setRequestProperty("Accept", "application/json");
    con.setDoOutput(true);

    String jsonString = new SentimentJsonBuilder(this.text).buildJson();

    // Send out the json string
    try (OutputStream out = con.getOutputStream()) {
      byte[] input = jsonString.getBytes("utf-8");
      out.write(input, 0, input.length);
    }

    BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream(), "utf-8"));

    StringBuffer response = new StringBuffer();

    String chunk;
    while ((chunk = in.readLine()) != null) {
      response.append(chunk.trim());
    }

    in.close();

    return response.toString();
  }
}
