package com.google.musicanalysis.site;

/** contains number of youtube videos under a music genre */
public class VideoGenreCount {
  public final String genre;
  public int count;

  public VideoGenreCount(String genre, int count) {
    this.genre = genre;
    this.count = count;
  }

  public void incCount() {
    this.count++;
  }
}
