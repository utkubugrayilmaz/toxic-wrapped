package com.toxicwrapped.backend.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Emoji detection ve istatistik utility sınıfı.
 */
public final class EmojiUtils {

    // Unicode emoji pattern (geniş kapsamlı)
    private static final Pattern EMOJI_PATTERN = Pattern.compile(
            "[\\x{1F600}-\\x{1F64F}]|" +  // Emoticons
                    "[\\x{1F300}-\\x{1F5FF}]|" +  // Misc Symbols
                    "[\\x{1F680}-\\x{1F6FF}]|" +  // Transport
                    "[\\x{1F1E0}-\\x{1F1FF}]|" +  // Flags
                    "[\\x{2600}-\\x{26FF}]|" +    // Misc symbols
                    "[\\x{2700}-\\x{27BF}]|" +    // Dingbats
                    "[\\x{FE00}-\\x{FE0F}]|" +    // Variation Selectors
                    "[\\x{1F900}-\\x{1F9FF}]|" +  // Supplemental Symbols
                    "[\\x{1FA00}-\\x{1FA6F}]|" +  // Chess Symbols
                    "[\\x{1FA70}-\\x{1FAFF}]|" +  // Symbols Extended-A
                    "[\\x{231A}-\\x{231B}]|" +    // Watch, Hourglass
                    "[\\x{23E9}-\\x{23F3}]|" +    // Media controls
                    "[\\x{23F8}-\\x{23FA}]|" +    // More media
                    "[\\x{25AA}-\\x{25AB}]|" +    // Squares
                    "[\\x{25B6}]|[\\x{25C0}]|" +  // Play buttons
                    "[\\x{25FB}-\\x{25FE}]|" +    // More squares
                    "[\\x{2614}-\\x{2615}]|" +    // Umbrella, Coffee
                    "[\\x{2648}-\\x{2653}]|" +    // Zodiac
                    "[\\x{267F}]|[\\x{2693}]|" +  // Wheelchair, Anchor
                    "[\\x{26A1}]|[\\x{26AA}-\\x{26AB}]|" +
                    "[\\x{26BD}-\\x{26BE}]|" +    // Sports
                    "[\\x{26C4}-\\x{26C5}]|" +    // Weather
                    "[\\x{26CE}]|[\\x{26D4}]|" +
                    "[\\x{26EA}]|[\\x{26F2}-\\x{26F3}]|" +
                    "[\\x{26F5}]|[\\x{26FA}]|" +
                    "[\\x{26FD}]|[\\x{2702}]|" +
                    "[\\x{2705}]|[\\x{2708}-\\x{270D}]|" +
                    "[\\x{270F}]|[\\x{2712}]|" +
                    "[\\x{2714}]|[\\x{2716}]|" +
                    "[\\x{271D}]|[\\x{2721}]|" +
                    "[\\x{2728}]|[\\x{2733}-\\x{2734}]|" +
                    "[\\x{2744}]|[\\x{2747}]|" +
                    "[\\x{274C}]|[\\x{274E}]|" +
                    "[\\x{2753}-\\x{2755}]|" +
                    "[\\x{2757}]|[\\x{2763}-\\x{2764}]|" +
                    "[\\x{2795}-\\x{2797}]|" +
                    "[\\x{27A1}]|[\\x{27B0}]|" +
                    "[\\x{27BF}]|[\\x{2934}-\\x{2935}]|" +
                    "[\\x{2B05}-\\x{2B07}]|" +
                    "[\\x{2B1B}-\\x{2B1C}]|" +
                    "[\\x{2B50}]|[\\x{2B55}]|" +
                    "[\\x{3030}]|[\\x{303D}]|" +
                    "[\\x{3297}]|[\\x{3299}]|" +
                    "[\\x{1F004}]|[\\x{1F0CF}]|" +
                    "[\\x{1F170}-\\x{1F171}]|" +
                    "[\\x{1F17E}-\\x{1F17F}]|" +
                    "[\\x{1F18E}]|[\\x{1F191}-\\x{1F19A}]|" +
                    "[\\x{1F201}-\\x{1F202}]|" +
                    "[\\x{1F21A}]|[\\x{1F22F}]|" +
                    "[\\x{1F232}-\\x{1F23A}]|" +
                    "[\\x{1F250}-\\x{1F251}]"
    );

    private static final int DEFAULT_TOP_LIMIT = 10;

    private EmojiUtils() {
        // Utility class - instantiation prevented
    }

    /**
     * Mesajdaki tüm emojileri bulur ve liste olarak döner.
     */
    public static List<String> extractEmojis(String text) {
        if (text == null || text.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> emojis = new ArrayList<>();
        Matcher matcher = EMOJI_PATTERN.matcher(text);

        while (matcher.find()) {
            emojis.add(matcher.group());
        }

        return emojis;
    }

    /**
     * Mesajdaki emoji sayısını döner.
     */
    public static int countEmojis(String text) {
        return extractEmojis(text).size();
    }

    /**
     * Emoji frekans haritası oluşturur.
     */
    public static Map<String, Integer> getEmojiFrequency(String text) {
        Map<String, Integer> frequency = new HashMap<>();

        for (String emoji : extractEmojis(text)) {
            frequency.merge(emoji, 1, Integer::sum);
        }

        return frequency;
    }

    /**
     * Birden fazla metindeki emojileri birleştirip top N'i döner.
     */
    public static Map<String, Integer> getTopEmojis(Map<String, Integer> emojiCounts, int limit) {
        return emojiCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(limit)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }

    /**
     * Top 10 emoji döner (default).
     */
    public static Map<String, Integer> getTopEmojis(Map<String, Integer> emojiCounts) {
        return getTopEmojis(emojiCounts, DEFAULT_TOP_LIMIT);
    }

    /**
     * İki emoji map'ini birleştirir.
     */
    public static Map<String, Integer> mergeCounts(Map<String, Integer> map1, Map<String, Integer> map2) {
        Map<String, Integer> merged = new HashMap<>(map1);
        map2.forEach((key, value) -> merged.merge(key, value, Integer::sum));
        return merged;
    }
}