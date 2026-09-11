package com.backend.user.repo;

import com.backend.user.entity.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserDeviceRepo
        extends JpaRepository<UserDevice, Long> {

    Optional<UserDevice> findByUserIdAndDeviceId(
            Long userId,
            String deviceId
    );

    boolean existsByUserIdAndDeviceId(
            Long userId,
            String deviceId
    );

    List<UserDevice> findAllByUserId(Long userId);
}