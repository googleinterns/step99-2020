package com.google.musicanalysis.site;

import com.google.gson.*;
import com.google.musicanalysis.api.naturallanguage.*;
import com.google.musicanalysis.api.perspective.*;
import com.google.musicanalysis.api.youtube.*;
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

    res.getWriter().write("<h1>Comment Analysis</h1>\n");

    String videoName = "seun omonije";

    // Use like this: {url_parameter, value}
    HashMap<String, String> args = new HashMap<>();

    args.put("q", videoName);
    String videoIdJson = new YoutubeRequest("search", args).getResult();
    String videoId = getVideoId(videoIdJson);

    args.remove("q");
    args.put("part", "snippet");
    args.put("videoId", videoId);
    String commentsJson = new YoutubeRequest("commentThreads", args).getResult();

    res.getWriter().write(commentsJson);

    res.getWriter().write("<h3>Comments</h3>");
    String comment = "I love you.";
    res.getWriter().println(comment);

    res.getWriter().write("<h3>Perspective</h3>");
    HashMap<String, String> perspectiveMap = analyzeWithPerspective(comment);
    // Print on the screen (won't make it in final cut)
    Set set = perspectiveMap.entrySet();
    Iterator mapIterator = set.iterator();
    while (mapIterator.hasNext()) {
      Map.Entry entry = (Map.Entry) mapIterator.next();
      res.getWriter().println(entry.getKey() + ": " + entry.getValue());
    }

    res.getWriter().write("<h3>NLP</h3>");
    NLPResult nlpObject = analyzeWithNLP(comment);
    res.getWriter().println("Magnitude: " + nlpObject.magnitude + "Score: " + nlpObject.score);
  }

  private class NLPResult {
    Double magnitude;
    Double score;

    public NLPResult(Double magnitude, Double score) {
      this.magnitude = magnitude;
      this.score = score;
    }
  }

  /**
   * Analyzes the given string with the Natural Language API.
   *
   * @param text The text that will be analyzed by the Natural Language API.
   * @return A NLPResult object with the results
   */
  private NLPResult analyzeWithNLP(String text) throws IOException {
    String response = new SentimentRequest(text).getResponse();

    // Extracting the sentiment
    JsonElement jElement = JsonParser.parseString(response);
    JsonObject jObject = jElement.getAsJsonObject();
    JsonObject sentimentObject = jObject.getAsJsonObject("documentSentiment");

    NLPResult nlpResults =
        new NLPResult(
            Double.valueOf(sentimentObject.get("magnitude").toString()),
            Double.valueOf(sentimentObject.get("score").toString()));

    return nlpResults;
  }

  /**
   * Analyzes the given string with the Perspective API.
   *
   * @param text The text that will be analyzed by the Perspective API.
   * @return A hashmap with the results
   */
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

  private String getVideoId(String response) {
    ArrayList<String> searchResults = new ArrayList<>();

    // Accessing the items JSON Array
    JsonElement jElement = JsonParser.parseString(response);
    JsonObject jObject = jElement.getAsJsonObject();
    JsonArray itemsArray = jObject.getAsJsonArray("items");

    for (JsonElement el : itemsArray) {
      // Grabbing each item and adding to a result array
      JsonObject object = el.getAsJsonObject();
      JsonObject data = object.getAsJsonObject("id");
      JsonElement videoId = data.get("videoId");

      if (videoId != null) {
        searchResults.add(videoId.toString().replace("\"", ""));
      }
    }

    // Only returning the first for now, potential to change if I optimize search results.
    return searchResults.get(0);
  }
}
