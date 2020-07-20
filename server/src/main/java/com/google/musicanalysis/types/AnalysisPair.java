package com.google.musicanalysis.types;

import java.util.HashMap;

public class AnalysisPair {
  public final HashMap<String, String> perspectiveMap;
  public final NLPResult magnitudeAndScore;

  public AnalysisPair(HashMap<String, String> perspectiveMap, NLPResult magnitudeAndScore) {
    this.perspectiveMap = perspectiveMap;
    this.magnitudeAndScore = magnitudeAndScore;
  }
}
