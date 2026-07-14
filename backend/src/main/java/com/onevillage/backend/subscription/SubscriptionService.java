package com.onevillage.backend.subscription;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.subscription.dto.CheckoutSessionResponse;
import com.onevillage.backend.subscription.dto.PlanResponse;
import com.onevillage.backend.subscription.dto.SubscriptionResponse;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import com.onevillage.backend.user.UserRole;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SubscriptionService {

    private static final List<PlanResponse> PLANS = List.of(
            new PlanResponse("FREE", "Member", "Free", "", "Join and connect",
                    List.of("Unlimited communities", "RSVP to events", "Direct messages", "Notifications")),
            new PlanResponse("COMMUNITY_LEADER", "Community Leader", "$10", "/month", "Most popular",
                    List.of("All Member features", "Create & manage a community", "Publish announcements & events", "Basic analytics")),
            new PlanResponse("ORGANIZATION", "Organization", "$20", "/month", "For businesses & nonprofits",
                    List.of("All Leader features", "Verified org page", "Contact communities directly", "Team seats"))
    );

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final StripeService stripeService;

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                                PaymentRepository paymentRepository,
                                UserRepository userRepository,
                                StripeService stripeService) {
        this.subscriptionRepository = subscriptionRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.stripeService = stripeService;
    }

    public List<PlanResponse> getPlans() {
        return PLANS;
    }

    public SubscriptionResponse getMine(UUID userId) {
        return subscriptionRepository.findByUserId(userId)
                .map(this::toResponse)
                .orElse(new SubscriptionResponse(null, SubscriptionPlan.FREE, SubscriptionStatus.ACTIVE, null));
    }

    public CheckoutSessionResponse createCheckoutSession(UUID userId, String planRaw) {
        SubscriptionPlan plan;
        try {
            plan = SubscriptionPlan.valueOf(planRaw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("plan must be one of COMMUNITY_LEADER, ORGANIZATION");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        Session session = stripeService.createCheckoutSession(userId, user.getEmail(), plan);
        return new CheckoutSessionResponse(session.getUrl());
    }

    @Transactional
    public void cancel(UUID userId) {
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("You do not have an active subscription"));
        if (subscription.getStripeSubscriptionId() == null) {
            throw ApiException.badRequest("This subscription is not linked to a payment provider");
        }
        stripeService.cancelAtPeriodEnd(subscription.getStripeSubscriptionId());
    }

    // --- Admin ---

    public List<com.onevillage.backend.subscription.dto.AdminSubscriptionResponse> adminListAll() {
        return subscriptionRepository.findAll().stream().map(s -> {
            User user = userRepository.findById(s.getUserId()).orElse(null);
            return new com.onevillage.backend.subscription.dto.AdminSubscriptionResponse(
                    s.getId(), s.getUserId(),
                    user == null ? null : user.getFullName(),
                    user == null ? null : user.getEmail(),
                    s.getPlan(), s.getStatus(), s.getCurrentPeriodEnd(), s.getCreatedAt());
        }).toList();
    }

    public long countByStatus(SubscriptionStatus status) {
        return subscriptionRepository.countByStatus(status);
    }

    // --- Stripe webhook handling ---

    @Transactional
    public void handleWebhookEvent(String payload, String sigHeader) {
        Event event = stripeService.constructWebhookEvent(payload, sigHeader);
        StripeObject dataObject = event.getDataObjectDeserializer().getObject().orElse(null);
        if (dataObject == null) {
            return;
        }

        switch (event.getType()) {
            case "checkout.session.completed" -> {
                if (dataObject instanceof Session session) {
                    handleCheckoutCompleted(session);
                }
            }
            case "invoice.paid" -> {
                if (dataObject instanceof Invoice invoice) {
                    handleInvoicePaid(invoice);
                }
            }
            case "customer.subscription.updated" -> {
                if (dataObject instanceof com.stripe.model.Subscription stripeSub) {
                    handleSubscriptionUpdated(stripeSub);
                }
            }
            case "customer.subscription.deleted" -> {
                if (dataObject instanceof com.stripe.model.Subscription stripeSub) {
                    handleSubscriptionDeleted(stripeSub);
                }
            }
            default -> { /* ignore other event types */ }
        }
    }

    private void handleCheckoutCompleted(Session session) {
        String userIdStr = session.getMetadata() != null ? session.getMetadata().get("userId") : session.getClientReferenceId();
        String planStr = session.getMetadata() != null ? session.getMetadata().get("plan") : null;
        if (userIdStr == null || planStr == null) {
            return;
        }
        UUID userId = UUID.fromString(userIdStr);
        SubscriptionPlan plan = SubscriptionPlan.valueOf(planStr);
        String stripeSubscriptionId = session.getSubscription();
        String stripeCustomerId = session.getCustomer();

        Subscription subscription = subscriptionRepository.findByUserId(userId).orElseGet(Subscription::new);
        subscription.setUserId(userId);
        subscription.setPlan(plan);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStripeCustomerId(stripeCustomerId);
        subscription.setStripeSubscriptionId(stripeSubscriptionId);
        subscription.setCurrentPeriodEnd(stripeSubscriptionId != null ? stripeService.retrievePeriodEnd(stripeSubscriptionId) : null);
        subscriptionRepository.save(subscription);

        userRepository.findById(userId).ifPresent(user -> {
            UserRole targetRole = plan == SubscriptionPlan.ORGANIZATION ? UserRole.ORGANIZATION : UserRole.COMMUNITY_LEADER;
            if (user.getRole() == UserRole.MEMBER) {
                user.setRole(targetRole);
                userRepository.save(user);
            }
        });
    }

    private void handleInvoicePaid(Invoice invoice) {
        String stripeSubscriptionId = invoice.getSubscription();
        if (stripeSubscriptionId == null || paymentRepository.existsByStripeInvoiceId(invoice.getId())) {
            return;
        }
        Optional<Subscription> subscriptionOpt = subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId);
        if (subscriptionOpt.isEmpty()) {
            return;
        }
        Payment payment = new Payment();
        payment.setSubscriptionId(subscriptionOpt.get().getId());
        payment.setAmount(BigDecimal.valueOf(invoice.getAmountPaid()).divide(BigDecimal.valueOf(100)));
        payment.setCurrency(invoice.getCurrency());
        payment.setStatus("paid");
        payment.setStripeInvoiceId(invoice.getId());
        payment.setPaidAt(Instant.now());
        paymentRepository.save(payment);
    }

    private void handleSubscriptionUpdated(com.stripe.model.Subscription stripeSub) {
        subscriptionRepository.findByStripeSubscriptionId(stripeSub.getId()).ifPresent(subscription -> {
            subscription.setStatus(mapStripeStatus(stripeSub.getStatus()));
            subscription.setCurrentPeriodEnd(Instant.ofEpochSecond(stripeSub.getCurrentPeriodEnd()));
            subscriptionRepository.save(subscription);
        });
    }

    private void handleSubscriptionDeleted(com.stripe.model.Subscription stripeSub) {
        subscriptionRepository.findByStripeSubscriptionId(stripeSub.getId()).ifPresent(subscription -> {
            subscription.setStatus(SubscriptionStatus.CANCELLED);
            subscriptionRepository.save(subscription);

            userRepository.findById(subscription.getUserId()).ifPresent(user -> {
                UserRole planRole = subscription.getPlan() == SubscriptionPlan.ORGANIZATION ? UserRole.ORGANIZATION : UserRole.COMMUNITY_LEADER;
                if (user.getRole() == planRole) {
                    user.setRole(UserRole.MEMBER);
                    userRepository.save(user);
                }
            });
        });
    }

    private SubscriptionStatus mapStripeStatus(String stripeStatus) {
        return switch (stripeStatus) {
            case "active", "trialing" -> SubscriptionStatus.ACTIVE;
            case "past_due", "unpaid", "incomplete" -> SubscriptionStatus.PAST_DUE;
            default -> SubscriptionStatus.CANCELLED;
        };
    }

    private SubscriptionResponse toResponse(Subscription s) {
        return new SubscriptionResponse(s.getId(), s.getPlan(), s.getStatus(), s.getCurrentPeriodEnd());
    }
}
