package com.hms.webb.controller;

import java.io.IOException;
import java.net.URI;
import java.util.Collections;

import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Forwards every /api/** request to hms-jar (the Backend API). Not a copy of
 * any business logic - purely a relay, including headers (the JWT
 * Authorization header included) and status codes.
 *
 * Uses exchange() rather than retrieve() so upstream error statuses
 * (401/403/404/etc.) pass through unmodified instead of being thrown as
 * exceptions and swallowed.
 *
 * This is also what makes it safe for hms-jar to have no CORS configuration
 * at all: the browser only ever talks to hms-webb (or ng serve's dev proxy),
 * both of which forward here server-side - there is never a legitimate
 * cross-origin request to hms-jar to allow.
 */
@RestController
public class WebApiForwardController {

    private static final String BACKEND_BASE_URL = "http://localhost:8081";

    private final RestClient restClient = RestClient.create();

    @RequestMapping("/api/**")
    public void forward(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String query = request.getQueryString();
        String targetUrl = BACKEND_BASE_URL + request.getRequestURI() + (query != null ? "?" + query : "");

        RestClient.RequestBodySpec requestSpec = restClient
                .method(HttpMethod.valueOf(request.getMethod()))
                .uri(URI.create(targetUrl));

        for (String headerName : Collections.list(request.getHeaderNames())) {
            if (headerName.equalsIgnoreCase("host") || headerName.equalsIgnoreCase("content-length")) {
                continue;
            }
            for (String headerValue : Collections.list(request.getHeaders(headerName))) {
                requestSpec.header(headerName, headerValue);
            }
        }

        byte[] body = request.getInputStream().readAllBytes();

        requestSpec.body(body).exchange((req, res) -> {
            response.setStatus(res.getStatusCode().value());
            res.getHeaders().forEach((name, values) -> {
                if (name.equalsIgnoreCase("transfer-encoding") || name.equalsIgnoreCase("content-length")) {
                    return;
                }
                for (String value : values) {
                    response.addHeader(name, value);
                }
            });
            res.getBody().transferTo(response.getOutputStream());
            return null;
        });
    }

}
