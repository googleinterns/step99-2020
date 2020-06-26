package com.google.musicanalysis.site;

import com.google.gson.Gson;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/musix")
public class MusixServlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    res.getWriter().write("<h1>See below api data:\n\n</h1>");

    // Setup variables, these will be given by the front end
    String trackName = "Baby";
    String artistName = "Justin Bieber";
    String trackId = "32184842";
    String callType = "track.search";
    MusixParamBuilder params;
    MusixRequest request;

    // Getting id from song and artist name
    res.getWriter().write("\n<h3>Getting id from song and artist name</h3>");
    params = new MusixParamBuilder(callType, trackName, artistName);
    request = new MusixRequest(callType, params.getFilteredParams());
    res.getWriter().println(request.getResult());

    // Getting lyrics from a given id
    res.getWriter().write("\n<h3>Getting lyrics from given id</h3>");
    callType = "track.lyrics.get";
    params = new MusixParamBuilder(callType, trackId);
    request = new MusixRequest(callType, params.getFilteredParams());
    res.getWriter().println(request.getResult());
  }

  /** @param user the user that will be converted to json */
  private String convertToJsonUsingGson(String response) {
    Gson gson = new Gson();
    String json = gson.toJson(response);
    return json;
  }
}
