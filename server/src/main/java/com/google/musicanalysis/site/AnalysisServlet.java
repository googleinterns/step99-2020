package com.google.musicanalysis.site;

import com.google.gson.*;
import com.google.musicanalysis.api.musixmatch.*;
import com.google.musicanalysis.api.naturallanguage.*;
import com.google.musicanalysis.api.perspective.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/analysis")
public class AnalysisServlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {

    res.getWriter().write("<h1>Song Analysis</h1>\n");

    String trackName = "baby";
    String artistName = "justin bieber";

    res.getWriter().write("<h3>Lyrics</h3>");
    String trimmedLyrics = getLyrics(trackName, artistName);
    res.getWriter().println(trimmedLyrics);

    res.getWriter().write("<h3>Perspective</h3>");
    HashMap<String, String> perspectiveMap = analyzeWithPerspective(trimmedLyrics);
    // Print on the screen (won't make it in final cut)
    Set set = perspectiveMap.entrySet();
    Iterator mapIterator = set.iterator();
    while (mapIterator.hasNext()) {
      Map.Entry entry = (Map.Entry) mapIterator.next();
      res.getWriter().println(entry.getKey() + ": " + entry.getValue());
    }

    res.getWriter().write("<h3>NLP</h3>");
    MagnitudeAndScore nlpObject = analyzeWithNLP(trimmedLyrics);
    res.getWriter().println("Magnitude: " + nlpObject.magnitude + "Score: " + nlpObject.score);
  }

  private class MagnitudeAndScore {
    Double magnitude;
    Double score;

    public MagnitudeAndScore(Double magnitude, Double score) {
      this.magnitude = magnitude;
      this.score = score;
    }
  }

  private MagnitudeAndScore analyzeWithNLP(String text) throws IOException {

    // Calling the API
    String response = new SentimentRequest(text).getResponse();

    // Extracting the sentiment
    JsonElement jElement = JsonParser.parseString(response);
    JsonObject jObject = jElement.getAsJsonObject();
    JsonObject sentimentObject = jObject.getAsJsonObject("documentSentiment");

    MagnitudeAndScore nlpResults =
        new MagnitudeAndScore(
            Double.valueOf(sentimentObject.get("magnitude").toString()),
            Double.valueOf(sentimentObject.get("score").toString()));

    return nlpResults;
  }

  private HashMap<String, String> analyzeWithPerspective(String text) throws IOException {

    ArrayList<String> attributes =
        new ArrayList<>(
            Arrays.asList(
                "TOXICITY",
                "IDENTITY_ATTACK",
                "INSULT",
                "PROFANITY",
                "THREAT",
                "SEXUALLY_EXPLICIT",
                "FLIRTATION"));

    // Calling the API
    PerspectiveRequest perspectiveRequest = new PerspectiveRequest(text, attributes);
    String response = perspectiveRequest.getResponse();

    // Extracting the results
    JsonElement jElement = JsonParser.parseString(response);
    JsonObject jObject = jElement.getAsJsonObject();
    JsonObject attributeObject = jObject.getAsJsonObject("attributeScores");

    // Placing them in a Hash Map
    HashMap<String, String> perspectiveResults = new HashMap<String, String>();
    for (String el : attributes) {
      perspectiveResults.put(
          el,
          attributeObject
              .getAsJsonObject(el)
              .getAsJsonObject("summaryScore")
              .get("value")
              .toString());
    }

    return perspectiveResults;
  }

  private String getLyrics(String trackName, String artistName) throws IOException {

    /** Getting the track id from Musixmatch */

    // Calling the API
    MusixParamBuilder params = new MusixParamBuilder("track.search", trackName, artistName);
    MusixRequest musixReq = new MusixRequest("track.search", params.filterParamString());
    String response = musixReq.grabResponse();

    // Extracting the track id
    JsonElement jElement = JsonParser.parseString(response);
    JsonObject jObject = jElement.getAsJsonObject();
    JsonArray resultList =
        jObject.getAsJsonObject("message").getAsJsonObject("body").getAsJsonArray("track_list");
    Iterator<JsonElement> iterator = resultList.iterator();
    JsonElement firstResult = iterator.next();
    String trackId =
        firstResult.getAsJsonObject().getAsJsonObject("track").get("track_id").toString();

    /** Getting the lyrics from the extracted id */

    // Calling the API
    params = new MusixParamBuilder("track.lyrics.get", trackId);
    musixReq = new MusixRequest("track.lyrics.get", params.filterParamString());
    response = musixReq.grabResponse();

    // Extracting the lyrics
    jElement = JsonParser.parseString(response);
    jObject = jElement.getAsJsonObject();
    String lyricsBody =
        jObject
            .getAsJsonObject("message")
            .getAsJsonObject("body")
            .getAsJsonObject("lyrics")
            .get("lyrics_body")
            .toString();

    // Get rid of all newLines
    String trimmedLyrics = lyricsBody.replace("\\n", " ");

    return trimmedLyrics;
  }
}
