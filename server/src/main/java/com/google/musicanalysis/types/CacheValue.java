package com.google.musicanalysis.types;

import java.time.Instant;
import java.util.HashMap;
import java.io.Serializable;

public class CacheValue implements Serializable {
    public final AnalysisGroup responseData;
    public final Instant timestamp;

    public CacheValue(AnalysisGroup responseData) {
        this.responseData = responseData;
        this.timestamp = Instant.now();
    }
}
