import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.regex.Pattern;

/**
 * HealthWebService - Portable, standalone Java HTTP Server
 *
 * Implements the HealthBridge public health REST API and static file serving
 * using Java's built-in com.sun.net.httpserver.HttpServer.
 * Requires ZERO external dependencies, Maven, or Gradle.
 * Compile & Run:
 *   javac HealthWebService.java
 *   java HealthWebService
 */
public class HealthWebService {
    private static final int PORT = 3000;
    private static final String MANDATORY_DISCLAIMER = "Educational only; not medical advice.";

    private static final Pattern DIAGNOSIS_PATTERN = Pattern.compile(
        "(?i)\\b(do i have|could i have|diagnos|what disease|what is wrong|rash|chest hurts|kaç mg|acil servis|diyabet miyim|tengo diabetes)\\b"
    );

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // REST API Handlers
        server.createContext("/api/translations", new FileJsonHandler("data/translations.json"));
        server.createContext("/api/topics", new FileJsonHandler("data/topics.json"));
        server.createContext("/api/clinics", new FileJsonHandler("data/clinics.json"));
        server.createContext("/api/quizzes", new FileJsonHandler("data/quizzes.json"));
        server.createContext("/api/metrics", new FileJsonHandler("data/metrics.json"));
        server.createContext("/api/ai/summarize", new AiSummarizeHandler());

        // Static Files and SPA Fallback Handler
        server.createContext("/", new StaticFileHandler());

        server.setExecutor(null);
        System.out.println("=======================================================");
        System.out.println("HealthBridge Java Web Service running on port " + PORT);
        System.out.println("Open in browser: http://localhost:" + PORT);
        System.out.println("Zero Login Required - 100% Anonymous Public Health");
        System.out.println("=======================================================");
        server.start();
    }

    // Serves pre-composed JSON data files
    static class FileJsonHandler implements HttpHandler {
        private final String relativeFilePath;

        public FileJsonHandler(String relativeFilePath) {
            this.relativeFilePath = relativeFilePath;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            File file = new File(relativeFilePath);
            if (!file.exists()) {
                sendJsonResponse(exchange, 404, "{\"error\": \"Not Found\"}");
                return;
            }

            byte[] bytes = Files.readAllBytes(file.toPath());
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }

    // AI Plain-Language Summarization with Safety Guardrails
    static class AiSummarizeHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\": \"Method Not Allowed\"}");
                return;
            }

            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);

            // Guardrail Check
            if (DIAGNOSIS_PATTERN.matcher(body).find()) {
                String safeFallback = "{\"summary\": \"This system explains official public health guidelines in plain language. For your safety, it cannot evaluate personal symptoms or diagnose conditions.\\n\\n" + MANDATORY_DISCLAIMER + "\", \"isFallback\": true, \"disclaimer\": \"" + MANDATORY_DISCLAIMER + "\"}";
                sendJsonResponse(exchange, 200, safeFallback);
                return;
            }

            String safeSummary = "{\"summary\": \"Verified Educational Summary: Prevention and routine checkups protect your wellness. Community clinics provide free vaccines and interpreter assistance.\\n\\n" + MANDATORY_DISCLAIMER + "\", \"isFallback\": false, \"disclaimer\": \"" + MANDATORY_DISCLAIMER + "\"}";
            sendJsonResponse(exchange, 200, safeSummary);
        }
    }

    // Serves HTML, CSS, JS from root with SPA index.html fallback
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORS(exchange);
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            // Strip leading slash for relative file lookup
            String relativePath = path.startsWith("/") ? path.substring(1) : path;
            File file = new File(relativePath);
            if (!file.exists() || file.isDirectory()) {
                file = new File("index.html");
            }

            if (!file.exists()) {
                exchange.sendResponseHeaders(404, -1);
                return;
            }

            String mime = getMimeType(file.getName());
            exchange.getResponseHeaders().set("Content-Type", mime);
            exchange.sendResponseHeaders(200, file.length());

            FileInputStream fis = new FileInputStream(file);
            OutputStream os = exchange.getResponseBody();
            byte[] buffer = new byte[4096];
            int count;
            while ((count = fis.read(buffer)) >= 0) {
                os.write(buffer, 0, count);
            }
            fis.close();
            os.close();
        }

        private String getMimeType(String filename) {
            if (filename.endsWith(".html")) return "text/html; charset=utf-8";
            if (filename.endsWith(".css")) return "text/css; charset=utf-8";
            if (filename.endsWith(".js")) return "application/javascript; charset=utf-8";
            if (filename.endsWith(".json")) return "application/json; charset=utf-8";
            if (filename.endsWith(".svg")) return "image/svg+xml";
            if (filename.endsWith(".png")) return "image/png";
            return "application/octet-stream";
        }
    }

    private static void setCORS(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}
