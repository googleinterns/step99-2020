package com.google.musicanalysis.site;
import java.util.ArrayList;
import java.util.List;

/** contains final object that YoutubeServlet.java sends to frontend */
public class YoutubeGenres {
  private final List<VideoGenreCount> data;
  private final int totalLiked;
  private final int totalMusic;

  public YoutubeGenres(List<VideoGenreCount> genreCountList, int totalLiked, int totalMusic) {
    this.data = genreCountList;
    this.totalLiked = totalLiked;
    this.totalMusic = totalMusic;
  }
}
