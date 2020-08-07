package com.google.musicanalysis.types;
import java.time.temporal.TemporalAccessor;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.io.Serializable;

/**
 * Groups together video information for easy sending/reading from the 
 * backend to the front end
 */
public class VideoInfo implements Serializable {
  String name;
  String channel;
  public Instant publishedDate;

  public VideoInfo(String name, String channel, String timeString) {
    this.name = name;
    this.channel = channel;
    // Necessary steps to get time in workable format
    TemporalAccessor accessor = DateTimeFormatter.ISO_INSTANT.parse(timeString);
    this.publishedDate = Instant.from(accessor);
  }
}
