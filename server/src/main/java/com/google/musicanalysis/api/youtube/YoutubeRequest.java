package com.google.musicanalysis.api.youtube;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;

public class YoutubeRequest {
  private static final String BASE_URL = "https://www.googleapis.com/youtube/v3/";
  private static final String apiKey = "&key=";

  private String operation;
  private ArrayList<String> parameters = new ArrayList<String>();

  public YoutubeRequest(String operation, String... parameters) {
    this.operation = operation;
    for (String parameter : parameters) {
      this.parameters.add(parameter);
    }
  }

  public String getResult() throws MalformedURLException, IOException {

    StringBuffer buffer = new StringBuffer();

    URL url = buildUrl();
    System.out.println(url);
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
    ArrayList<String> searchOps = new ArrayList<String>(Arrays.asList("?q=", "&videoCaption="));
    ArrayList<String> commentOps = new ArrayList<String>(Arrays.asList("?part=", "&videoId="));
    String parameterString;

    if (this.operation == "search") {
      parameterString = buildParams(searchOps);
    } else {
      parameterString = buildParams(commentOps);
    }

    String urlString = BASE_URL + this.operation + parameterString + apiKey;
    URL url = new URL(urlString);
    return url;
  }

  private String buildParams(ArrayList<String> ops) {
    // More cases can be added in the future to this
    switch (this.parameters.size()) {
      case 1:
        return ops.get(0) + encode(this.parameters.get(0));
      case 2:
        return ops.get(0) + encode(this.parameters.get(0)) + ops.get(1) + encode(parameters.get(1));
      default:
        return null;
    }
  }

  private String encode(String param) {
    return URLEncoder.encode(param, StandardCharsets.UTF_8);
  }
}
