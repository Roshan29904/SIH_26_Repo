package com.backend.auth.security;

import com.backend.auth.service.JwtService;
import com.backend.user.entity.User;
import com.backend.user.entity.UserDevice;
import com.backend.user.repo.UserDeviceRepo;
import com.backend.user.repo.UserRepo;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepo userRepo;
    private final UserDeviceRepo userDeviceRepo;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (!jwtService.isValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {

            String email = jwtService.extractEmail(token);

            Long deviceId = jwtService.extractDeviceId(token);

            User user = userRepo.findByEmail(email).orElse(null);

            if (user == null || !user.isEnabled()) {
                filterChain.doFilter(request, response);
                return;
            }

            if (deviceId == null) {
                filterChain.doFilter(request, response);
                return;
            }

            UserDevice device = userDeviceRepo.findById(deviceId).orElse(null);

            if (device == null || !device.getUser().getId().equals(user.getId())) {
                filterChain.doFilter(request, response);
                return;
            }

            if (device.isRevoked()) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);

                response.setContentType("application/json");

                response.getWriter().write(
                        """
                        {
                            "message": "Device has been revoked",
                            "status": 403
                        }
                        """
                );
                return;
            }

            SimpleGrantedAuthority authority =
                    new SimpleGrantedAuthority(
                            "ROLE_" + user.getRole().name()
                    );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            List.of(authority)
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception ignored) {
            // Invalid token/device → continue
            // without authentication
        }
        filterChain.doFilter(request, response);
    }
}