# ShareBin Docker Kurulumu

Bu belge, ShareBin uygulamasını Docker kullanarak nasıl çalıştıracağınızı açıklar.

## Gereksinimler

- Docker
- Docker Compose
- Vercel Blob için bir API anahtarı

## Kurulum

1. Öncelikle, `.env` dosyasını oluşturun ve gerekli değişkenleri ayarlayın:

\`\`\`bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
\`\`\`

2. Docker Compose ile uygulamayı başlatın:

\`\`\`bash
docker-compose up -d
\`\`\`

3. Uygulama http://localhost:3000 adresinde çalışacaktır.

## Notlar

- Vercel Blob token'ınızı güvenli bir şekilde saklayın.
- Üretim ortamında NEXTAUTH_SECRET değerini güçlü bir rastgele dize ile değiştirin.
- Uygulamayı durdurma:

\`\`\`bash
docker-compose down
\`\`\`

## Sorun Giderme

- Eğer "Error: EACCES: permission denied" hatası alırsanız, data dizininin izinlerini kontrol edin:

\`\`\`bash
chmod -R 777 ./data
\`\`\`

- Eğer bağlantı sorunları yaşıyorsanız, Docker ağ ayarlarınızı kontrol edin.
\`\`\`

## 3. Hata İşleme İyileştirmeleri için Yardımcı Bileşenler
