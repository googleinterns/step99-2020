package com.google.musicanalysis.site;
import com.google.musicanalysis.util.Secrets;
import com.google.musicanalysis.util.URLEncodedBuilder;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.Gson;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.annotation.WebServlet;
import java.util.HashMap;

/** Servlet handles youtube api call to get genres of liked videos */
@WebServlet("/api/youtube")
public class YoutubeServlet extends HttpServlet {
    /**
     * makes http request of youtube api to retrieve topics of liked videos, 
     *  gets json string of youtube response
     * @param apiKey youtube api key
     * @param accessToken youtube access token from login
     * @return JSON string of youtube response of liked video topics
     * @throws ServletException
     * @throws IOException
     */
    protected String getYoutubeRes(String apiKey, String accessToken) 
        throws ServletException, IOException {
        // make http request to youtube API
        URLEncodedBuilder youtubeParam = new URLEncodedBuilder()
            .add("part", "topicDetails")
            .add("myRating", "like")
            .add("key", apiKey);
        URI youtubeUri = URI.create("https://www.googleapis.com/youtube/v3/videos?" + youtubeParam.build());

        var httpClient = HttpClient.newHttpClient();
        HttpRequest youtubeReq = HttpRequest.newBuilder(youtubeUri)
                .header("Authorization", "Bearer " + accessToken)
                .header("Accept", "application/json")
                .GET()
                .build();

        // get response from Youtube API 
        var youtubeRes = httpClient.sendAsync(youtubeReq, BodyHandlers.ofString()).join();
        return youtubeRes.body();
    }

    /**
     * checks whether topic is categorized as music
     * by checking if the last word is "music" or "Music"
     * @param topic identifies youtube video category e.g. Knowledge or Pop music
     * @return whether topic is categorized as music
     */
    protected Boolean isMusic(String topic) {
        String lastWord = topic.substring(topic.lastIndexOf(" ") + 1);
        return lastWord.equalsIgnoreCase("music");
    }

    /**
     * parses through youtube liked videos json string,
     * updates hash map to contain frequency count of each music genre
     * @param youtubeResBody json response of youtube liked videos
     * @param genreCount hash map of frequency count of each music genre
     */
    protected void updateMusicCount(String youtubeResBody, HashMap<String, Integer> genreCount) {
        JsonObject jObject = JsonParser.parseString(youtubeResBody).getAsJsonObject();
        JsonArray videos = jObject.getAsJsonArray("items");

        // iterates through each liked video
        for (int i = 0; i < videos.size(); i++) {
            // extracts array of topicCategories in video
            JsonObject video = videos.get(i).getAsJsonObject();
            JsonObject topicDetails = video.getAsJsonObject("topicDetails");
            if (topicDetails == null) {
                // skip this video if it doesn't have topic details
                continue;
            }
            JsonArray topicCategories = topicDetails.getAsJsonArray("topicCategories");

            for (int j = 0; j < topicCategories.size(); j++) {
                // extract music genre out of wikipedia links of topic categories
                String link = topicCategories.get(j).toString();
                String topic = link.substring(link.lastIndexOf('/') + 1);
                topic = topic.replaceAll("\"", "");
                topic = topic.replaceAll("_", " ");

                // skip if topic is not music
                if (!isMusic(topic)) {
                    break;
                }

                // update genreCount hashmap
                int count = genreCount.containsKey(topic) ? genreCount.get(topic) : 0;
                genreCount.put(topic, count + 1);
            }
        }
        return;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) 
        throws ServletException, IOException {
        // retrieve Youtube API key and access token 
        String API_KEY = Secrets.getSecretString("YOUTUBE_API_KEY");
        HttpSession session = req.getSession();
        var accessToken = session.getAttribute("oauth-access-token-youtube");
        if (accessToken == null) {
            res.setStatus(401);
            return;
        }
        String youtubeResBody = getYoutubeRes(API_KEY, accessToken.toString());
        var genreCount = new HashMap<String, Integer>();
        updateMusicCount(youtubeResBody, genreCount);

        Gson gson = new Gson();
        res.setContentType("application/json"); 
        res.getWriter().println(gson.toJson(genreCount));
    }
}
