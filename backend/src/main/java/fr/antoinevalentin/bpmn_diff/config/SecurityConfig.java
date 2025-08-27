package fr.antoinevalentin.bpmn_diff.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuration de la sécurité pour l'application.
 * <p>
 * - Active l'authentification OAuth2 JWT pour toutes les requêtes.
 * - Désactive CSRF car l'application est une API.
 * - Configure CORS pour autoriser uniquement l'URL du frontend.
 */
@Configuration
public class SecurityConfig {

    @Value("${frontend.url}")
    private String frontendUrl;

    /**
     * Configure la chaîne de filtres de sécurité HTTP.
     * <p>
     * - Toutes les requêtes doivent être authentifiées.
     * - OAuth2 Resource Server avec JWT.
     * - CSRF désactivé.
     * - CORS configuré via {@link #corsConfigurationSource()}.
     *
     * @param http l'objet HttpSecurity fourni par Spring Security
     * @return la chaîne de filtres de sécurité construite
     * @throws Exception en cas d'erreur de configuration
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(Customizer.withDefaults())
            )
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()));

        return http.build();
    }

    /**
     * Définit la configuration CORS pour l'application.
     * <p>
     * Autorise uniquement l'origine du frontend, les méthodes GET,
     * tous les headers et les credentials. La configuration est appliquée
     * à toutes les routes (/**).
     *
     * @return un {@link CorsConfigurationSource} prêt à utiliser
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.setAllowedOrigins(List.of(frontendUrl));
        corsConfiguration.setAllowedMethods(List.of("GET"));
        corsConfiguration.setAllowCredentials(true);
        corsConfiguration.setAllowedHeaders(List.of("*"));
        corsConfiguration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return source;
    }
    
}
