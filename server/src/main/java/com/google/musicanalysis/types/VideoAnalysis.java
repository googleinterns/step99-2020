package com.google.musicanalysis.types;

import java.util.ArrayList;
import java.util.HashMap;

public class VideoAnalysis {
  public final HashMap<String, String> perspectiveMap;
  public final NLPResult magnitudeAndScore;
  public final ArrayList<String> commentArray;
  public final String videoId;
  public final VideoInfo videoInfo;

  public VideoAnalysis(
      HashMap<String, String> perspectiveMap,
      NLPResult magnitudeAndScore,
      ArrayList<String> commentArray,
      String videoId,
      VideoInfo videoInfo) {
    this.perspectiveMap = perspectiveMap;
    this.magnitudeAndScore = magnitudeAndScore;
    this.commentArray = commentArray;
    this.videoId = videoId;
    this.videoInfo = videoInfo;
  }
}
