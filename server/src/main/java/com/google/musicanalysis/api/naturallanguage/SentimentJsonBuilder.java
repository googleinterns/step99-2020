package com.google.musicanalysis.api.naturallanguage;

import com.google.gson.JsonObject;

public class SentimentJsonBuilder {

  private String text;

  public SentimentJsonBuilder(String text) {
    this.text = text;
  }

  /**
   * Builds the JSON object
   *
   * @return JSON object as string
   */
  public String buildJson() {
    JsonObject innerObject = new JsonObject();
    innerObject.addProperty("type", "PLAIN_TEXT");
    innerObject.addProperty("content", this.text);

    JsonObject jsonObject = new JsonObject();
    jsonObject.add("document", innerObject);
    jsonObject.addProperty("encodingType", "UTF8");

    return jsonObject.toString();
  }
}
