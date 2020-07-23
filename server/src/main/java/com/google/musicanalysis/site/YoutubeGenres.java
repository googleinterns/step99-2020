package com.google.musicanalysis.site;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.Gson;
import java.util.HashMap;
import java.util.Map;
import java.lang.Math;

/** contains final object that YoutubeServlet.java sends to frontend */
public class YoutubeGenres {
  private HashMap<String, Integer> genreData;
  private final int totalLiked;
  private int totalMusic = 0;
  private boolean isMusic;
  private int maxGenreCount = 0;

  public YoutubeGenres(HashMap<String, Integer> genreCountList, int totalLiked) {
    this.genreData = genreCountList;
    this.totalLiked = totalLiked;
  }

  /**
   * checks whether topic is categorized as music
   * and whether it has other 
   * @param topic identifies youtube video category e.g. Knowledge or Pop music
   * @return 0 is topic is "Music", 1 if topic is a specific music category (Pop Music), 
   *        -1 if topic is not music
   */
  protected int getMusicCategory(String topic) {
      if (topic.equals("Music")) {
          return 0;
      }

      String firstWord = topic;
      if (topic.indexOf(" ") != -1) {
        firstWord = topic.substring(0, topic.indexOf(" "));
      }

      String lastWord = topic.substring(topic.lastIndexOf(" ") + 1);   
      if (lastWord.equalsIgnoreCase("music") || firstWord.equalsIgnoreCase("music")) {
          return 1;
      }

      return -1;
  }

  /**
 * updates this.genreData HashMap with new genre or count
 * by checking if key exists
 * @param topic identifies youtube video music category e.g. Pop music
 */
  protected void updateGenre(String topic) {
      int count = this.genreData.containsKey(topic) ? this.genreData.get(topic) : 0;
      this.genreData.put(topic, count + 1);
      
  }

    /**
   * parses through youtube liked videos json array,
   * updates hash map to contain frequency count of each music genre
   * @param videos json array of youtube liked videos
   */
  protected void calculateMusicCount(JsonArray videos) {
    for (int i = 0; i < videos.size(); i++) {
        JsonObject video = videos.get(i).getAsJsonObject();
        JsonObject topicDetails = video.getAsJsonObject("topicDetails");

        if (topicDetails == null) {
            // Video has no topics so it can't have a music topic
            continue;
        }

        JsonArray topicCategories = topicDetails.getAsJsonArray("topicCategories");
        
        boolean isMusic = false;
        int specificMusicCount = 0;
        for (int j = 0; j < topicCategories.size(); j++) {
            // extract music genre out of wikipedia links of topic categories
            String link = topicCategories.get(j).toString();
            String topic = link.substring(link.lastIndexOf('/') + 1);
            topic = topic.replaceAll("\"", "");
            topic = topic.replaceAll("_", " ");

            switch (this.getMusicCategory(topic)) {
              case 0:
                isMusic = true;
                totalMusic++;
                break;
              case 1:
                // topic is a specific music category so we update genre 
                specificMusicCount++;
                this.updateGenre(topic);
                break;
              case -1:
                continue;
            }
        } 

        if (isMusic && specificMusicCount == 0) {
            // video only classified as Music so we update as "Other music"
            this.updateGenre("Other music");
        }
    }
    return;
  }
}
