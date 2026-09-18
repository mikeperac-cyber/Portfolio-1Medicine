import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.zip.GZIPOutputStream;

/** Dependency-free, file-backed demo alternative. Use Node for persistent REST writes. */
public class HealthWebService {
    private static final Path ROOT = Path.of(System.getenv().getOrDefault("WEB_ROOT",
        Files.exists(Path.of("dist/index.html")) ? "dist" : ".")).toAbsolutePath().normalize();
    private static final Map<String, long[]> LIMITS = new ConcurrentHashMap<>();
    private static final String CSP = "default-src 'self'; script-src 'self'; script-src-attr 'none'; "
        + "style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; "
        + "base-uri 'self'; form-action 'self'; frame-ancestors 'self'";

    public static void main(String[] args) throws IOException {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "3000"));
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 64);
        server.createContext("/", HealthWebService::handle);
        server.setExecutor(Executors.newFixedThreadPool(8));
        server.start();
        System.out.println("HealthBridge Java demo listening on " + port);
    }

    private static void handle(HttpExchange exchange) throws IOException {
        long started = System.nanoTime();
        String requestPath = exchange.getRequestURI().getPath();
        var headers = exchange.getResponseHeaders();
        headers.set("X-Content-Type-Options", "nosniff");
        headers.set("X-Frame-Options", "SAMEORIGIN");
        headers.set("Referrer-Policy", "no-referrer");
        headers.set("Content-Security-Policy", CSP);
        headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        try {
            if (requestPath.startsWith("/api/")) {
                long now = System.currentTimeMillis();
                LIMITS.entrySet().removeIf(entry -> entry.getValue()[1] < now);
                String address = exchange.getRemoteAddress().getAddress().getHostAddress();
                if (LIMITS.size() >= 10000 && !LIMITS.containsKey(address)) { json(exchange, 503, "Server busy"); return; }
                long[] limit = LIMITS.computeIfAbsent(address, key -> new long[]{0, now + 60000});
                synchronized (limit) {
                    if (++limit[0] > 300) { headers.set("Retry-After", "60"); json(exchange, 429, "Too many requests"); return; }
                }
                if (requestPath.equals("/api/ai/summarize")) {
                    if (!exchange.getRequestMethod().equals("POST")) { headers.set("Allow", "POST"); json(exchange, 405, "Method not allowed"); return; }
                    String origin = exchange.getRequestHeaders().getFirst("Origin");
                    if ((origin != null && !origin.equals("http://" + exchange.getRequestHeaders().getFirst("Host"))
                        && !origin.equals("https://" + exchange.getRequestHeaders().getFirst("Host")))
                        || "cross-site".equals(exchange.getRequestHeaders().getFirst("Sec-Fetch-Site"))) { json(exchange, 403, "Cross-site submission rejected"); return; }
                    String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
                    if (contentType == null || !contentType.toLowerCase().startsWith("application/json")) { json(exchange, 415, "Expected JSON"); return; }
                    byte[] body = exchange.getRequestBody().readNBytes(32769);
                    if (body.length > 32768) { json(exchange, 413, "Body too large"); return; }
                    // This reference backend always declines personal medical advice and never echoes input.
                    send(exchange, 200, ("{\"summary\":\"This demo explains public health guidelines only. It cannot evaluate symptoms, "
                        + "diagnose conditions, or recommend medication dosages. Educational only; not medical advice.\","
                        + "\"isFallback\":true,\"citations\":[],\"disclaimer\":\"Educational only; not medical advice.\"}").getBytes(StandardCharsets.UTF_8), "application/json; charset=utf-8", "no-store");
                    return;
                }
                if (!readMethod(exchange)) return;
                String name = requestPath.substring(5).split("/")[0];
                if (!java.util.Set.of("topics", "translations", "clinics", "quizzes", "metrics").contains(name)) { json(exchange, 404, "API route not found"); return; }
                send(exchange, 200, Files.readAllBytes(Path.of("data", name + ".json")), "application/json; charset=utf-8", "no-cache");
                return;
            }
            if (!readMethod(exchange)) return;
            if (requestPath.equals("/")) requestPath = "/index.html";
            boolean allowed = requestPath.matches("/(index\\.html|offline\\.html|manifest\\.json|sw\\.js|icon\\.svg|icon-(192|512)\\.png)")
                || requestPath.matches("/assets/[a-zA-Z0-9.-]+\\.(css|js|svg)")
                || requestPath.matches("/css/style\\.css")
                || requestPath.matches("/js/(app|guardrails|platform)\\.js")
                || requestPath.matches("/data/(topics|clinics|quizzes|translations|metrics)\\.json");
            if (!allowed && requestPath.matches("/(en|es|tr|topics|clinics|ethics|admin)(/[a-z0-9-]+)?/?")) { requestPath = "/index.html"; allowed = true; }
            Path file = ROOT.resolve(requestPath.substring(1)).normalize();
            if (!allowed || !file.startsWith(ROOT) || !Files.isRegularFile(file) || !file.toRealPath().startsWith(ROOT.toRealPath())) { json(exchange, 404, "Not found"); return; }
            boolean versioned = requestPath.matches("/assets/.+\\.[a-f0-9]{12}\\.(css|js|svg)");
            send(exchange, 200, Files.readAllBytes(file), mime(requestPath), versioned ? "public, max-age=31536000, immutable" : "no-cache");
        } catch (Exception failure) {
            if (exchange.getResponseCode() == -1) json(exchange, 500, "Service temporarily unavailable");
        } finally {
            if (requestPath.startsWith("/api/")) System.out.println("{\"event\":\"api_request\",\"status\":" + exchange.getResponseCode() + ",\"durationMs\":" + (System.nanoTime() - started) / 1000000 + "}");
            exchange.close();
        }
    }
    private static boolean readMethod(HttpExchange exchange) throws IOException {
        if (exchange.getRequestMethod().equals("GET") || exchange.getRequestMethod().equals("HEAD")) return true;
        exchange.getResponseHeaders().set("Allow", "GET, HEAD");
        json(exchange, 405, "Method not allowed");
        return false;
    }
    private static void json(HttpExchange exchange, int status, String message) throws IOException {
        send(exchange, status, ("{\"error\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8), "application/json; charset=utf-8", "no-store");
    }
    private static String mime(String file) {
        if (file.endsWith(".html")) return "text/html; charset=utf-8";
        if (file.endsWith(".css")) return "text/css; charset=utf-8";
        if (file.endsWith(".js")) return "application/javascript; charset=utf-8";
        if (file.endsWith(".json")) return "application/json; charset=utf-8";
        if (file.endsWith(".svg")) return "image/svg+xml";
        return "image/png";
    }
    private static boolean acceptsGzip(String value) {
        if (value == null) return false;
        double wildcard = 0;
        for (String part : value.toLowerCase().split(",")) {
            String[] fields = part.trim().split(";");
            double quality = 1;
            for (int i = 1; i < fields.length; i++) {
                if (fields[i].trim().startsWith("q=")) try { quality = Double.parseDouble(fields[i].trim().substring(2)); } catch (NumberFormatException ignored) { quality = 0; }
            }
            if (fields[0].trim().equals("gzip")) return quality > 0;
            if (fields[0].trim().equals("*")) wildcard = quality;
        }
        return wildcard > 0;
    }
    private static void send(HttpExchange exchange, int status, byte[] bytes, String type, String cache) throws IOException {
        var headers = exchange.getResponseHeaders();
        headers.set("Content-Type", type);
        headers.set("Cache-Control", cache);
        headers.set("Vary", "Accept-Encoding");
        if (status == 200 && !cache.equals("no-store")) {
            try {
                String tag = "W/\"" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)) + "\"";
                headers.set("ETag", tag);
                String requested = exchange.getRequestHeaders().getFirst("If-None-Match");
                if (requested != null) for (String candidate : requested.split(",")) {
                    if (candidate.trim().equals("*") || candidate.trim().replaceFirst("^W/", "").equals(tag.substring(2))) { exchange.sendResponseHeaders(304, -1); return; }
                }
            } catch (NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
        }
        if (bytes.length >= 512 && !type.equals("image/png") && acceptsGzip(exchange.getRequestHeaders().getFirst("Accept-Encoding"))) {
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            try (GZIPOutputStream gzip = new GZIPOutputStream(buffer)) { gzip.write(bytes); }
            bytes = buffer.toByteArray();
            headers.set("Content-Encoding", "gzip");
        }
        headers.set("Content-Length", String.valueOf(bytes.length));
        if (exchange.getRequestMethod().equals("HEAD")) { exchange.sendResponseHeaders(status, -1); return; }
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
    }
}
