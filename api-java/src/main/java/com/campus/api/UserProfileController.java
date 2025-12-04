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

    // ==============================
    // 1) 내 프로필 조회
    // ==============================
    @GetMapping("/me")
    public ProfileResponse me(
            @RequestHeader("X-USER-ID") Long userId
    ) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        return ProfileResponse.from(u);
    }

    // ==============================
    // 2) 내 프로필 수정
    // ==============================
    @PutMapping("/me")
    public ProfileResponse updateProfile(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestBody ProfileUpdateRequest req
    ) {
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
        if (req.personalEmail != null) {
            u.setPersonalEmail(req.personalEmail);
        }

        User saved = userRepo.save(u);
        return ProfileResponse.from(saved);
    }

    // ==============================
    // 3) 다른 유저 프로필 조회
    // ==============================
    @GetMapping("/{id}")
    public ProfileResponse getUserById(@PathVariable Long id) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
        return ProfileResponse.from(u);
    }

    // ==============================
    // DTO
    // ==============================

    public static class ProfileResponse {
        public Long id;
        public String email;
        public String nickname;
        public String bio;
        public String profileImageUrl;
        public String personalEmail;

        public static ProfileResponse from(User u) {
            ProfileResponse r = new ProfileResponse();
            r.id = u.getId();
            r.email = u.getEmail();
            r.nickname = u.getNickname();
            r.bio = u.getBio();
            r.profileImageUrl = u.getProfileImageUrl();
            r.personalEmail = u.getPersonalEmail();
            return r;
        }
    }

    public static class ProfileUpdateRequest {
        public String nickname;
        public String bio;
        public String profileImageUrl;
        public String personalEmail;
    }
}
