package com.google.musicanalysis.api.perspective;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;

public class PerspectiveRequest {

  private String text;
  private ArrayList<String> attributes;

  public PerspectiveRequest(String text, ArrayList<String> attributes) {
    this.text = text;
    this.attributes = attributes;
  }

  /**
   * Sends out request JSON Object and returns the JSON response from Perspective API.
   *
   * @return the JSON response as string
   */
  public String getResponse() throws MalformedURLException, IOException {

    String jsonString = buildJson(this.text, this.attributes);
    URL url = new URL("https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=AIzaSyCeBpDzMi8CMOjosLq7gyf6WHFcGSPQRGI");

    // Open up the connection
    HttpURLConnection con = (HttpURLConnection) url.openConnection();
    con.setRequestMethod("POST");
    con.setRequestProperty("Content-Type", "application/json; utf-8");
    con.setRequestProperty("Accept", "application/json");
    con.setDoOutput(true);

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

  /**
   * Builds the JSON Object to be sent out.
   *
   * @param textToAnalyze The text that will be analyzed by the Perspective API.
   * @param requestedAttributes the attributes requested.
   */
  private String buildJson(String textToAnalyze, ArrayList<String> requestedAttributes) {

    ArrayList<String> wantedArgs = new ArrayList<String>();
    for (String el : requestedAttributes) {
      wantedArgs.add(el);
    }

    PerspectiveJsonBuilder json = new PerspectiveJsonBuilder(textToAnalyze, wantedArgs);
    String jsonString = json.buildJson();

    return jsonString;
  }
}
