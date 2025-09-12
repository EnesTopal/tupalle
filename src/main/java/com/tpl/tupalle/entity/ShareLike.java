package com.tpl.tupalle.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(
        name = "share_likes",
        uniqueConstraints = @UniqueConstraint(name = "uk_share_like", columnNames = {"share_id","user_id"})
)
public class ShareLike {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "share_id")
    private Share share;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // getters/setters
    public UUID getId() { return id; }
    public Share getShare() { return share; }
    public void setShare(Share share) { this.share = share; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
