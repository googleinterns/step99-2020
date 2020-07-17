package com.google.musicanalysis.site;
import java.util.ArrayList;
import java.util.List;

/** contains final object that YoutubeServlet.java sends to frontend */
public class YoutubeGenres {
  private List<VideoGenreCount> data;
  private final int totalLiked;
  private final int totalMusic;
  private boolean isMusic;

  public YoutubeGenres(List<VideoGenreCount> genreCountList, int totalLiked, int totalMusic) {
    this.data = genreCountList;
    this.totalLiked = totalLiked;
    this.totalMusic = totalMusic;
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
          System.out.println(topic + " = " + "0");
          return 0;
      }

      String lastWord = topic.substring(topic.lastIndexOf(" ") + 1);
      if (lastWord.equalsIgnoreCase("music")) {
          System.out.println(topic + " = " + "1");
          return 1;
      }

      System.out.println(topic + " = " + "-1");
      return -1;
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
          System.out.println(topic + " = " + "0");
          return 0;
      }

      String lastWord = topic.substring(topic.lastIndexOf(" ") + 1);
      if (lastWord.equalsIgnoreCase("music")) {
          System.out.println(topic + " = " + "1");
          return 1;
      }

      System.out.println(topic + " = " + "-1");
      return -1;
  }

    /**
   * updates genreCountList with new genre or count
   * by checking if .genre attribute of VideoGenreCount obj exists
   * @param topic identifies youtube video music category e.g. Pop music
   */
  protected void updateGenre(String topic) {
      Boolean containsGenre = false;
      for (VideoGenreCount videoGenre : this.data) {
          if (videoGenre.genre.equals(topic)) {
              containsGenre = true;
              videoGenre.count = videoGenre.count + 1;
          }
      }

      if (!containsGenre) {
          // check if equal to "Music"
          this.data.add(new VideoGenreCount(topic, 1));
      }
  }

    /**
   * parses through youtube liked videos json array,
   * updates hash map to contain frequency count of each music genre
   * @param videos json array of youtube liked videos
   * @param genreCountList list of that contains VideoMusicGenre obj (freq count of each music genre)
   * @param numVideos maximum number of videos to retrieve
   */
  protected void updateMusicCount(JsonArray videos) {
    for (int i = 0; i < videos.size(); i++) {
        JsonObject video = videos.get(i).getAsJsonObject();
        JsonObject topicDetails = video.getAsJsonObject("topicDetails");

        if (topicDetails == null) {
            // Video has no topics so it can't have a music topic
            continue;
        }

        JsonArray topicCategories = topicDetails.getAsJsonArray("topicCategories");
        
        boolean isMusic = false;
        int classifiedMusicCount = 0;
        for (int j = 0; j < topicCategories.size(); j++) {
            // extract music genre out of wikipedia links of topic categories
            String link = topicCategories.get(j).toString();
            String topic = link.substring(link.lastIndexOf('/') + 1);
            topic = topic.replaceAll("\"", "");
            topic = topic.replaceAll("_", " ");

            int musicCat = this.getMusicCategory(topic); // change to a switch statement
            if (musicCat == 0) {
                // topic is Music so we don't update genreCount
                isMusic = true;
                totalMusic++;
            } else if (musicCat == 1) {
                isMusic = true;                    
                classifiedMusicCount++;
                this.updateGenre(topic);                   
            } else {
                continue;
            }
        } 

        System.out.println(classifiedMusicCount);
        if (isMusic && classifiedMusicCount == 0) {
            // video only classified as Music so we update as "Other music"
            updateGenre("Other music", genreCountList);
        }
    }
    return;
  }
}
