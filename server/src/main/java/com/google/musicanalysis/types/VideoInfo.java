package com.google.musicanalysis.types;
import java.io.Serializable;

/**
 * Groups together video information for easy sending/reading from the 
 * backend to the front end
 */
public class VideoInfo implements Serializable {
  String name;
  String channel;

  public VideoInfo(String name, String channel) {
    this.name = name;
    this.channel = channel;
  }
}
