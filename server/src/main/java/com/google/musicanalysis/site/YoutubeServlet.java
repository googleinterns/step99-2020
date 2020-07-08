package com.google.musicanalysis.site;
import com.google.musicanalysis.util.Secrets;
import com.google.musicanalysis.util.URLEncodedBuilder;

import com.google.gson.*;
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

@WebServlet("/api/youtube")
public class YoutubeServlet extends HttpServlet {
    /***
     * checks whether topic is categorized as music
     * by checking is last word is "music" or "Music"
     * @param topic
     * @return Boolean
     */
    protected Boolean isMusic(String topic) {
        String lastWord = topic.substring(topic.lastIndexOf(" ") + 1);
        return lastWord.equals("Music") || lastWord.equals("music");
    }
    /***
     * parses through youtube liked videos json string,
     * updates hash map to contain frequency count of each music genre
     * @param youtubeResBody 
     * @param genreCount
     */
    protected void updateMusicCount(String youtubeResBody, HashMap<String, Integer> genreCount) {
        // parse JSON response for topic Categories
        JsonObject jObject = JsonParser.parseString(youtubeResBody).getAsJsonObject();
        JsonArray videos = jObject.getAsJsonArray("items");
        for (int i = 0; i < videos.size(); i++){
            JsonObject video = videos.get(i).getAsJsonObject();
            JsonObject topicDetails = video.getAsJsonObject("topicDetails");
            JsonArray topicCategories = topicDetails.getAsJsonArray("topicCategories");
            for (int j = 0; j < topicCategories.size(); j++) {
                // extract music genre out of wikipedia links
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
        System.out.println(genreCount.toString());
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
    
        // make http request to youtube API
        var youtubeParam = new URLEncodedBuilder()
            .add("part", "topicDetails")
            .add("myRating", "like")
            .add("key", API_KEY);
        URI youtubeUri = URI.create("https://www.googleapis.com/youtube/v3/videos?" + youtubeParam.build());

        var httpClient = HttpClient.newHttpClient();
        var youtubeReq = HttpRequest.newBuilder(youtubeUri)
                .header("Authorization", "Bearer " + accessToken.toString())
                .header("Accept", "application/json")
                .GET()
                .build();

        // get response to Youtube API 
        var youtubeRes = httpClient.sendAsync(youtubeReq, BodyHandlers.ofString()).join();
        String youtubeResBody = youtubeRes.body();

        HashMap<String, Integer> genreCount = new HashMap<String, Integer>();
        updateMusicCount(youtubeResBody, genreCount);

        res.getWriter().write(youtubeResBody);
        res.getWriter().write(genreCount.toString());
    }
}
