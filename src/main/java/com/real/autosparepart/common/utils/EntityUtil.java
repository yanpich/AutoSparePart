package com.real.autosparepart.common.utils;

import java.util.Objects;

public class EntityUtil {
    public static boolean isDifferent(Object oldValue, Object newValue) {
        return !Objects.equals(oldValue, newValue);
    }
}
