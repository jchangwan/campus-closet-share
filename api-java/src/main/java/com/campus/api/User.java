package com.campus.api;

import jakarta.persistence.*;

@Entity
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 191)
    private String email;          // ex) aaa@kyonggi.ac.kr

    @Column(nullable = false, length = 50)
    private String name;           // 닉네임 또는 이름

    protected User() {}            // JPA용 기본 생성자

    public User(String email, String name) {
        this.email = email;
        this.name = name;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }

    public void setEmail(String email) { this.email = email; }
    public void setName(String name) { this.name = name; }
}
