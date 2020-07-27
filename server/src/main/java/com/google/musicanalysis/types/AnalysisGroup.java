package com.google.musicanalysis.types;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;

/** Groups together analysis data for easy sending/reading from the backend to the front end */
public class AnalysisGroup implements Serializable {
  public final HashMap<String, String> perspectiveMap;
  public final NLPResult magnitudeAndScore;
  public final ArrayList<CommentLikes> commentArray;
  public final String videoId;
  public final NameAndChannel videoInfo;

  public AnalysisGroup(
      HashMap<String, String> perspectiveMap,
      NLPResult magnitudeAndScore,
      ArrayList<CommentLikes> commentArray,
      String videoId,
      NameAndChannel videoInfo) {
    this.perspectiveMap = perspectiveMap;
    this.magnitudeAndScore = magnitudeAndScore;
    this.commentArray = commentArray;
    this.videoId = videoId;
    this.videoInfo = videoInfo;
  }
}
