package com.academy.MCAcademy.service;

import com.academy.MCAcademy.entity.File;
import com.academy.MCAcademy.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class FileService {

    private final FileRepository fileRepository;

    public List<File> createImages(List<MultipartFile> multipartFiles) throws IOException {
        List<File> savedFiles = new ArrayList<>();

        // Verificăm dacă toate fișierele sunt videoclipuri
        for (MultipartFile multipartFile : multipartFiles) {
            // Verificăm dacă fiecare fișier este un videoclip
            if (!isImage(multipartFile.getOriginalFilename())) {
                // Dacă găsim un fișier care nu este video, aruncăm o excepție
                throw new RuntimeException("File " + multipartFile.getOriginalFilename() + " is not an image!");
            }
        }

        for (MultipartFile multipartFile : multipartFiles) {
            File newFile = File
                    .builder()
                    .name(multipartFile.getOriginalFilename())
                    .type("image")
                    .fileData(multipartFile.getBytes())
                    .build();

            // Verifică dacă fișierul există deja
            File existingFile = fileRepository.findByName(multipartFile.getOriginalFilename());
            if (existingFile == null) {
                savedFiles.add(fileRepository.save(newFile));
            } else {
                throw new RuntimeException("This file already exists with the name: " + multipartFile.getOriginalFilename());
            }
        }

        return savedFiles;
    }

    public List<File> createVideos(List<MultipartFile> multipartFiles) throws IOException {
        List<File> savedFiles = new ArrayList<>();

        // Verificăm dacă toate fișierele sunt videoclipuri
        for (MultipartFile multipartFile : multipartFiles) {
            // Verificăm dacă fiecare fișier este un videoclip
            if (!isVideo(multipartFile.getOriginalFilename())) {
                // Dacă găsim un fișier care nu este video, aruncăm o excepție
                throw new RuntimeException("File " + multipartFile.getOriginalFilename() + " is not a video!");
            }
        }

        // Dacă toate fișierele sunt videoclipuri, le salvăm
        for (MultipartFile multipartFile : multipartFiles) {
            File newFile = File
                    .builder()
                    .name(multipartFile.getOriginalFilename())
                    .type("video") // Setăm tipul ca video
                    .fileData(multipartFile.getBytes())
                    .build();

            // Verifică dacă fișierul există deja în baza de date
            File existingFile = fileRepository.findByName(multipartFile.getOriginalFilename());
            if (existingFile == null) {
                savedFiles.add(fileRepository.save(newFile));
            } else {
                throw new RuntimeException("This file already exists with the name: " + multipartFile.getOriginalFilename());
            }
        }

        return savedFiles;
    }

    public List<File> getFilesByIds(List<Long> fileIds, String fileType) {
        // Obținem toate fișierele folosind ID-urile
        List<File> files = fileRepository.findAllById(fileIds);

        // Filtrăm fișierele pe baza tipului (image sau video)
        return files.stream()
                .filter(file -> file.getType().equalsIgnoreCase(fileType))  // Filtrăm pe baza tipului
                .collect(Collectors.toList());
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
        // Obține toate fișierele din baza de date
        List<File> allFiles = fileRepository.findAll();
        List<File> filteredFiles = new ArrayList<>();

        // Iterează prin toate fișierele și adaugă-le la lista filtrată dacă sunt imagini
        for (File file : allFiles) {
            // Folosește metoda isImage pentru a verifica dacă fișierul este o imagine
            if (isImage(file.getName())) {
                filteredFiles.add(file);
                System.out.println("Imagine găsită: " + file.getName());  // Afișează numele fișierului
            }
        }

        return filteredFiles;
    }
}
