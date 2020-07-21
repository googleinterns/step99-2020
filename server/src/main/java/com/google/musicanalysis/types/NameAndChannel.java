package com.google.musicanalysis.types;
import java.io.Serializable;

public class NameAndChannel implements Serializable {
  String name;
  String channel;

  public NameAndChannel(String name, String channel) {
    this.name = name;
    this.channel = channel;
  }
}
