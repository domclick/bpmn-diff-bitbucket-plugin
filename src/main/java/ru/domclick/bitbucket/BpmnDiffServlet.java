/**
 * Copyright Ⓒ 2020 "Sberbank Real Estate Center" Limited Liability Company. Licensed under the MIT license.
 * Please, see the LICENSE.md file in project's root for full licensing information.
 **/
package ru.domclick.bitbucket;

import com.atlassian.bitbucket.auth.AuthenticationContext;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.templaterenderer.TemplateRenderer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class BpmnDiffServlet extends HttpServlet {
    private static final String TEMPLATE_PATH = "velocity/bpmn-diff.vm";

    private final TemplateRenderer templateRenderer;
    private final AuthenticationContext authenticationContext;


    @Autowired
    public BpmnDiffServlet(
            @ComponentImport TemplateRenderer templateRenderer,
            @ComponentImport AuthenticationContext authenticationContext
    ) {
        this.templateRenderer = templateRenderer;
        this.authenticationContext = authenticationContext;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        if (authenticationContext.isAuthenticated()) {
            response.setContentType("text/html");
            Map<String, Object> params = new HashMap<>();
            templateRenderer.render(TEMPLATE_PATH, params, response.getWriter());
        }
    }
}
