package com.google.musicanalysis.types;
import java.io.Serializable;

// Groups together natural language results for ease of use
public class NLPResult implements Serializable {
  double magnitude;
  double score;

  public NLPResult(double magnitude, double score) {
    this.magnitude = magnitude;
    this.score = score;
  }
}
