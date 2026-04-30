# ĐÂY LÀ MODEL BUILD CHUẨN ĐÃ ĐƯỢC KIỂM CHỨNG TỐI ƯU HOÁ CACHE

FROM node:25.5.0-alpine as BUILD

# Create app directory
WORKDIR /app


# Install app dependencies => Cài đặt node modules
COPY package*.json ./


RUN npm install

# Bundle app source => Copy toàn bộ file qua folder app TRỪ các file đã được liệt kê trong .dockerignore
# COPY lắng nghe sự thay đổi code => Nếu có thay đổi code
COPY . .

# Build app => Biên dịch code TypeScript sang JavaScript (CHẠY TRONG LÚC BUILD, KHÔNG PHẢI LÚC CHẠY CONTAINER)
RUN npm run build

# Chỉ chạy Node Module
RUN npm prune --production

# CMD: Lệnh chạy khi container start => USER CLICK nút start trong Docker Desktop, hoặc chạy lệnh docker run
CMD ["node", "dist/main"]

# Size 2.79 GB => TỐI ƯU HOÁ DUNG LƯỢNG BẰNG CÁCH SỬ DỤNG IMAGE CÓ ALPINE (NHỎ HƠN NHIỀU SO VỚI IMAGE CHÍNH THỨC CỦA NODE)
# 1.41 GB => Kết quả chạy lần 2 (đã cache node modules)
# Cài đặt theo Stage



FROM node:25.5.0-alpine
#  Qua mỗi phân vùng có 1 đường kẻ

WORKDIR /app

# Chỉ copy file cần thiết để chạy ứng dụng => Copy file đã được build từ stage BUILD qua stage này
COPY --from=BUILD ./app/dist ./dist
COPY --from=BUILD ./app/node_modules ./node_modules

CMD ["node", "dist/src/main"]