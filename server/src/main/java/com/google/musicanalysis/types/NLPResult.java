package com.google.musicanalysis.types;
import java.io.Serializable;

public class NLPResult implements Serializable {
  double magnitude;
  double score;

  public NLPResult(double magnitude, double score) {
    this.magnitude = magnitude;
    this.score = score;
  }
}
