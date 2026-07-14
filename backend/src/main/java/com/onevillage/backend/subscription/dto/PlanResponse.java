package com.onevillage.backend.subscription.dto;

import java.util.List;

public record PlanResponse(
        String id,
        String label,
        String price,
        String period,
        String tag,
        List<String> features
) {
}
