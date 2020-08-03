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
import java.util.Map;
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

    String input = req.getParameter("name");
   
    assert input == null : "Something went wrong with sending to backend.";

    // Use like this: {url_parameter, value}
    HashMap<String, String> videoArgs = new HashMap<>();
    HashMap<String, String> commentArgs = new HashMap<>();
    HashMap<String, String> nameArgs = new HashMap<>();

    String videoId = input; // assume user enters id

    commentArgs.put("part", "snippet");
    commentArgs.put("order", "relevance");
    commentArgs.put("videoId", input);
    String commentsJson = new YoutubeRequest("commentThreads", commentArgs).getResult();

    if (commentsJson.equals("unreadable")) {
      // We need to search for the id and get the comments again
      videoArgs.put("q", input);
      videoArgs.put("type", "video");
      String videoIdJson = new YoutubeRequest("search", videoArgs).getResult();
      videoId = getVideoId(videoIdJson);

      commentArgs.replace("videoId", videoId);
      commentsJson = new YoutubeRequest("commentThreads", commentArgs).getResult();
    }

    ArrayList<CommentLikes> commentArray = retrieveComments(commentsJson);
    String cumulativeComments = convertToString(commentArray);

    nameArgs.put("part", "snippet");
    nameArgs.put("id", videoId);
    String nameJson = new YoutubeRequest("videos", nameArgs).getResult();
    NameAndChannel videoInfo = getNameAndChannel(nameJson);

    HashMap<String, String> perspectiveMap = analyzeWithPerspective(cumulativeComments);
    
    HashMap<Integer, NLPResult> unweightedNLPMap = new HashMap<>();
    for (CommentLikes commentAndLikes: commentArray) {
        unweightedNLPMap.put(commentAndLikes.likes, analyzeWithNLP(commentAndLikes.comment));
    }
    NLPResult weightedSentiment = createWeightedSentiment(unweightedNLPMap);

    String json =
        convertToJsonUsingGson(
            new AnalysisGroup(perspectiveMap, weightedSentiment, commentArray, videoId, videoInfo));
    res.setContentType("application/json;");
    res.getWriter().println(json);
  }

  /** @param arr the array that will be converted to json */
  private String convertToJsonUsingGson(AnalysisGroup group) {
    Gson gson = new Gson();
    String json = gson.toJson(group);
    return json;
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
   * Takes the given map of sentiments and creates a common weighted 
   * sentiment according to the number of likes each comment receives
   * out of the sum of the likes of the comments
   *
   * @param unweightedNLPMap the unweighted map of <like, nlp> pairs
   * @return A weighted NLPResult object
   */
  private NLPResult createWeightedSentiment(HashMap<Integer, NLPResult> unweightedNLPMap) {
      double totalLikes = 0;

      for (Map.Entry<Integer, NLPResult> likesAndNLPResult : unweightedNLPMap.entrySet()) {
          totalLikes += (double) likesAndNLPResult.getKey();
      }

      double weightedMagnitude = 0;
      double weightedScore = 0;

      for (Map.Entry<Integer, NLPResult> likesAndNLPResult : unweightedNLPMap.entrySet()) {
          weightedMagnitude += (likesAndNLPResult.getKey() / totalLikes) * likesAndNLPResult.getValue().magnitude;
          weightedScore += (likesAndNLPResult.getKey() / totalLikes) * likesAndNLPResult.getValue().score;
      }

      return new NLPResult(weightedMagnitude, weightedScore);
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

  private NameAndChannel getNameAndChannel(String response) {

    // Accessing the items JSON Array
    JsonElement jElement = JsonParser.parseString(response);
    JsonObject jObject = jElement.getAsJsonObject();
    JsonArray itemsArray = jObject.getAsJsonArray("items");
    JsonElement el = itemsArray.get(0);

    // Grabbing the name and channel
    JsonObject object = el.getAsJsonObject();
    JsonObject data = object.getAsJsonObject("snippet");
    JsonElement videoName = data.get("title");
    JsonElement channelName = data.get("channelTitle");

    return new NameAndChannel(
        videoName.toString().replace("\"", ""), channelName.toString().replace("\"", ""));
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

  /**
   * Parses the comment JSON string and retrieves the comments.
   *
   * @param response The JSON string to be parsed.
   * @return An ArrayList with each comment
   */
  private ArrayList<CommentLikes> retrieveComments(String response) {
    ArrayList<CommentLikes> commentList = new ArrayList<>();

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

      Integer likes =
          el.getAsJsonObject()
              .getAsJsonObject("snippet")
              .getAsJsonObject("topLevelComment")
              .getAsJsonObject("snippet")
              .get("likeCount")
              .getAsInt();

      String filteredComment = filterComment(topComment);
      CommentLikes commentAndLikes = new CommentLikes(filteredComment, likes);
      commentList.add(commentAndLikes);
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
  private String convertToString(ArrayList<CommentLikes> comments) {
    StringBuilder res = new StringBuilder();

    for (CommentLikes commentAndLikes : comments) {
      String comment = commentAndLikes.comment;

      comment = comment.replace("\"", "");
      // Make sure each comment is treated as its own sentence
      // Not sure char datatype works with regex so used String
      String lastCharacter = comment.substring(comment.length() - 1);
      if (!lastCharacter.matches("\\.|!|\\?")) {
        comment += ". ";
      } else {
        comment += " ";
      }
      res.append(comment);
    }

    return res.toString();
  }

  /**
   * Filters out a comment string so that it's readable and doesn't break the frontend.
   *
   * @param comment The comment to be filtered.
   * @return A properly formatted comment
   */
  private String filterComment(String comment) {
    String filteredComment = comment;

    // Handles non-ASCII characters, newlines,
    // trimmed quotes, embedded escaped quotes.
    // Order matters.
    filteredComment = filteredComment.replaceAll("[^\\x00-\\x7F]", "");
    filteredComment = String.join("\n", filteredComment.split("\\\\n"));
    filteredComment = filteredComment.substring(1, filteredComment.length() - 1);
    filteredComment = filteredComment.replace("\\\"", "");

    return filteredComment;
  }
}
