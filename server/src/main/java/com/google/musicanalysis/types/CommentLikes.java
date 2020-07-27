package com.google.musicanalysis.types;

import java.io.Serializable;

/** Groups together a comment with its likes */
public class CommentLikes implements Serializable {
  public String comment;
  public Integer likes;

  public CommentLikes(String comment, Integer likes) {
    this.comment = comment;
    this.likes = likes;
  }
}
