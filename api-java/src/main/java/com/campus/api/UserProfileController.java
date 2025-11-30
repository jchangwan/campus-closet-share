package com.campus.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/users")
public class UserProfileController {

    private final UserRepository userRepo;

    public UserProfileController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // 인증 붙기 전까지는 임시로 userId = 1 고정
    private Long mockUserId() {
        return 1L;
    }

    // ===== 프로필 조회: GET /users/me =====
    @GetMapping("/me")
    public ProfileResponse me() {
        Long userId = mockUserId();

        User u = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        return ProfileResponse.from(u);
    }

    // ===== 프로필 수정: PUT /users/me =====
    @PutMapping("/me")
    public ProfileResponse updateProfile(@RequestBody ProfileUpdateRequest req) {
        Long userId = mockUserId();

        User u = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (req.nickname != null && !req.nickname.isBlank()) {
            u.setNickname(req.nickname);
        }
        if (req.bio != null) {
            u.setBio(req.bio);
        }
        if (req.profileImageUrl != null) {
            u.setProfileImageUrl(req.profileImageUrl);
        }

        User saved = userRepo.save(u);
        return ProfileResponse.from(saved);
    }

    // ===== 다른 유저 프로필 보기: GET /users/{id} (선택 기능) =====
    @GetMapping("/{id}")
    public ProfileResponse getUserById(@PathVariable Long id) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
        return ProfileResponse.from(u);
    }

    // ===== DTO =====

    public static class ProfileResponse {
        public Long id;
        public String email;
        public String nickname;
        public String bio;
        public String profileImageUrl;

        public static ProfileResponse from(User u) {
            ProfileResponse r = new ProfileResponse();
            r.id = u.getId();
            r.email = u.getEmail();
            r.nickname = u.getNickname();
            r.bio = u.getBio();
            r.profileImageUrl = u.getProfileImageUrl();
            return r;
        }
    }

    public static class ProfileUpdateRequest {
        public String nickname;
        public String bio;
        public String profileImageUrl;
    }
}
