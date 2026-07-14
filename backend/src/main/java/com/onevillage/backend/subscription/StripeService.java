package com.onevillage.backend.subscription;

import com.onevillage.backend.common.ApiException;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class StripeService {

    @Value("${app.stripe.secret-key}")
    private String secretKey;

    @Value("${app.stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${app.stripe.price-leader}")
    private String priceLeader;

    @Value("${app.stripe.price-organization}")
    private String priceOrganization;

    @Value("${app.stripe.success-url}")
    private String successUrl;

    @Value("${app.stripe.cancel-url}")
    private String cancelUrl;

    @PostConstruct
    public void init() {
        if (secretKey != null && !secretKey.isBlank()) {
            Stripe.apiKey = secretKey;
        }
    }

    private void requireConfigured() {
        if (secretKey == null || secretKey.isBlank()) {
            throw ApiException.badRequest("Payments are not configured on this server yet. Set STRIPE_SECRET_KEY to enable subscriptions.");
        }
    }

    public String priceIdFor(SubscriptionPlan plan) {
        return switch (plan) {
            case COMMUNITY_LEADER -> priceLeader;
            case ORGANIZATION -> priceOrganization;
            case FREE -> throw ApiException.badRequest("The Free plan does not require checkout");
        };
    }

    public Session createCheckoutSession(UUID userId, String customerEmail, SubscriptionPlan plan) {
        requireConfigured();
        String priceId = priceIdFor(plan);
        if (priceId == null || priceId.isBlank()) {
            throw ApiException.badRequest("No Stripe price is configured for plan " + plan);
        }
        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setClientReferenceId(userId.toString())
                    .setCustomerEmail(customerEmail)
                    .putMetadata("plan", plan.name())
                    .putMetadata("userId", userId.toString())
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPrice(priceId)
                            .setQuantity(1L)
                            .build())
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(cancelUrl)
                    .build();
            return Session.create(params);
        } catch (StripeException e) {
            throw new IllegalStateException("Failed to create Stripe checkout session", e);
        }
    }

    public Event constructWebhookEvent(String payload, String sigHeader) {
        try {
            return Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            throw ApiException.badRequest("Invalid Stripe webhook signature");
        }
    }

    public Instant retrievePeriodEnd(String stripeSubscriptionId) {
        try {
            com.stripe.model.Subscription stripeSub = com.stripe.model.Subscription.retrieve(stripeSubscriptionId);
            return Instant.ofEpochSecond(stripeSub.getCurrentPeriodEnd());
        } catch (StripeException e) {
            return Instant.now().plusSeconds(30L * 24 * 3600);
        }
    }

    public void cancelAtPeriodEnd(String stripeSubscriptionId) {
        requireConfigured();
        try {
            com.stripe.model.Subscription stripeSub = com.stripe.model.Subscription.retrieve(stripeSubscriptionId);
            com.stripe.param.SubscriptionUpdateParams params = com.stripe.param.SubscriptionUpdateParams.builder()
                    .setCancelAtPeriodEnd(true)
                    .build();
            stripeSub.update(params);
        } catch (StripeException e) {
            throw new IllegalStateException("Failed to cancel Stripe subscription", e);
        }
    }
}
