package com.google.musicanalysis.site;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.Gson;
import java.util.HashMap;
import java.util.Map;
import java.lang.Math;

enum MusicTopic {
  MUSIC_ONLY,
  MUSIC_SUBGENRE,
  NOT_MUSIC
}

/** contains final object that YoutubeServlet.java sends to frontend */
public class YoutubeGenres {
  private HashMap<String, Integer> genreData = new HashMap<String, Integer>();
  private final int totalLiked;
  private int totalMusic = 0;
  private boolean isMusic;
  private int maxGenreCount = 0;
  private JsonArray videos;

  public YoutubeGenres(int totalLiked, JsonArray videos) {
    this.totalLiked = totalLiked;
    this.calculateMusicCount(videos);
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
              case MUSIC_ONLY:
                isMusic = true;
                totalMusic++;
                break;
              case MUSIC_SUBGENRE:
                // topic is a music subgenre so we update genre 
                totalSubgenres++;
                this.updateGenre(topic);
                break;
              case NOT_MUSIC:
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
 * checks whether topic is categorized a music only, music subgenre, or not music
 * @param topic identifies youtube video category e.g. Knowledge or Pop music
 * @return MUSIC_ONLY if topic is "Music", 
 *         MUSIC_SUBGENRE if topic is a specific music category (Pop Music), 
 *         NOT_MUSIC if topic is not music
 */
  private MusicTopic getMusicCategory(String topic) {
    if (topic.equals("Music")) {
        return MusicTopic.MUSIC_ONLY;
    }

    return topic.toLowerCase().contains("music") ? MusicTopic.MUSIC_SUBGENRE : MusicTopic.NOT_MUSIC;
  }

/**
 * updates this.genreData HashMap with new genre or count
 * by checking if key exists
 * @param topic identifies youtube video music category e.g. Pop music
 */
  private void updateGenre(String topic) {
    int count = this.genreData.containsKey(topic) ? this.genreData.get(topic) : 0;
    this.genreData.put(topic, count + 1);
    maxGenreCount = Math.max(count + 1, maxGenreCount);
  }
}
