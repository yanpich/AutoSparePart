package com.real.autosparepart.common.utils;

public class SlugUtil {

    public static String generate(String input) {
        return input.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-");
    }
}