package com.google.musicanalysis.api.perspective;

import com.google.gson.JsonObject;
import com.google.musicanalysis.util.Secrets;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;

/**
 * Handles all Perspective API requests. Takes text string and list of attributes and returns a JSON
 * response as string.
 */
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
    String urlString =
        String.format(
            "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=%s",
            Secrets.getSecretString("NL_PERSP_KEY"));
    URL url = new URL(urlString);

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
   * @param wantedArgs the attributes requested.
   */
  private String buildJson(String textToAnalyze, ArrayList<String> wantedArgs) {
    JsonObject innerTextObject = new JsonObject();
    innerTextObject.addProperty("text", textToAnalyze);

    var innerAttributeObject = new JsonObject();
    for (String el : wantedArgs) {
      innerAttributeObject.add(el, new JsonObject());
    }

    var jsonObject = new JsonObject();
    jsonObject.add("comment", innerTextObject);
    jsonObject.add("requestedAttributes", innerAttributeObject);

    return jsonObject.toString();
  }
}
