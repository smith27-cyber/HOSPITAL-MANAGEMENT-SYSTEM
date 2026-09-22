
package com.hms.backend.auth.dto;

import java.util.List;

public class DevLoginStatusResponse {

    private boolean enabled;

    private List<String> usernames;

    public DevLoginStatusResponse() {
    }

    public DevLoginStatusResponse(
        boolean enabled,
        List<String> usernames
    ) {
        this.enabled = enabled;
        this.usernames = usernames;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public List<String> getUsernames() {
        return usernames;
    }
}
