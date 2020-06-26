package com.google.musicanalysis.util;

import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * A builder for creating URL-encoded query strings.
 */
public class URLEncodedBuilder {
  private final StringBuilder sb = new StringBuilder();

  public static URLEncodedBuilder fromMap(Map<String, String> items) {
    return fromMap(items, StandardCharsets.UTF_8);
  }

  public static URLEncodedBuilder fromMap(Map<String, String> items, Charset charset) {
    var builder = new URLEncodedBuilder();

    for (var entry : items.entrySet()) {
      builder = builder.add(entry.getKey(), entry.getValue(), charset);
    }

    return builder;
  }

  /**
   * Adds the key and value to this builder, then returns itself. Note that this builder is not
   * immutable! The original builder is mutated and returned.
   */
  public URLEncodedBuilder add(String key, String value) {
    return add(key, value, StandardCharsets.UTF_8);
  }

  /**
   * Adds the key and value to this builder with the given charset, then returns itself. Note that
   * this builder is not immutable! The original builder is mutated and returned.
   */
  public URLEncodedBuilder add(String key, String value, Charset charset) {
    var encodedKey = URLEncoder.encode(key, charset);
    var encodedVal = URLEncoder.encode(value, charset);
    
    if (sb.length() > 0) {
      sb.append("&");
    }

    sb.append(encodedKey);
    sb.append("=");
    sb.append(encodedVal);

    return this;
  }

  public String build() {
    return sb.toString();
  }
}
