package com.google.musicanalysis.types;

import java.time.Instant;
import java.io.Serializable;

public class CacheValue implements Serializable {
    public final VideoAnalysis responseData;
    public final Instant timestamp;

    public CacheValue(VideoAnalysis responseData) {
        this.responseData = responseData;
        this.timestamp = Instant.now();
    }
}
