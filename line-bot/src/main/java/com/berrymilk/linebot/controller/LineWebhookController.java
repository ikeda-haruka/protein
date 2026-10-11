package com.berrymilk.linebot.controller;

import com.berrymilk.linebot.service.GeminiService;
import com.berrymilk.linebot.service.LineMessageService;
import com.berrymilk.linebot.service.LineSignatureValidator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * LINE Messaging API Webhookコントローラー ＆ ローカル検証用エンドポイント。
 */
@RestController
public class LineWebhookController {

    private static final Logger log = LoggerFactory.getLogger(LineWebhookController.class);

    private final LineSignatureValidator signatureValidator;
    private final GeminiService geminiService;
    private final LineMessageService lineMessageService;
    private final ObjectMapper objectMapper;

    public LineWebhookController(LineSignatureValidator signatureValidator,
                                 GeminiService geminiService,
                                 LineMessageService lineMessageService,
                                 ObjectMapper objectMapper) {
        this.signatureValidator = signatureValidator;
        this.geminiService = geminiService;
        this.lineMessageService = lineMessageService;
        this.objectMapper = objectMapper;
    }

    /**
     * ヘルスチェックエンドポイント（サーバー起動確認用）
     */
    @GetMapping({"/", "/health"})
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "BERRY MILK LINE AI Concierge",
                "timestamp", System.currentTimeMillis()
        ));
    }

    /**
     * LINE Messaging API Webhook 受信エンドポイント
     */
    @PostMapping("/callback")
    public ResponseEntity<String> callback(
            @RequestHeader(value = "X-Line-Signature", required = false) String signature,
            @RequestBody String requestBody) {

        log.info("Received LINE Webhook request");

        // 署名検証
        if (!signatureValidator.validate(requestBody, signature)) {
            log.warn("Invalid signature from LINE Webhook. Signature: {}", signature);
            // LINE Developers の接続テストなど、署名不正時は 400 Bad Request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        try {
            JsonNode root = objectMapper.readTree(requestBody);
            JsonNode events = root.path("events");

            if (events.isArray()) {
                for (JsonNode event : events) {
                    handleEvent(event);
                }
            }

        } catch (Exception e) {
            log.error("Error processing LINE webhook event: {}", e.getMessage(), e);
        }

        // LINE Webhook に対しては常に 200 OK を返却
        return ResponseEntity.ok("OK");
    }

    /**
     * Webhookイベント1件の処理（テキストメッセージならGeminiへ問い合わせて返信）
     */
    private void handleEvent(JsonNode event) {
        String type = event.path("type").asText();
        String replyToken = event.path("replyToken").asText();

        // ユーザーからのテキストメッセージのみを対象
        if ("message".equals(type)) {
            JsonNode messageNode = event.path("message");
            String messageType = messageNode.path("type").asText();

            if ("text".equals(messageType)) {
                String userText = messageNode.path("text").asText().trim();
                log.info("Received user question from LINE: {}", userText);

                // Gemini APIで回答生成（商品情報・薬機法プロンプト・フォールバック付き）
                String aiAnswer = geminiService.generateAnswer(userText);

                // LINEへ返信
                lineMessageService.replyTextMessage(replyToken, aiAnswer);
            }
        } else if ("follow".equals(type)) {
            // 友だち追加イベント時の挨拶
            String welcomeMessage = """
                    はじめまして！BERRY MILK（ベリーミルク）公式AIコンシェルジュです🍓

                    毎日のキレイを育むプロテインや内臓脂肪ケアティーについて、気になることや飲み方、商品選びなど何でもお気軽にご質問ください✨

                    【よくあるご質問の例】
                    ・プロテインの美味しい飲み方は？
                    ・スリムティーの味の種類や特徴は？
                    ・定期購入の解約はどうやるの？
                    ・妊娠中や授乳中でも飲める？
                    """;
            lineMessageService.replyTextMessage(replyToken, welcomeMessage.trim());
        }
    }

    /**
     * LINE連携前のローカルテスト用エンドポイント。
     * 例: GET /api/test-chat?q=プロテインの飲み方を教えて
     */
    @GetMapping("/api/test-chat")
    public ResponseEntity<Map<String, String>> testChatGet(@RequestParam("q") String question) {
        log.info("Test chat request received: {}", question);
        String answer = geminiService.generateAnswer(question);
        return ResponseEntity.ok(Map.of(
                "question", question,
                "answer", answer
        ));
    }

    /**
     * LINE連携前のローカルテスト用POSTエンドポイント。
     * Body: {"message": "定期便の縛りはありますか？"}
     */
    @PostMapping("/api/test-chat")
    public ResponseEntity<Map<String, String>> testChatPost(@RequestBody Map<String, String> body) {
        String question = body.getOrDefault("message", "");
        String answer = geminiService.generateAnswer(question);
        return ResponseEntity.ok(Map.of(
                "question", question,
                "answer", answer
        ));
    }
}
