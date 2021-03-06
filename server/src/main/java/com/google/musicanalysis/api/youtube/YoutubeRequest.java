package com.google.musicanalysis.api.youtube;

import com.google.musicanalysis.util.Secrets;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Handles all Youtube API requests. Takes operation string and map of parameters and returns a JSON
 * response as string.
 */
public class YoutubeRequest {
  private static final String BASE_URL = "https://www.googleapis.com/youtube/v3/";
  private static String API_KEY;

  private String operation;
  private HashMap<String, String> parameters;

  public YoutubeRequest(String operation, HashMap<String, String> parameters) throws IOException {
    this.operation = operation;
    this.parameters = parameters;
    this.API_KEY = String.format("&key=%s", Secrets.getSecretString("YOUTUBE_ANALYSIS_KEY"));
  }

  /**
   * Returns the result from the Youtube API call.
   *
   * @return JSON response string.
   */
  public String getResult() throws MalformedURLException, IOException {

    StringBuffer buffer = new StringBuffer();

    URL url = buildUrl();

    HttpURLConnection con = (HttpURLConnection) url.openConnection();
    int response = con.getResponseCode();
    if (response != 200) {
      throw new IOException("issue with getting video in Youtube Request");
    }

    BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream(), "UTF-8"));

    // reading chunks of response into the buffer
    String chunk;
    while ((chunk = in.readLine()) != null) {
      buffer.append(chunk);
    }

    in.close();

    return buffer.toString();
  }

  private URL buildUrl() throws MalformedURLException {
    ArrayList<String> ops = new ArrayList<>();

    for (Map.Entry<String, String> entry : this.parameters.entrySet()) {
      ops.add(String.format("%s=%s", entry.getKey(), encode(entry.getValue())));
    }

    String urlString = BASE_URL + this.operation + "?" + String.join("&", ops) + API_KEY;
    URL url = new URL(urlString);
    return url;
  }

  private String encode(String param) {
    return URLEncoder.encode(param, StandardCharsets.UTF_8);
  }
}
