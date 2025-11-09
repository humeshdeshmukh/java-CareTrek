package com.caretrek.model;

import com.caretrek.model.enums.Role;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(unique = true)
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    private Set<Role> roles = new HashSet<>();
    
    private String profileImageUrl;
    
    private boolean active = true;
    
    // Senior-specific fields
    private String seniorId; // 4-digit ID for linking
    private String emergencyContact;
    private String medicalConditions;
    private String medications;
    
    // Family member specific
    @ManyToMany
    @JoinTable(
        name = "senior_family_links",
        joinColumns = @JoinColumn(name = "family_member_id"),
        inverseJoinColumns = @JoinColumn(name = "senior_id")
    )
    private Set<User> linkedSeniors = new HashSet<>();
    
    // For seniors to track their family members
    @ManyToMany(mappedBy = "linkedSeniors")
    private Set<User> familyMembers = new HashSet<>();
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public boolean isSenior() {
        return roles.contains(Role.ROLE_SENIOR);
    }
    
    public boolean isFamilyMember() {
        return roles.contains(Role.ROLE_FAMILY);
    }
}
