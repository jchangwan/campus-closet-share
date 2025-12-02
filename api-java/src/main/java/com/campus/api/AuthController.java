package com.campus.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepo;

    public AuthController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // === 회원가입 ===
    @PostMapping("/signup")
    public User signup(@RequestBody SignupRequest req) {

        // 이미 가입된 이메일인지 체크
        if (userRepo.existsByEmail(req.email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        // 새 User 엔티티 생성
        User user = new User();
        user.setEmail(req.email);
        user.setPassword(req.password);   // 데모용: 나중엔 반드시 암호화 필요
        user.setNickname(req.nickname);
        // bio, profileImageUrl 같은 필드는 엔티티에 맞춰서 기본값 설정
        user.setBio("");
        user.setProfileImageUrl(null);

        // createdAt / updatedAt 은 User 엔티티의 @PrePersist 가 알아서 넣도록 그냥 둔다
        return userRepo.save(user);
    }

    // === 로그인 ===
    @PostMapping("/login")
    public User login(@RequestBody LoginRequest req) {

        User user = userRepo.findByEmail(req.email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        if (!user.getPassword().equals(req.password)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        // 지금은 데모라서 그냥 User 전체를 반환
        // (실서비스라면 토큰이나 일부 정보만 응답하는 게 좋음)
        return user;
    }

    // ====== 요청 DTO ======

    // lombok @Data 안 쓰고, 그냥 public 필드만 둔 간단 DTO
    public static class SignupRequest {
        public String email;
        public String password;
        public String nickname;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }
}
