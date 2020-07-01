/**
 * Sample Java code for youtube.videos.list
 * See instructions for running these code samples locally:
 * https://developers.google.com/explorer-help/guides/code_samples#java
 */
package com.google.musicanalysis.site;
import com.google.musicanalysis.util.Secrets;
import com.google.musicanalysis.util.URLEncodedBuilder;

import com.google.gson.JsonParser;
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


@WebServlet("/api/youtube")
public class YoutubeServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) 
        throws ServletException, IOException {
        // retrieve Youtube API key and access token 
        String API_KEY = ""; 
        HttpSession session = null;
        String accessToken = "";
        try {
            API_KEY = Secrets.getSecretString("YOUTUBE_API_KEY");
            session = req.getSession();
            accessToken = session.getAttribute("youtube_access_token").toString();
        } catch (NullPointerException e) {
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
                .header("Authorization", "Bearer " + accessToken)
                .header("Accept", "application/json")
                .GET()
                .build();

        // get response to Youtube API 
        var youtubeRes = httpClient.sendAsync(youtubeReq, BodyHandlers.ofString()).join();
        var youtubeResBody = youtubeRes.body();
        res.getWriter().write(youtubeResBody);
    }
}
