package com.academy.MCAcademy.service;

import com.academy.MCAcademy.entity.Course;
import com.academy.MCAcademy.entity.File;
import com.academy.MCAcademy.repository.CourseRepository;
import com.academy.MCAcademy.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class FileService {

    private final FileRepository fileRepository;

    private final CourseRepository courseRepository;

    public List<File> createImages(List<MultipartFile> multipartFiles) throws IOException {
        List<File> savedFiles = new ArrayList<>();

        for (MultipartFile multipartFile : multipartFiles) {
            if (!isImage(multipartFile.getOriginalFilename())) {
                throw new RuntimeException("File " + multipartFile.getOriginalFilename() + " is not an image!");
            }
        }

        for (MultipartFile multipartFile : multipartFiles) {
            String fileExtension = getFileExtension(multipartFile.getOriginalFilename());
            String uniqueFileName = "image_" + UUID.randomUUID().toString() + fileExtension;

            File newFile = File
                    .builder()
                    .name(uniqueFileName)
                    .type("image")
                    .fileData(multipartFile.getBytes())
                    .build();

            savedFiles.add(fileRepository.save(newFile));
        }

        return savedFiles;
    }

    public List<File> createVideos(List<MultipartFile> multipartFiles) throws IOException {
        List<File> savedFiles = new ArrayList<>();

        for (MultipartFile multipartFile : multipartFiles) {
            if (!isVideo(multipartFile.getOriginalFilename())) {
                throw new RuntimeException("File " + multipartFile.getOriginalFilename() + " is not a video!");
            }
        }

        for (MultipartFile multipartFile : multipartFiles) {
            String fileExtension = getFileExtension(multipartFile.getOriginalFilename());
            String uniqueFileName = "video_" + UUID.randomUUID().toString() + fileExtension;

            File newFile = File
                    .builder()
                    .name(uniqueFileName)
                    .type("video")
                    .fileData(multipartFile.getBytes())
                    .build();

            File existingFile = fileRepository.findByName(multipartFile.getOriginalFilename());
            if (existingFile == null) {
                savedFiles.add(fileRepository.save(newFile));
            } else {
                throw new RuntimeException("This file already exists with the name: " + multipartFile.getOriginalFilename());
            }
        }

        return savedFiles;
    }

    public void deleteFileFromCourse(Long fileId, Long courseId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("The file with this id doesn't exist!"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("The course with this id doesn't exist!"));

        if (file.getType().equals("image")) {
            course.getImages().removeIf(image -> image.getId().equals(fileId));
            fileRepository.delete(file);
        }

        if (file.getType().equals("video")) {
            course.getVideos().removeIf(video -> video.getId().equals(fileId));
            fileRepository.delete(file);
        }

        courseRepository.save(course);
    }

    public void deleteFile(Long fileId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("The file with this id doesn't exist!"));

        fileRepository.delete(file);
    }

    public byte[] getFile(String fileName) {
        return fileRepository.findByName(fileName).getFileData();
    }

    public boolean isImage(String filename) {
        String[] imageExtensions = {".jpg", ".jpeg", ".png"};
        for (String ext : imageExtensions) {
            if (filename.toLowerCase().endsWith(ext)) {
                return true;
            }
        }
        return false;
    }

    public boolean isVideo(String filename) {
        String[] videoExtensions = {".mp4", ".avi", ".mov", ".mkv", ".flv"};
        for (String ext : videoExtensions) {
            if (filename.toLowerCase().endsWith(ext)) {
                return true;
            }
        }
        return false;
    }

    public List<File> getAllImages() {
        List<File> allFiles = fileRepository.findAll();
        List<File> filteredFiles = new ArrayList<>();

        for (File file : allFiles) {
            if (isImage(file.getName())) {
                filteredFiles.add(file);
            }
        }

        return filteredFiles;
    }

    private String getFileExtension(String fileName) {
        return fileName.substring(fileName.lastIndexOf("."));
    }
}
