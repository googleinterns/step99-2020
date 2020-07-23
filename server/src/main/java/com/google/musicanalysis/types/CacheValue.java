package com.google.musicanalysis.types;

import java.time.Instant;
import java.util.HashMap;
import java.io.Serializable;

public class CacheValue implements Serializable {
    public final AnalysisGroup responseMap;
    public final Instant timestamp;

    public CacheValue(AnalysisGroup responseMap) {
        this.responseMap = responseMap;
        this.timestamp = Instant.now();
    }
}