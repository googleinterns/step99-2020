package com.google.musicanalysis.site;

import com.google.gson.*;
import com.google.musicanalysis.api.naturallanguage.*;
import com.google.musicanalysis.api.perspective.*;
import com.google.musicanalysis.api.youtube.*;
import com.google.musicanalysis.cache.*;
import com.google.musicanalysis.types.*;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.regex.Matcher; 
import java.util.regex.Pattern; 
import java.time.Instant;

@WebServlet("/api/analysis")
public class AnalysisServlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    long ONE_DAY_IN_SECONDS = 86400;
    long MIN_FRESHNESS_TO_CACHE = 10 * ONE_DAY_IN_SECONDS;
    long MIN_COMMENT_ACTIVITY_TO_CACHE = 20;

    String userInput = req.getParameter("name");

    // Use like this: {url_parameter, value}
    HashMap<String, String> videoArgs = new HashMap<>();
    HashMap<String, String> commentArgs = new HashMap<>();
    HashMap<String, String> nameArgs = new HashMap<>();

    String videoId = userInput; // assume user enters id

    commentArgs.put("part", "snippet");
    commentArgs.put("videoId", userInput);
    commentArgs.put("order", "relevance");
    String commentsJson;
    
    // Runs input through the cache first
    CacheValue cachedData = AnalysisCache.retrieve(userInput);
    if (cachedData != null) {
      String json = convertToJsonUsingGson(cachedData.responseData);
      res.setContentType("application/json;");
      res.getWriter().println(json);
      return;
    }

    // Test if its a youtube id from the beginning
    if (userInput.length() == 11 && !thereIsWhiteSpace(userInput)) {
        try {
            commentsJson = new YoutubeRequest("commentThreads", commentArgs).getResult();
        } catch (IOException err) {
            videoId = getFirstVideoFromSearch(userInput);
            commentArgs.replace("videoId", videoId);
            commentsJson = new YoutubeRequest("commentThreads", commentArgs).getResult();
        }
    } else {
        videoId = getFirstVideoFromSearch(userInput);
        commentArgs.replace("videoId", videoId);
        commentsJson = new YoutubeRequest("commentThreads", commentArgs).getResult();
    }

    ArrayList<Comment> commentArray = retrieveComments(commentsJson);
    String cumulativeComments = convertToString(commentArray);

    nameArgs.put("part", "snippet");
    nameArgs.put("id", videoId);
    String nameJson = new YoutubeRequest("videos", nameArgs).getResult();
    VideoInfo videoInfo = getVideoInfo(nameJson);

    HashMap<String, String> perspectiveMap = analyzeWithPerspective(cumulativeComments);
    
    HashMap<NLPResult, Integer> unweightedNLPMap = new HashMap<>();
    for (Comment comment: commentArray) {
        unweightedNLPMap.put(analyzeWithNLP(comment.text), comment.likes);
    }
    NLPResult weightedSentiment = createWeightedSentiment(unweightedNLPMap);

    VideoAnalysis servletResults =
        new VideoAnalysis(perspectiveMap, weightedSentiment, commentArray, videoId, videoInfo);
    
    // Only add to the cache if the video is more than 10 days old,
    // and there are at least 20 comments
    long now = Instant.now().getEpochSecond();
    long instantVideoWasPublished = videoInfo.publishedDate.getEpochSecond();
    if (now - instantVideoWasPublished > MIN_FRESHNESS_TO_CACHE 
          && commentArray.size() == MIN_COMMENT_ACTIVITY_TO_CACHE) {
        AnalysisCache.add(userInput, servletResults);
    }

    String json = convertToJsonUsingGson(servletResults);
    res.setContentType("application/json;");
    res.getWriter().println(json);
  }

  /** @param arr the array that will be converted to json */
  private String convertToJsonUsingGson(VideoAnalysis group) {
    Gson gson = new Gson();
    String json = gson.toJson(group);
    return json;
  }

  /**
   * Helper function that gets the first video from Youtube search request
   *
   * @param videoParam the video parameter to put in the url
   * @return the video id as string
   */
  private String getFirstVideoFromSearch(String videoParam) throws MalformedURLException, IOException {
      HashMap<String, String> videoArgs = new HashMap<>();
      videoArgs.put("q", videoParam);
      videoArgs.put("type", "video");
      String videoIdJson = new YoutubeRequest("search", videoArgs).getResult();
      return getVideoId(videoIdJson);
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
  private NLPResult createWeightedSentiment(HashMap<NLPResult, Integer> unweightedNLPMap) {
      double totalLikes = 0;

      for (Map.Entry<NLPResult, Integer> likesAndNLPResult : unweightedNLPMap.entrySet()) {
          totalLikes += (double) likesAndNLPResult.getValue();
      }
      
      if (totalLikes == 0) {
          // If there are no likes on any comment, we they all need
          // to be weighted equally. There's not enough data to confidently
          // determine a communities reaction.
          // This will rarely hit.
          return new NLPResult(0, 0);
      }

      double weightedMagnitude = 0;
      double weightedScore = 0;

      for (Map.Entry<NLPResult, Integer> likesAndNLPResult : unweightedNLPMap.entrySet()) {
          double eachCommentLikeCount = likesAndNLPResult.getValue(); 
          // If a comment has no likes, this implementation would
          // not count it's magnitude at all. This seems like a potential
          // problem, however, if there are no likes on the comments,
          // there hasn't been enough community interaction to determine
          // a sentiment, so the tool would return "MIXED".
          // This situation would rarely be the case, since the relevance
          // feature selects the most releveant, popular comments anyway.
          weightedMagnitude += (eachCommentLikeCount / totalLikes) * likesAndNLPResult.getKey().magnitude;
          weightedScore += (eachCommentLikeCount / totalLikes) * likesAndNLPResult.getKey().score;
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

  private VideoInfo getVideoInfo(String response) {

    // Accessing the items JSON Array
    JsonElement jElement = JsonParser.parseString(response);
    JsonObject jObject = jElement.getAsJsonObject();
    JsonArray itemsArray = jObject.getAsJsonArray("items");
    JsonElement firstVideo = itemsArray.get(0);

    // Grabbing the name and channel
    JsonObject object = firstVideo.getAsJsonObject();
    JsonObject videoData = object.getAsJsonObject("snippet");
    JsonElement videoName = videoData.get("title");
    JsonElement channelName = videoData.get("channelTitle");
    JsonElement publishedTime = videoData.get("publishedAt");

    return new VideoInfo(
        videoName.toString().replace("\"", ""), 
        channelName.toString().replace("\"", ""),
        publishedTime.toString());
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
      JsonObject idObject = object.getAsJsonObject("id");
      JsonElement videoId = idObject.get("videoId");

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
  private ArrayList<Comment> retrieveComments(String response) {
    ArrayList<Comment> commentList = new ArrayList<>();

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
      Comment comment = new Comment(filteredComment, likes);
      commentList.add(comment);
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
  private String convertToString(ArrayList<Comment> comments) {
    StringBuilder res = new StringBuilder();

    for (Comment comment : comments) {
      String commentText = comment.text;

      commentText = commentText.replace("\"", "");
      // Make sure each comment is treated as its own sentence
      // Not sure char datatype works with regex so used String
      String lastCharacter = commentText.substring(commentText.length() - 1);
      if (!lastCharacter.matches("\\.|!|\\?")) {
        commentText += ". ";
      } else {
        commentText += " ";
      }
      res.append(commentText);
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

    // Removes 4683 different emojis and symbols so that NL and Perspective don't crash
    // \u00a9 : copyright character
    // \u00ae : registered sign
    // \u2000-\u3300 : superscripts and subscripts, and other symbols we can ignore.
    //                         
    // 
    // \ud83c,d,e [\ud000-\udfff] : The emoji ranges
    filteredComment = filteredComment.replaceAll("(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])", "");
    
    // changes the newlines to a readable format by the front end
    filteredComment = String.join("\n", filteredComment.split("\\\\n"));
    
    // Trims the quotes off the edges
    filteredComment = filteredComment.substring(1, filteredComment.length() - 1);
    
    // Removes embedded escaped quotes so that NL and Perspective don't mess up
    filteredComment = filteredComment.replace("\\\"", "");

    return filteredComment;
  }
  /**
   * Generic function to check for whitespace in a string
   * 
   * @param string The string to be searched
   * @return whether or not there's any whitespace
   */
  private boolean thereIsWhiteSpace(String string) {
    Pattern pattern = Pattern.compile("\\s");
    Matcher matcher = pattern.matcher(string);
    return matcher.find();
  }
}
