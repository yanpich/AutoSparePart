package com.real.autosparepart.util;

public class SlugUtil {

    public static String generate(String input) {
        return input.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-");
    }
}