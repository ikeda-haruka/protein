package com.berrymilk.linebot.service;

import com.berrymilk.linebot.config.BotProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * LINE Messaging API の Reply メッセージ送信サービス。
 */
@Service
public class LineMessageService {

    private static final Logger log = LoggerFactory.getLogger(LineMessageService.class);
    private static final String LINE_REPLY_ENDPOINT = "https://api.line.me/v2/bot/message/reply";

    private final BotProperties properties;
    private final RestClient restClient;

    public LineMessageService(BotProperties properties) {
        this.properties = properties;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(4).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(5).toMillis());

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    /**
     * お客様へLINEメッセージを返信します。
     *
     * @param replyToken Webhookイベントに含まれるreplyToken
     * @param replyText  送信するテキスト
     * @return 送信成功時 true
     */
    public boolean replyTextMessage(String replyToken, String replyText) {
        String token = properties.getLineChannelAccessToken();
        if (token == null || token.isBlank()) {
            log.error("LINE Channel Access Token is not configured. Cannot send reply.");
            return false;
        }

        if (replyToken == null || replyToken.isBlank() || replyText == null || replyText.isBlank()) {
            log.warn("Invalid replyToken or empty text. Skipped reply.");
            return false;
        }

        Map<String, Object> body = Map.of(
                "replyToken", replyToken,
                "messages", List.of(
                        Map.of(
                                "type", "text",
                                "text", replyText
                        )
                )
        );

        try {
            restClient.post()
                    .uri(LINE_REPLY_ENDPOINT)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Successfully sent reply to LINE with token: {}", replyToken);
            return true;

        } catch (Exception e) {
            log.error("Failed to send reply to LINE API: {}", e.getMessage(), e);
            return false;
        }
    }
}
