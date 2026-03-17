### Giải thích cú pháp

| Thành phần | Ý nghĩa |
| --- | --- |
| **`uvicorn`** | Là trình máy chủ ASGI (Asynchronous Server Gateway Interface). Nó đóng vai trò là "người vận chuyển" giúp mã Python của bạn có thể giao tiếp với trình duyệt web. |
| **`main:app`** | Chỉ định vị trí ứng dụng: <br>

<br> • `main`: Là tên tệp Python của bạn (`main.py`). <br>

<br> • `app`: Là tên biến (object) đại diện cho ứng dụng bên trong tệp đó (ví dụ: `app = FastAPI()`). |
| **`--reload`** | Chế độ **tự động tải lại**. Mỗi khi bạn nhấn `Ctrl + S` để lưu code, server sẽ tự khởi động lại mà bạn không cần chạy lại lệnh thủ công. Rất hữu ích khi đang code. |
| **`--port 8000`** | Chỉ định cổng (port) mà server sẽ lắng nghe. Ở đây là cổng `8000`. Nếu cổng này bị chiếm, bạn có thể đổi thành `8080`, `5000`, v.v. |

---

### Luồng hoạt động của lệnh

Khi bạn chạy lệnh này, một chu trình sẽ diễn ra như sau:

1. **Khởi tạo:** Uvicorn tìm đến file `main.py` và nạp biến `app`.
2. **Lắng nghe:** Nó mở một cổng kết nối tại địa chỉ `http://127.0.0.1:8000`.
3. **Xử lý:** Khi bạn truy cập địa chỉ đó trên trình duyệt, Uvicorn nhận yêu cầu và chuyển cho FastAPI xử lý mã logic của bạn.
4. **Giám sát:** Nhờ có `--reload`, Uvicorn liên tục theo dõi các thay đổi trong tệp tin để cập nhật ngay lập tức.

### Lưu ý quan trọng

* **Môi trường:** Đừng bao giờ dùng `--reload` khi triển khai sản phẩm thực tế (Production). Nó làm giảm hiệu năng và có thể gây bảo mật.
* **Tên tệp:** Nếu tệp của bạn tên là `server.py`, bạn phải sửa lệnh thành `uvicorn server:app --reload`.