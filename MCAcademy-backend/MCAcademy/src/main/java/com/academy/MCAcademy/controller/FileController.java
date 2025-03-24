package com.academy.MCAcademy.controller;

import com.academy.MCAcademy.entity.File;
import com.academy.MCAcademy.service.FileService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/file")
@CrossOrigin(origins = "http://localhost:5173")
public class FileController {

    @Autowired
    private final FileService fileService;

    @PostMapping("/create-image")
    public ResponseEntity<?> createImages(@RequestParam("file") List<MultipartFile> multipartFiles) throws IOException {
        return ResponseEntity.ok(fileService.createImages(multipartFiles));
    }

    @PostMapping("/create-video")
    public ResponseEntity<?> createVideos(@RequestParam("file") List<MultipartFile> multipartFiles) throws IOException {
        return ResponseEntity.ok(fileService.createVideos(multipartFiles));
    }

    @DeleteMapping("/delete/{fileId}")
    public ResponseEntity<String> deleteFile(@PathVariable Long fileId) {
        try {
            fileService.deleteFile(fileId);
            return ResponseEntity.ok("File deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found");
        }
    }

    @DeleteMapping("/delete/{fileId}/{courseId}")
    public ResponseEntity<String> deleteFileFromCourse(@PathVariable Long fileId,
                                             @PathVariable Long courseId) {
        try {
            fileService.deleteFileFromCourse(fileId, courseId);
            return ResponseEntity.ok("File deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found");
        }
    }

    @GetMapping("/file/{fileName}")
    public ResponseEntity<byte[]> getFile(@PathVariable String fileName) {
        byte[] fileData = fileService.getFile(fileName);

        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(fileData);
    }

    @GetMapping("/files")
    public List<File> getFiles() {
        return fileService.getAllImages();
    }
}
