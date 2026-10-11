package com.berrymilk.linebot.service;

import com.berrymilk.linebot.config.BotProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * LINE Messaging API Webhookの署名（X-Line-Signature）を検証するサービス。
 * HMAC-SHA256 でリクエストボディとChannel Secretからダイジェストを計算し、比較します。
 */
@Service
public class LineSignatureValidator {

    private static final Logger log = LoggerFactory.getLogger(LineSignatureValidator.class);
    private static final String HMAC_SHA256 = "HmacSHA256";

    private final BotProperties properties;

    public LineSignatureValidator(BotProperties properties) {
        this.properties = properties;
    }

    /**
     * リクエストの署名を検証します。
     *
     * @param requestBody 生のWebhookリクエストボディ（JSON文字列）
     * @param signature   HTTPヘッダー X-Line-Signature
     * @return 署名が正しい場合 true、不正またはキー未設定の場合 false
     */
    public boolean validate(String requestBody, String signature) {
        String channelSecret = properties.getLineChannelSecret();
        if (channelSecret == null || channelSecret.isBlank()) {
            log.warn("LINE Channel Secret is not configured. Rejecting signature verification.");
            return false;
        }

        if (signature == null || signature.isBlank() || requestBody == null) {
            return false;
        }

        try {
            SecretKeySpec keySpec = new SecretKeySpec(
                    channelSecret.getBytes(StandardCharsets.UTF_8),
                    HMAC_SHA256
            );
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(keySpec);

            byte[] hmacBytes = mac.doFinal(requestBody.getBytes(StandardCharsets.UTF_8));
            byte[] expectedBytes = Base64.getEncoder().encode(hmacBytes);
            byte[] signatureBytes = signature.getBytes(StandardCharsets.UTF_8);

            // タイミング攻撃防止のため MessageDigest.isEqual を使用
            return MessageDigest.isEqual(expectedBytes, signatureBytes);

        } catch (Exception e) {
            log.error("Error during LINE signature validation: {}", e.getMessage(), e);
            return false;
        }
    }
}
