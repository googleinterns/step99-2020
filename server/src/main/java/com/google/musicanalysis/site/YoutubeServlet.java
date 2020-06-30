/**
 * Sample Java code for youtube.videos.list
 * See instructions for running these code samples locally:
 * https://developers.google.com/explorer-help/guides/code_samples#java
 */
package com.google.musicanalysis.site;

import com.google.gson.JsonParser;
import com.google.musicanalysis.util.URLEncodedBuilder;
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
        HttpSession session = req.getSession();
        String accessToken = (String) session.getAttribute("access_token");

        res.getWriter().printf("%s", accessToken);
    
    }
}
