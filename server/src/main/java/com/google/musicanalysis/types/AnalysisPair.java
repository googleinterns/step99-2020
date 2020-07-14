package com.google.musicanalysis.types;

import java.util.HashMap;

public class AnalysisPair {
  public final HashMap<String, String> map;
  public final MagnitudeAndScore magnitudeAndScore;

  public AnalysisPair(HashMap<String, String> map, MagnitudeAndScore magnitudeAndScore) {
    this.map = map;
    this.magnitudeAndScore = magnitudeAndScore;
  }
}
