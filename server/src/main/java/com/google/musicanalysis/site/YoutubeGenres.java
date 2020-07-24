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
  private HashMap<String, Integer> genreData = new HashMap<String, Integer>();
  private final int totalLiked;
  private int totalMusic = 0;
  private boolean isMusic;
  private int maxGenreCount = 0;

  public YoutubeGenres(int totalLiked) {
    this.totalLiked = totalLiked;
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
        int totalSubgenres = 0;
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
                totalSubgenres++;
                this.updateGenre(topic);
                break;
              case -1:
                continue;
            }
        } 

        if (isMusic && totalSubgenres == 0) {
            // video only classified as Music so we update as "Other music"
            this.updateGenre("Other music");
        }
    }
    return;
  }

/**
 * checks whether topic is categorized as music
 * and whether it has other 
 * @param topic identifies youtube video category e.g. Knowledge or Pop music
 * @return 0 is topic is "Music", 1 if topic is a specific music category (Pop Music), 
 *        -1 if topic is not music
 */
  private int getMusicCategory(String topic) {
    if (topic.equals("Music")) {
        return 0;
    }

    return topic.toLowerCase().contains("music") ? MUSIC_SUBGENRE : NON_MUSIC_TOPIC;

  }

/**
 * updates this.genreData HashMap with new genre or count
 * by checking if key exists
 * @param topic identifies youtube video music category e.g. Pop music
 */
  private void updateGenre(String topic) {
    int count = this.genreData.containsKey(topic) ? this.genreData.get(topic) : 0;
    this.genreData.put(topic, count + 1);
    
  }
}
