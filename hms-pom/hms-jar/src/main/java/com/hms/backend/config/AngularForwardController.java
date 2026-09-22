package com.hms.backend.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class AngularForwardController {

    @RequestMapping(value = {
        "/",
        "/login",
        "/dashboard",

        "/patients",
        "/patients/**",

        "/doctors",
        "/doctors/**",

        "/departments",
        "/departments/**",

        "/appointments",
        "/appointments/**",

        "/consultations",
        "/consultations/**",

        "/pharmacy",
        "/pharmacy/**",

        "/laboratory",
        "/laboratory/**",

        "/admissions",
        "/admissions/**",

        "/billing",
        "/billing/**",

        "/inventory",
        "/inventory/**",

        "/reports",
        "/reports/**",

        "/settings",
        "/settings/**",
        "/platform",
"/platform/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}