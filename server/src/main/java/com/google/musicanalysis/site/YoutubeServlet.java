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
    protected String getYoutubeRes(String apiKey, String accessToken, String pageToken) 
        throws ServletException, IOException {
        // make http request to youtube API
        URLEncodedBuilder youtubeParam = new URLEncodedBuilder()
            .add("part", "topicDetails")
            .add("myRating", "like")
            .add("key", apiKey)
            .add("pageToken", pageToken);
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
     * @param likedVideoRes json obj of youtube response body 
     * @return number of total results from json response
     */
    protected int getTotalResults(JsonObject likedVideoRes) {
        JsonObject pageInfo = likedVideoRes.getAsJsonObject("pageInfo");
        JsonPrimitive totalResults = pageInfo.getAsJsonPrimitive("totalResults");
        return totalResults.getAsInt();
    }

    /**
     * @param likedVideoRes json obj of youtube response body 
     * @return next page token json primitive
     */
    protected String getNextPageToken(JsonObject likedVideoRes) {
        JsonPrimitive nextPageToken = likedVideoRes.getAsJsonPrimitive("nextPageToken");
        
        // null condition will be checked to see if no more http calls
        String tokenStr = null;
        if (nextPageToken != null) {
            tokenStr = nextPageToken.getAsString();
        }
        return tokenStr;
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

        String youtubeResBody; 
        JsonObject likedVideoRes;
        JsonArray videos;
        YoutubeGenres genreAnalysis = new YoutubeGenres();
        // needed to keep track of likedMusicHistory for heat map
        int videosRetrieved = 0;

        // next Page Token must be an empty string for first http call
        String nextPageToken = "";
        // Make multiple paginated calls to youtube API. 
        // Each call has a new page token
        while (nextPageToken != null) {
            youtubeResBody = getYoutubeRes(API_KEY, 
                                            accessToken.toString(), 
                                            nextPageToken);            
            likedVideoRes = JsonParser.parseString(youtubeResBody).getAsJsonObject();

            if (nextPageToken == "") {
                // only need one JSON response to get totalLiked
                genreAnalysis.totalLiked = getTotalResults(likedVideoRes);
            }

            videos = likedVideoRes.getAsJsonArray("items");
            // videosRetrieved keeps track of music video order in genreAnalysis
            videosRetrieved += genreAnalysis
                                .calculateMusicCount(videos, videosRetrieved);

            nextPageToken = getNextPageToken(likedVideoRes);
        }

        Gson gson = new Gson();
        res.setContentType("application/json"); 
        res.getWriter().println(gson.toJson(genreAnalysis));
    }
}
