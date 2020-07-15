package com.google.musicanalysis.types;

import java.util.HashMap;

public class AnalysisPair {
  public final HashMap<String, String> perspectiveMap;
  public final MagnitudeAndScore magnitudeAndScore;

  public AnalysisPair(HashMap<String, String> perspectiveMap, MagnitudeAndScore magnitudeAndScore) {
    this.perspectiveMap = perspectiveMap;
    this.magnitudeAndScore = magnitudeAndScore;
  }
}
