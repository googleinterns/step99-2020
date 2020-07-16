package com.google.musicanalysis.types;

import java.util.ArrayList;
import java.util.HashMap;

public class AnalysisTrio {
  public final HashMap<String, String> perspectiveMap;
  public final NLPResult magnitudeAndScore;
  public final ArrayList<String> commentArray;

  public AnalysisTrio(
      HashMap<String, String> perspectiveMap,
      NLPResult magnitudeAndScore,
      ArrayList<String> commentArray) {
    this.perspectiveMap = perspectiveMap;
    this.magnitudeAndScore = magnitudeAndScore;
    this.commentArray = commentArray;
  }
}
