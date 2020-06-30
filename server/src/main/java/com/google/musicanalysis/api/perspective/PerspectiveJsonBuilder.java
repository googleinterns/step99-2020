package com.google.musicanalysis.api.perspective;

import com.google.gson.JsonObject;
import java.util.ArrayList;

public class PerspectiveJsonBuilder {

  private String text;
  private ArrayList<String> attributes;

  public PerspectiveJsonBuilder(String text, ArrayList<String> attributes) {
    this.text = text;
    this.attributes = attributes;
  }

  /**
   * Builds the JSON object
   *
   * @return JSON object as string
   */
  public String buildJson() {
    JsonObject innerTextObject = new JsonObject();
    innerTextObject.addProperty("text", this.text);

    JsonObject innerAttributeObject = new JsonObject();
    for (String el : this.attributes) {
      innerAttributeObject.add(el, new JsonObject());
    }

    JsonObject jsonObject = new JsonObject();
    jsonObject.add("comment", innerTextObject);
    jsonObject.add("requestedAttributes", innerAttributeObject);

    return jsonObject.toString();
  }
}
