package com.google.musicanalysis.site;

import com.google.gson.*;
import com.google.musicanalysis.api.naturallanguage.*;
import com.google.musicanalysis.api.perspective.*;
import com.google.musicanalysis.api.youtube.*;
import com.google.musicanalysis.types.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
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

    // Video name from the front-end
    String videoName = "sharks 101";

    // Get response from Youtube API
    String videoIdJson = new YoutubeRequest("search", videoName).getResult();
    String videoId = getVideoId(videoIdJson);
    String commentsJson = new YoutubeRequest("commentThreads", "snippet", videoId).getResult();

    // Convert response into a large string to be passed through for analysis
    ArrayList<String> commentArray = retrieveComments(commentsJson);
    String cumulativeComments = convertToString(commentArray);

    HashMap<String, String> perspectiveMap = analyzeWithPerspective(cumulativeComments);
    MagnitudeAndScore nlpObject = analyzeWithNLP(cumulativeComments);

    String json = convertToJsonUsingGson(new Tuple(perspectiveMap, nlpObject));
    res.setContentType("application/json;");
    res.getWriter().println(json);
  }

  /** @param arr the array that will be converted to json */
  private String convertToJsonUsingGson(Tuple tuple) {
    Gson gson = new Gson();
    String json = gson.toJson(tuple);
    return json;
  }

  /**
   * Analyzes the given string with the Natural Language API.
   *
   * @param text The text that will be analyzed by the Natural Language API.
   * @return A MagnitudeAndScore object with the results
   */
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

  private String getVideoId(String response) {
    ArrayList<String> searchResults = new ArrayList<>();

    // Traversing to the items array
    JsonElement jElement = JsonParser.parseString(response);
    JsonObject jObject = jElement.getAsJsonObject();
    JsonArray itemsArray = jObject.getAsJsonArray("items");

    for (JsonElement el : itemsArray) {

      // Traversing each item in the array
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

  /**
   * Parses the comment JSON string and retrieves the comments.
   *
   * @param response The JSON string to be parsed.
   * @return An ArrayList with each comment
   */
  private ArrayList<String> retrieveComments(String response) {
    ArrayList<String> commentList = new ArrayList<>();

    JsonElement jElement = JsonParser.parseString(response);
    JsonObject jObject = jElement.getAsJsonObject();
    JsonArray itemsArray = jObject.getAsJsonArray("items");

    for (JsonElement el : itemsArray) {
      String topComment =
          el.getAsJsonObject()
              .getAsJsonObject("snippet")
              .getAsJsonObject("topLevelComment")
              .getAsJsonObject("snippet")
              .get("textOriginal")
              .toString();

      // Remove all non-ASCII characters
      commentList.add(topComment.replaceAll("[^\\x00-\\x7F]", ""));
    }

    return commentList;
  }

  /**
   * Condenses array of comments into one large string, formatting it along the way and separating
   * unpunctuated sentences with a period
   *
   * @param comments The array to be condensed.
   * @return A properly formatted String
   */
  private String convertToString(ArrayList<String> comments) {
    StringBuilder res = new StringBuilder();

    for (String string : comments) {
      string = string.replace("\"", "");
      // Make sure each comment is treated as its own sentence
      // Not sure char datatype works with regex so used String
      String lastCharacter = string.substring(string.length() - 1);
      if (!lastCharacter.matches("\\.|!|\\?")) {
        string += ". ";
      } else {
        string += " ";
      }
      res.append(string);
    }

    return res.toString();
  }
}
