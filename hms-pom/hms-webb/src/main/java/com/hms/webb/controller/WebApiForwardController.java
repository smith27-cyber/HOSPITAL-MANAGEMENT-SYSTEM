package com.hms.webb.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;

/**
 * hms-webb's Web API — not a copy of any business logic, just a forwarding
 * layer that relays /api/** requests to hms-jar's Backend API. This is
 * what keeps the browser same-origin: from its point of view, whichever
 * server delivered the page also answers /api/**.
 *
 * Uses exchange() rather than retrieve() so upstream error statuses
 * (401, 404, 400, ...) are passed through as-is instead of being thrown
 * as exceptions and swallowed.
 */
@RestController
public class WebApiForwardController {

    private final RestClient restClient = RestClient.builder()
            .baseUrl("http://localhost:8081")
            .build();

    @RequestMapping("/api/**")
    public ResponseEntity<byte[]> forward(HttpServletRequest request) throws IOException {
        String uri = request.getRequestURI();
        if (request.getQueryString() != null) {
            uri += "?" + request.getQueryString();
        }

        byte[] body = request.getInputStream().readAllBytes();

        return restClient.method(HttpMethod.valueOf(request.getMethod()))
                .uri(uri)
                .headers(headers -> copyRequestHeaders(request, headers))
                .body(body)
                .exchange((req, res) -> {
                    byte[] responseBody = res.getBody().readAllBytes();
                    HttpHeaders responseHeaders = new HttpHeaders();
                    res.getHeaders().forEach((name, values) -> {
                        if (!HttpHeaders.TRANSFER_ENCODING.equalsIgnoreCase(name)
                                && !HttpHeaders.CONTENT_LENGTH.equalsIgnoreCase(name)) {
                            responseHeaders.addAll(name, values);
                        }
                    });
                    return ResponseEntity.status(res.getStatusCode())
                            .headers(responseHeaders)
                            .body(responseBody);
                });
    }

    private void copyRequestHeaders(HttpServletRequest request, HttpHeaders headers) {
        Enumeration<String> names = request.getHeaderNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            if (HttpHeaders.HOST.equalsIgnoreCase(name)
                    || HttpHeaders.CONTENT_LENGTH.equalsIgnoreCase(name)) {
                continue;
            }
            Collections.list(request.getHeaders(name)).forEach(value -> headers.add(name, value));
        }
    }
}
