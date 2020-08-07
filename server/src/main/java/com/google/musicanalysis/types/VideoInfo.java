package com.google.musicanalysis.types;
import java.time.Instant;
import java.time.OffsetDateTime;
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
    // timeString.substring() removes wrapped quotes.
    OffsetDateTime odt = OffsetDateTime.parse(timeString.substring(1, timeString.length()-1));
    this.publishedDate = odt.toInstant();
  }
}
