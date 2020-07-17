package com.google.musicanalysis.site;
import com.google.musicanalysis.util.Secrets;
import com.google.musicanalysis.util.URLEncodedBuilder;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.JsonPrimitive;
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
import java.util.ArrayList;
import java.util.List;

/** Servlet handles youtube api call to get genres of liked videos */
@WebServlet("/api/youtube")
public class YoutubeServlet extends HttpServlet {

    static final int DEFAULT_NUM_VIDS = 10;
    static int totalMusic = 0;

    /**
     * makes http request of youtube api to retrieve topics of liked videos, 
     *  gets json string of youtube response
     * @param apiKey youtube api key
     * @param accessToken youtube access token from login
     * @param numVideos max number of liked videos to retrieve 
     * @return JSON string of youtube response of liked video topics
     * @throws ServletException
     * @throws IOException
     */
    protected String getYoutubeRes(String apiKey, String accessToken, int numVideos) 
        throws ServletException, IOException {
        // make http request to youtube API
        URLEncodedBuilder youtubeParam = new URLEncodedBuilder()
            .add("part", "topicDetails")
            .add("myRating", "like")
            .add("key", apiKey)
            .add("maxResults", Integer.toString(numVideos));
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
     * @param youtubeJsonObj json obj of youtube response body 
     * @return number of total results from json response
     */
    protected int getTotalResults(JsonObject youtubeJsonObj) {
        JsonObject pageInfo = youtubeJsonObj.getAsJsonObject("pageInfo");
        JsonPrimitive totalResults = pageInfo.getAsJsonPrimitive("totalResults");
        return totalResults.getAsInt();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) 
        throws ServletException, IOException {
        String API_KEY = Secrets.getSecretString("YOUTUBE_API_KEY");
        HttpSession session = req.getSession();

        var accessToken = session.getAttribute("oauth-access-token-youtube");
        if (accessToken == null) {
            res.setStatus(401);
            return;
        }

        String numVideosParam = req.getParameter("num_videos");
        int numVideos = DEFAULT_NUM_VIDS;
        if (numVideosParam != null) {
            numVideos = Integer.parseInt(numVideosParam);
        }

        String youtubeResBody = getYoutubeRes(API_KEY, accessToken.toString(), numVideos);
        System.out.println(youtubeResBody);
        JsonObject youtubeJsonObj = JsonParser.parseString(youtubeResBody).getAsJsonObject();

        List<VideoGenreCount> genreCountList = new ArrayList<>();
        JsonArray videos = youtubeJsonObj.getAsJsonArray("items");
        updateMusicCount(videos, genreCountList);
        int totalLiked = getTotalResults(youtubeJsonObj);
        YoutubeGenres jsonRes = new YoutubeGenres(genreCountList, totalLiked, totalMusic);

        Gson gson = new Gson();
        res.setContentType("application/json"); 
        res.getWriter().println(gson.toJson(jsonRes));
    }
}
