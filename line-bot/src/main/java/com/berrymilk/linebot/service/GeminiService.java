package com.berrymilk.linebot.service;

import com.berrymilk.linebot.config.BotProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Google Gemini API 連携サービス。
 * BERRY MILK 商品プロンプトをもとにステートレスに回答を生成し、
 * タイムアウトや例外発生時は即座に丁寧な定型文へフォールバックします。
 */
@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private static final String DEFAULT_FALLBACK_MESSAGE =
        "申し訳ございません。ただいまアクセスが集中しており、回答の生成にお時間をいただいております🍓\n\n" +
        "少し時間をおいて再度お試しいただくか、公式サイトのよくある質問（ https://protein-sandy.vercel.app/#faq ）もぜひご覧くださいませ✨";

    private final BotProperties properties;
    private final PromptBuilder promptBuilder;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeminiService(BotProperties properties, PromptBuilder promptBuilder, ObjectMapper objectMapper) {
        this.properties = properties;
        this.promptBuilder = promptBuilder;
        this.objectMapper = objectMapper;

        // タイムアウト設定（接続4秒、読込7秒）
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(4).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(7).toMillis());

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    /**
     * お客様のメッセージを受け取り、Gemini APIで回答を生成して返却します。
     *
     * @param userMessage お客様の質問文
     * @return AIの回答テキスト、またはフォールバック定型文
     */
    public String generateAnswer(String userMessage) {
        String apiKey = properties.getGeminiApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API Key is not configured. Returning fallback message.");
            return "BERRY MILKコンシェルジュへようこそ🍓\n現在AI連携の準備中です。商品の詳細やFAQは公式サイト（ https://protein-sandy.vercel.app/ ）をご覧くださいませ✨";
        }

        String model = properties.getGeminiModel();
        if (model == null || model.isBlank()) {
            model = "gemini-1.5-flash";
        }

        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey);

        try {
            String systemInstruction = promptBuilder.buildSystemInstruction();

            // Gemini API リクエストボディの組み立て
            Map<String, Object> requestBody = Map.of(
                    "system_instruction", Map.of(
                            "parts", List.of(Map.of("text", systemInstruction))
                    ),
                    "contents", List.of(
                            Map.of(
                                    "role", "user",
                                    "parts", List.of(Map.of("text", userMessage))
                            )
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.7,
                            "maxOutputTokens", 800
                    )
            );

            String responseJson = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (responseJson == null || responseJson.isBlank()) {
                return DEFAULT_FALLBACK_MESSAGE;
            }

            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
            if (!textNode.isMissingNode()) {
                String text = textNode.asText().trim();
                if (!text.isEmpty()) {
                    return text;
                }
            }

            log.warn("Could not parse text candidate from Gemini response: {}", responseJson);
            return DEFAULT_FALLBACK_MESSAGE;

        } catch (Exception e) {
            log.error("Failed to call Gemini API: {}", e.getMessage(), e);
            return DEFAULT_FALLBACK_MESSAGE;
        }
    }
}
