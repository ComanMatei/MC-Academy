package com.academy.MCAcademy.repository;

import com.academy.MCAcademy.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<File, Long> {

    File findByName(String name);

    List<File> findAllByType (String type);
}
