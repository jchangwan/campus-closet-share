package com.campus.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    // 허용할 학교 도메인
    private static final String SCHOOL_DOMAIN = "@kyonggi.ac.kr";

    private final UserRepository userRepo;

    public AuthController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // ==============================
    // 1) 회원가입
    // ==============================
    @PostMapping("/signup")
    public UserResponse signup(@RequestBody SignupRequest req) {

        if (req.email == null || req.email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이메일을 입력해주세요.");
        }
        if (req.password == null || req.password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비밀번호를 입력해주세요.");
        }
        if (req.nickname == null || req.nickname.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "닉네임을 입력해주세요.");
        }

        String email = req.email.trim().toLowerCase();

        // 경기대 이메일 도메인 체크
        if (!email.endsWith(SCHOOL_DOMAIN)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "경기대학교 이메일(" + SCHOOL_DOMAIN + ")만 회원가입할 수 있습니다."
            );
        }

        // 중복 이메일 체크
        if (userRepo.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 가입된 이메일입니다."
            );
        }

        // User 생성/저장
        User user = new User();
        user.setEmail(email);
        user.setPassword(req.password);  // 데모용: 나중에 반드시 암호화 필요
        user.setNickname(req.nickname.trim());
        user.setBio("");
        user.setProfileImageUrl(null);

        User saved = userRepo.save(user);
        return new UserResponse(saved);
    }

    // ==============================
    // 2) 로그인
    // ==============================
    @PostMapping("/login")
    public UserResponse login(@RequestBody LoginRequest req) {

        if (req.email == null || req.email.isBlank()
                || req.password == null || req.password.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이메일과 비밀번호를 모두 입력해주세요."
            );
        }

        String email = req.email.trim().toLowerCase();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "이메일 또는 비밀번호가 올바르지 않습니다."
                ));

        if (!user.getPassword().equals(req.password)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "이메일 또는 비밀번호가 올바르지 않습니다."
            );
        }

        return new UserResponse(user);
    }

    // ==============================
    // DTO
    // ==============================

    // 회원가입 요청 DTO
    public static class SignupRequest {
        public String email;     // 전체 이메일 (예: student@kyonggi.ac.kr)
        public String password;
        public String nickname;
    }

    // 로그인 요청 DTO
    public static class LoginRequest {
        public String email;
        public String password;
    }

    // 응답 DTO (비밀번호 제거)
    public static class UserResponse {
        public Long id;
        public String email;
        public String nickname;
        public String profileImageUrl;

        public UserResponse(User u) {
            this.id = u.getId();
            this.email = u.getEmail();
            this.nickname = u.getNickname();
            this.profileImageUrl = u.getProfileImageUrl();
        }
    }
}
