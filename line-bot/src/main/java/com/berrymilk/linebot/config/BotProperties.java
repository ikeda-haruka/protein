package com.berrymilk.linebot.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "bot")
public class BotProperties {

    private String lineChannelSecret = "";
    private String lineChannelAccessToken = "";
    private String geminiApiKey = "";
    private String geminiModel = "gemini-1.5-flash";

    public String getLineChannelSecret() {
        return lineChannelSecret;
    }

    public void setLineChannelSecret(String lineChannelSecret) {
        this.lineChannelSecret = lineChannelSecret;
    }

    public String getLineChannelAccessToken() {
        return lineChannelAccessToken;
    }

    public void setLineChannelAccessToken(String lineChannelAccessToken) {
        this.lineChannelAccessToken = lineChannelAccessToken;
    }

    public String getGeminiApiKey() {
        return geminiApiKey;
    }

    public void setGeminiApiKey(String geminiApiKey) {
        this.geminiApiKey = geminiApiKey;
    }

    public String getGeminiModel() {
        return geminiModel;
    }

    public void setGeminiModel(String geminiModel) {
        this.geminiModel = geminiModel;
    }
}
