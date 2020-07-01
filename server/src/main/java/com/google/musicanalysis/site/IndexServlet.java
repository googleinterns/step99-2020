package com.google.musicanalysis.site;

import com.google.musicanalysis.api.musixmatch.*;
import com.google.musicanalysis.api.perspective.*;
import com.google.musicanalysis.api.naturallanguage.*;

import com.google.gson.*;
import com.google.gson.stream.JsonReader;

import java.util.Iterator;
import java.io.StringReader;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/merged")
public class IndexServlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    res.getWriter().write("<h1>Song is baby by justin beiber");

    String trackName = "Baby";
    String artistName = "Justin Bieber";
    
    res.getWriter().write("\n<h3>Getting id from song and artist name</h3>");
    MusixParamBuilder params = new MusixParamBuilder("track.search", trackName, artistName);
    MusixRequest musixReq = new MusixRequest("track.search", params.filterParamString());
    String response = musixReq.grabResponse();
    res.getWriter().println(response);

    // extract track id
    JsonElement jElement = JsonParser.parseString(response);
    JsonObject jObject = jElement.getAsJsonObject();
    // Gets the first object
    JsonArray resultList = jObject.getAsJsonObject("message")
                            .getAsJsonObject("body")
                            .getAsJsonArray("track_list");

    Iterator<JsonElement> iterator = resultList.iterator();
    JsonElement firstResult = iterator.next();
    String trackId = firstResult.getAsJsonObject()
                                .getAsJsonObject("track")
                                .get("track_id")
                                .toString();
    System.out.println(trackId);


    res.getWriter().write("\n<h3>Getting lyrics from prior retrieved id</h3>");
    params = new MusixParamBuilder("track.lyrics.get", trackId);
    musixReq = new MusixRequest("track.lyrics.get", params.filterParamString());
    response = musixReq.grabResponse();

    jElement = JsonParser.parseString(response);
    jObject = jElement.getAsJsonObject();
    // Gets the lyrics
    resultList = jObject.getAsJsonObject("message")
                        .getAsJsonObject("body")
                        .getAsJsonObject("lyrics")
                        .get()
  }
}
