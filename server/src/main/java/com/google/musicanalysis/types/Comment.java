package com.google.musicanalysis.types;

import java.io.Serializable;

/** Groups together a comment with its likes */
public class Comment implements Serializable {
  public String text;
  public Integer likes;

  public Comment(String text, Integer likes) {
    this.text = comment;
    this.likes = likes;
  }
}
