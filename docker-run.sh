#!/bin/bash

# ShareBin Docker Run Script

echo "ShareBin Docker Başlatılıyor..."

# Çalışan container'ı kontrol et
if [ "$(docker ps -q -f name=sharebin)" ]; then
    echo "ShareBin zaten çalışıyor. Önce durduruluyor..."
    docker-compose down
fi

# Uygulamayı başlat
docker-compose up -d

echo "ShareBin başarıyla başlatıldı!"
echo "Uygulamaya http://localhost:3000 adresinden erişebilirsiniz."
