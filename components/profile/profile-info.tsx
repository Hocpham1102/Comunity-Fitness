"use client";

import { User, RotateCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// --- MỚI: Import thư viện crop ---
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css"; // Import CSS cho thư viện

// (Bạn có thể cần tạo 1 component Modal riêng, ở đây tôi dùng style inline cho đơn giản)
const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  background: "white",
  padding: "20px",
  borderRadius: "8px",
  maxWidth: "90vw",
  maxHeight: "90vh",
  overflow: "auto",
};

export default function ProfileInfo() {
  const router = useRouter();
  const { data: session } = useSession();

  // State cho avatarUrl (ảnh đã cắt, hoàn thiện)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // --- MỚI: State cho việc cắt ảnh ---
  // State chứa ảnh gốc (chưa cắt)
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  // State mở/đóng modal
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  // State lưu trữ thông tin vùng chọn
  const [crop, setCrop] = useState<Crop>();
  // Ref trỏ tới thẻ <img> trong trình cắt ảnh
  const imgRef = useRef<HTMLImageElement>(null);
  // State cho loading khi upload
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load avatar từ API khi component mount
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.image) {
            setAvatarUrl(data.image);
          }
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    };

    if (session?.user?.id) {
      fetchAvatar();
    }
  }, [session?.user?.id]);

  // Dọn dẹp Object URL (chỉ dọn rawImageUrl, không dọn avatarUrl vì nó từ server)
  useEffect(() => {
    return () => {
      if (rawImageUrl && rawImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(rawImageUrl);
      }
    };
  }, [rawImageUrl]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // --- SỬA ĐỔI: Xử lý khi chọn file ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dọn dẹp rawImageUrl cũ (nếu có và là blob URL)
      if (rawImageUrl && rawImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(rawImageUrl);
      }

      const newRawUrl = URL.createObjectURL(file);
      setRawImageUrl(newRawUrl); // Lưu ảnh gốc
      setIsCropModalOpen(true); // Mở modal
    }
    if (e.target) e.target.value = "";
  };

  // --- SỬA ĐỔI: Xử lý khi nhấn "Delete" ---
  const handleDeleteClick = async () => {
    if (!avatarUrl) return;

    setIsUploading(true);
    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete avatar');
      }

      // Xóa avatar khỏi state
      setAvatarUrl(null);

      // Refresh trang để cập nhật session
      router.refresh();
    } catch (error) {
      console.error('Error deleting avatar:', error);
      alert('Không thể xóa avatar. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  // --- MỚI: Hàm được gọi khi ảnh trong modal đã tải xong ---
  // Dùng để tạo vùng chọn mặc định 1:1 ở giữa
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90, // Bắt đầu với vùng chọn 90%
        },
        1 / 1, // Tỷ lệ 1:1 (vuông)
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }

  // --- MỚI: Hàm xác nhận cắt ảnh (ĐÃ SỬA LỖI) ---
  const handleConfirmCrop = async () => {
    const img = imgRef.current;

    // Thêm kiểm tra kỹ hơn, đảm bảo crop và img đã sẵn sàng
    if (
      !img ||
      !crop ||
      typeof crop.width === "undefined" ||
      typeof crop.height === "undefined" ||
      typeof crop.x === "undefined" ||
      typeof crop.y === "undefined"
    ) {
      return;
    }

    const canvas = document.createElement("canvas");

    // --- SỬA LỖI LOGIC TÍNH TOÁN ---
    // State 'crop' của bạn đang lưu giá trị % (từ 0-100).
    // Chúng ta cần chuyển % đó thành pixel dựa trên kích thước *ảnh gốc*.
    const cropX = (crop.x / 100) * img.naturalWidth;
    const cropY = (crop.y / 100) * img.naturalHeight;
    const cropWidth = (crop.width / 100) * img.naturalWidth;
    const cropHeight = (crop.height / 100) * img.naturalHeight;
    // ------------------------------------

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Vẽ ảnh đã cắt lên canvas
    ctx.drawImage(
      img,
      cropX, // Tọa độ X trên ảnh gốc
      cropY, // Tọa độ Y trên ảnh gốc
      cropWidth, // Chiều rộng trên ảnh gốc
      cropHeight, // Chiều cao trên ảnh gốc
      0, // Vẽ tại 0,0 trên canvas
      0, // Vẽ tại 0,0 trên canvas
      cropWidth, // Kích thước trên canvas
      cropHeight // Kích thước trên canvas
    );

    // Chuyển canvas thành Data URL (ảnh mới)
    const newCroppedAvatarUrl = canvas.toDataURL("image/png");

    // Đóng modal và dọn dẹp
    setIsCropModalOpen(false);
    if (rawImageUrl && rawImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(rawImageUrl);
    }
    setRawImageUrl(null);

    // Upload avatar lên server
    setIsUploading(true);
    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: newCroppedAvatarUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to upload avatar');
      }

      // Set avatar mới vào state
      setAvatarUrl(newCroppedAvatarUrl);

      // Refresh trang để cập nhật session
      router.refresh();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Không thể upload avatar. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="flex items-start gap-8 mb-8 pb-8 border-b border-border">
        <div className="flex flex-col items-center gap-4">
          {/* Avatar (giữ nguyên logic hiển thị) */}
          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-muted-foreground" />
            )}
          </div>

          <div className="flex gap-2">
            {/* Nút Upload */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              <RotateCw className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>

            {/* Nút Delete */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive bg-transparent"
              onClick={handleDeleteClick}
              disabled={!avatarUrl || isUploading}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>

          {/* Input file (giữ nguyên) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg"
          />
        </div>
      </div>

      {/* --- MỚI: Modal Cắt ảnh --- */}
      {isCropModalOpen && rawImageUrl && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, marginBottom: "15px" }}>
              Crop your Avatar
            </h3>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              aspect={1} // Tỷ lệ 1:1
              circularCrop // Cắt theo hình tròn
            >
              <img
                src={rawImageUrl}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxHeight: "70vh" }}
              />
            </ReactCrop>
            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <Button
                variant="outline"
                onClick={() => setIsCropModalOpen(false)}
              >
                Cancel
              </Button>
              <Button className="bg-primary" onClick={handleConfirmCrop}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
