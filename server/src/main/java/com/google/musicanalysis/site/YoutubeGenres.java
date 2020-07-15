package com.google.musicanalysis.site;
import java.util.ArrayList;
import java.util.List;

/** contains final object that YoutubeServlet.java sends to frontend */
public class YoutubeGenres {
  private final List<VideoGenreCount> data;
  private final int totalLiked;

  public YoutubeGenres(List<VideoGenreCount> genreCountList, int totalLiked) {
    this.data = genreCountList;
    this.totalLiked = totalLiked;
  }
}
