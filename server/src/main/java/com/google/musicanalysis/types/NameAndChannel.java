package com.google.musicanalysis.types;
import java.io.Serializable;

// Groups together video data for ease of use in videocards
public class NameAndChannel implements Serializable {
  String name;
  String channel;

  public NameAndChannel(String name, String channel) {
    this.name = name;
    this.channel = channel;
  }
}
