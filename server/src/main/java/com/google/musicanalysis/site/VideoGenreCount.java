package com.google.musicanalysis.site;

/** contains number of youtube videos under a music genre */
public class VideoGenreCount {
  private final String genre;
  private final int count;
  public VideoGenreCount(String genre, int count) {
    this.genre = genre;
    this.count = count;
  }
}
