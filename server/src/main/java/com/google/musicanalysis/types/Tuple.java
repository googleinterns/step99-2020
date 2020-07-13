package com.google.musicanalysis.types;

import java.util.HashMap;

public class Tuple {
  public final HashMap<String, String> map;
  public final MagnitudeAndScore magnitudeAndScore;

  public Tuple(HashMap<String, String> map, MagnitudeAndScore magnitudeAndScore) {
    this.map = map;
    this.magnitudeAndScore = magnitudeAndScore;
  }
}
