package com.google.musicanalysis.types;

import java.util.ArrayList;
import java.util.HashMap;

public class AnalysisGroup {
  public final HashMap<String, String> perspectiveMap;
  public final NLPResult magnitudeAndScore;
  public final ArrayList<String> commentArray;
  public final String videoId;
  public final NameAndChannel videoInfo;

  public AnalysisGroup(
      HashMap<String, String> perspectiveMap,
      NLPResult magnitudeAndScore,
      ArrayList<String> commentArray,
      String videoId,
      NameAndChannel videoInfo) {
    this.perspectiveMap = perspectiveMap;
    this.magnitudeAndScore = magnitudeAndScore;
    this.commentArray = commentArray;
    this.videoId = videoId;
    this.videoInfo = videoInfo;
  }
}
