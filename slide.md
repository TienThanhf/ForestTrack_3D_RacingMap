# Slide 1: Tên đồ án + thông tin sinh viên/nhóm

- **Tên đề tài:** Mô phỏng bản đồ đua xe 3D bằng Three.js/WebGL
- **Môn học:** Đồ họa máy tính
- **Họ tên sinh viên / nhóm:** [Điền tên sinh viên hoặc tên nhóm]
- **MSSV:** [Điền MSSV]
- **Lớp:** [Điền lớp]
- **Giảng viên hướng dẫn:** [Điền tên giảng viên hướng dẫn]

**Ghi chú thuyết trình:**

- Giới thiệu ngắn gọn tên đề tài và mục đích chung của đồ án.
- Nêu đây là một chương trình đồ họa 3D tương tác, được xây dựng bằng Three.js và WebGL.
- Trình bày thông tin nhóm/sinh viên trước khi đi vào nội dung kỹ thuật.

# Slide 2: Mục tiêu đồ án

- Xây dựng chương trình đồ họa 3D có khả năng tương tác.
- Áp dụng các kỹ thuật đồ họa 3D đã học trong môn học.
- Vẽ và hiển thị các đối tượng 3D cơ bản.
- Load model 3D có sẵn từ file.
- Điều khiển camera và phép chiếu phối cảnh.
- Áp dụng phép biến đổi Affine lên đối tượng.
- Cài đặt chiếu sáng, bóng đổ và texture mapping.
- Thêm animation và tương tác với người dùng.

**Ghi chú thuyết trình:**

- Nhấn mạnh mục tiêu chính là minh họa các kiến thức đồ họa máy tính thông qua một scene 3D hoàn chỉnh.
- Giải thích rằng chương trình không chỉ có yếu tố đua xe, mà còn là môi trường để demo nhiều kỹ thuật như camera, ánh sáng, bóng đổ, texture và animation.
- Có thể nói ngắn gọn rằng mỗi chức năng trong chương trình đều gắn với một yêu cầu kỹ thuật của môn học.

# Slide 3: Ý tưởng chương trình

- Chương trình mô phỏng một bản đồ đua xe 3D theo phong cách low-poly/cartoon.
- Người dùng có thể quan sát bản đồ ở chế độ khám phá hoặc điều khiển xe ở chế độ đua.
- Scene gồm đường đua, xe, hàng rào, đèn đường, cổng xuất phát, môi trường xung quanh và các model 3D được import.
- Người dùng có thể chuyển đổi chế độ ngày/đêm, góc nhìn camera và các chế độ demo kỹ thuật đồ họa.
- Chương trình không chỉ là demo đua xe mà còn dùng để minh họa các kỹ thuật đồ họa 3D trong môn học.

**Ghi chú thuyết trình:**

- Mô tả bối cảnh chương trình như một đường đua nhỏ trong khu rừng 3D.
- Giải thích sự khác nhau giữa chế độ khám phá và chế độ đua.
- Nhấn mạnh việc kết hợp giữa yếu tố trực quan của game đua xe và mục tiêu học thuật của môn Đồ họa máy tính.

# Slide 4: Các chức năng chính của chương trình

- **Vẽ các khối hình cơ bản:** hình hộp, hình cầu, hình nón, hình trụ, bánh xe, ấm trà và một số đối tượng mở rộng.
- **Load model 3D:** import model từ file `.glb` hoặc `.gltf` để đưa vào scene.
- **Chế độ vẽ đối tượng:** cho phép hiển thị đối tượng theo Point, Lines hoặc Solid.
- **Điều khiển camera phối cảnh:** thay đổi vị trí camera và các tham số như `near`, `far`.
- **Phép biến đổi Affine:** tịnh tiến, quay và co giãn đối tượng được chọn.
- **Hệ thống chiếu sáng:** gồm ánh sáng môi trường, ánh sáng có hướng, ánh sáng điểm và ánh sáng chiếu tập trung.
- **Bóng đổ:** hiển thị bóng của vật thể lên mặt đường hoặc mặt đất.
- **Texture mapping:** dùng ảnh bitmap để dán lên bề mặt vật thể.
- **Animation:** xe di chuyển, bánh xe quay, camera bám theo xe và hiệu ứng môi trường.
- **Tương tác người dùng:** điều khiển bằng bàn phím, chuột và giao diện điều khiển.

**Ghi chú thuyết trình:**

- Trình bày slide này như phần tổng hợp các chức năng quan trọng nhất.
- Khi demo, có thể liên hệ từng chức năng với hình ảnh trực tiếp trên chương trình.
- Nên nhấn mạnh các chức năng đáp ứng yêu cầu kỹ thuật: primitive, model loading, camera, transform, lighting, shadow, texture và animation.

# Slide 5: Giới thiệu các kỹ thuật đồ họa sử dụng

- **Phép chiếu phối cảnh:** giúp tạo cảm giác xa gần trong không gian 3D, làm scene có chiều sâu giống quan sát thực tế.
- **Phép biến đổi Affine:** dùng để tịnh tiến, quay và thay đổi kích thước đối tượng trong không gian.
- **Chiếu sáng:** sử dụng ánh sáng môi trường, ánh sáng có hướng, ánh sáng điểm và ánh sáng chiếu để làm scene rõ ràng, sinh động hơn.
- **Bóng đổ:** giúp vật thể có chiều sâu và liên kết tốt hơn với mặt đất hoặc mặt đường.
- **Texture mapping:** dùng ảnh 2D dán lên bề mặt vật thể 3D để tăng độ trực quan.
- **Load model:** đưa các model 3D có sẵn vào scene, ví dụ như model xe hoặc các đối tượng trang trí.
- **Animation loop:** cập nhật chuyển động, camera và hiệu ứng theo từng khung hình để tạo cảm giác liên tục.

**Ghi chú thuyết trình:**

- Giải thích mỗi kỹ thuật bằng ngôn ngữ đơn giản, tránh đi quá sâu vào công thức.
- Có thể lấy ví dụ trực tiếp: camera tạo phối cảnh, xe dùng animation, mặt đường dùng texture, đèn tạo bóng.
- Nhấn mạnh rằng các kỹ thuật này phối hợp với nhau để tạo nên một scene 3D hoàn chỉnh.

# Slide 6: Demo chương trình

- Mở chương trình trên trình duyệt.
- Giới thiệu tổng quan bản đồ đua xe 3D.
- Chuyển giữa chế độ khám phá và chế độ đua.
- Điều khiển xe di chuyển, rẽ trái/phải, tăng tốc/phanh.
- Quan sát bánh xe quay và camera bám theo xe.
- Chuyển đổi chế độ ngày/đêm để thấy sự thay đổi ánh sáng.
- Quan sát bóng đổ trên mặt đường hoặc mặt đất.
- Thử chuyển chế độ vẽ Point, Lines, Solid.
- Thử biến đổi Affine trên đối tượng demo.
- Thử áp texture bitmap lên một đối tượng.
- Chỉ ra các model 3D được load từ file.

**Ghi chú thuyết trình:**

- Demo nên đi theo thứ tự từ tổng quan đến kỹ thuật chi tiết.
- Bắt đầu bằng việc xoay camera để người xem thấy toàn bộ scene.
- Sau đó chuyển sang Race Mode để minh họa điều khiển xe, animation và camera follow.
- Cuối cùng quay lại các chức năng demo kỹ thuật như render mode, Affine transform và texture mapping.

# Slide 7: Kết quả, hạn chế và hướng phát triển

## Kết quả đạt được

- Xây dựng được scene đua xe 3D có khả năng tương tác.
- Cài đặt được các kỹ thuật đồ họa 3D theo yêu cầu.
- Có hệ thống camera, ánh sáng, bóng đổ, texture, model và animation.
- Giao diện demo trực quan, dễ thao tác và phù hợp để trình bày.

## Hạn chế

- Va chạm vật lý còn đơn giản, chưa sử dụng physics engine đầy đủ.
- Một số model và texture có thể cần tối ưu thêm.
- Bóng đổ và ánh sáng có thể ảnh hưởng đến hiệu năng trên máy yếu.
- Gameplay đua xe còn ở mức cơ bản, chủ yếu phục vụ mục tiêu minh họa đồ họa 3D.

## Hướng phát triển

- Cải thiện va chạm vật lý bằng thư viện như cannon-es.
- Thêm AI car, checkpoint, lap timing và hệ thống tính điểm.
- Nâng cấp bản đồ với nhiều model và chi tiết môi trường hơn.
- Tối ưu hiệu năng để chương trình chạy mượt hơn.
- Thêm vật liệu, ánh sáng và hiệu ứng hậu kỳ chân thực hơn.

**Ghi chú thuyết trình:**

- Tổng kết những gì chương trình đã làm được so với mục tiêu ban đầu.
- Trình bày hạn chế một cách ngắn gọn, tập trung vào các điểm còn có thể cải thiện.
- Kết thúc bằng hướng phát triển để cho thấy đồ án có khả năng mở rộng trong tương lai.

# Bản rút gọn cho PowerPoint

## Slide 1: Thông tin đồ án

- Mô phỏng bản đồ đua xe 3D bằng Three.js/WebGL
- Môn học: Đồ họa máy tính
- Sinh viên/Nhóm: [Điền tên sinh viên hoặc tên nhóm]
- MSSV, lớp, giảng viên: [Điền thông tin]

## Slide 2: Mục tiêu đồ án

- Xây dựng chương trình đồ họa 3D tương tác.
- Áp dụng các kỹ thuật đồ họa 3D đã học.
- Vẽ primitive, load model 3D và điều khiển camera.
- Cài đặt Affine transform, ánh sáng, bóng đổ, texture và animation.

## Slide 3: Ý tưởng chương trình

- Mô phỏng bản đồ đua xe 3D phong cách low-poly.
- Có chế độ khám phá và chế độ đua.
- Scene gồm đường đua, xe, hàng rào, đèn, cổng xuất phát và môi trường xung quanh.
- Hỗ trợ ngày/đêm, camera và các chế độ demo kỹ thuật.

## Slide 4: Chức năng chính

- Vẽ khối cơ bản: hộp, cầu, nón, trụ, bánh xe, ấm trà.
- Load model `.glb`/`.gltf`.
- Chuyển chế độ Point, Lines, Solid.
- Camera phối cảnh, Affine transform, lighting, shadow, texture.
- Animation và tương tác bằng bàn phím, chuột, giao diện.

## Slide 5: Kỹ thuật đồ họa sử dụng

- Phép chiếu phối cảnh tạo chiều sâu.
- Affine transform: tịnh tiến, quay, co giãn.
- Chiếu sáng và bóng đổ giúp scene trực quan hơn.
- Texture mapping và load model làm đối tượng phong phú hơn.
- Animation loop cập nhật chuyển động theo từng khung hình.

## Slide 6: Demo chương trình

- Mở chương trình và giới thiệu tổng quan scene.
- Chuyển Explore Mode/Race Mode.
- Điều khiển xe, quan sát bánh xe và camera follow.
- Chuyển ngày/đêm, quan sát ánh sáng và bóng đổ.
- Demo Point/Lines/Solid, Affine transform, texture và model import.

## Slide 7: Kết quả và hướng phát triển

- Hoàn thành scene đua xe 3D có tương tác.
- Cài đặt camera, ánh sáng, bóng đổ, texture, model và animation.
- Hạn chế: va chạm còn đơn giản, hiệu năng phụ thuộc máy.
- Hướng phát triển: physics engine, AI car, checkpoint, lap timing, tối ưu hiệu năng.
