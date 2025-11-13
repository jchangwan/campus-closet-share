import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final Set<String> registeredEmails = new HashSet<>();
    private final List<User> users = new ArrayList<>();

    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @RequestParam String emailLocalPart,
            @RequestParam String password) {

        String fullEmail = emailLocalPart + "@kyonggi.ac.kr";

        if (registeredEmails.contains(fullEmail)) {
            return ResponseEntity.status(409).body("duplicate email: " + fullEmail);
        }

        registeredEmails.add(fullEmail);
        users.add(new User(fullEmail, password));

        return ResponseEntity.ok("registered: " + fullEmail);
    }
}