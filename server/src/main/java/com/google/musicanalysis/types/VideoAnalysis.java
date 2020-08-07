package com.google.musicanalysis.types;

import java.util.ArrayList;
import java.util.HashMap;
import java.io.Serializable;

/**
 * Groups together analysis data for easy sending/reading from the 
 * backend to the front end
 */
public class VideoAnalysis implements Serializable {
  public final HashMap<String, String> perspectiveMap;
  public final NLPResult magnitudeAndScore;
  public final ArrayList<Comment> commentArray;
  public final String videoId;
  public final VideoInfo videoInfo;

  public VideoAnalysis(
      HashMap<String, String> perspectiveMap,
      NLPResult magnitudeAndScore,
      ArrayList<Comment> commentArray,
      String videoId,
      VideoInfo videoInfo) {
    this.perspectiveMap = perspectiveMap;
    this.magnitudeAndScore = magnitudeAndScore;
    this.commentArray = commentArray;
    this.videoId = videoId;
    this.videoInfo = videoInfo;
  }
}
