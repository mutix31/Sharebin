#!/bin/bash

# ShareBin Docker Build Script

echo "ShareBin Docker Build Başlatılıyor..."

# Gerekli dizinleri oluştur
mkdir -p data

# Docker imajını oluştur
docker build -t sharebin:latest .

echo "Docker imajı başarıyla oluşturuldu: sharebin:latest"
echo "Uygulamayı başlatmak için: docker-compose up -d"
