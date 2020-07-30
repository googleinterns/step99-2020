package com.google.musicanalysis.api.naturallanguage;

import com.google.gson.JsonObject;
import com.google.musicanalysis.util.Secrets;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

/** Handles all NLP API requests. Takes text string and returns a JSON response as string. */
public class SentimentRequest {

  private String text;

  public SentimentRequest(String text) {
    this.text = text;
  }

  /**
   * Sends out request JSON Object and returns the JSON response from Natural Language API.
   *
   * @return the JSON response as string
   */
  public String getResponse() throws MalformedURLException, IOException {
    String urlString =
        String.format(
            "https://language.googleapis.com/v1/documents:analyzeSentiment?key=%s",
            Secrets.getSecretString("NL_PERSP_KEY"));
    URL url = new URL(urlString);

    // Open up the connection
    HttpURLConnection con = (HttpURLConnection) url.openConnection();
    con.setRequestMethod("POST");
    con.setRequestProperty("Content-Type", "application/json; utf-8");
    con.setRequestProperty("Accept", "application/json");
    con.setDoOutput(true);

    String jsonString = buildJson();

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

  private String buildJson() {
    JsonObject innerObject = new JsonObject();
    innerObject.addProperty("type", "PLAIN_TEXT");
    innerObject.addProperty("content", this.text);

    JsonObject jsonObject = new JsonObject();
    jsonObject.add("document", innerObject);
    jsonObject.addProperty("encodingType", "UTF8");

    return jsonObject.toString();
  }
}
