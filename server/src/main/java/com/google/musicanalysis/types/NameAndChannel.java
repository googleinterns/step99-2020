package com.google.musicanalysis.types;

import java.io.Serializable;

/** Groups together video information for easy sending/reading from the backend to the front end */
public class NameAndChannel implements Serializable {
  String name;
  String channel;

  public NameAndChannel(String name, String channel) {
    this.name = name;
    this.channel = channel;
  }
}
