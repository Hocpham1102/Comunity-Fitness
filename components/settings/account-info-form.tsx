"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  Mail,
  Phone,
  RotateCw,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type FormData = {
  fullName: string;
  phone: string;
  accountType: string;
  email: string;
};

type FormErrors = {
  [key in keyof FormData]?: string | null;
};

type ProfileFormProps = {
  userRole?: string;
  initialData?: {
    name?: string | null;
    email?: string;
    phoneNumber?: string | null;
    role?: string;
  };
};

export default function ProfileForm({ userRole, initialData }: ProfileFormProps) {
  const isAdmin = userRole === 'ADMIN';
  const router = useRouter();

  // Helper function to map role to account type
  const mapRoleToAccountType = (role?: string) => {
    if (!role) return 'free';
    return role.toLowerCase();
  };

  const [formData, setFormData] = useState({
    fullName: initialData?.name || "",
    phone: initialData?.phoneNumber || "",
    accountType: mapRoleToAccountType(initialData?.role),
    email: initialData?.email || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setSuccessMessage(null); // --- MỚI ---: Ẩn thông báo thành công khi bắt đầu sửa
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Xóa hết lỗi cũ trước khi kiểm tra
    setSuccessMessage(null); // --- MỚI ---: Xóa thông báo cũ khi submit
    setIsSubmitting(true); // --- MỚI ---: Bắt đầu loading
    const newErrors: FormErrors = {};

    // 1. Định nghĩa các trường bắt buộc (chỉ email, password là optional)
    const requiredFields: (keyof FormData)[] = ["email"];

    // Kiểm tra từng trường
    requiredFields.forEach((field) => {
      const value = formData[field];
      if (!value || value.trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    //Xử lý fullName (ví dụ)
    if (formData.fullName && !newErrors.fullName) {
      // Regex này cho phép chữ (kể cả Unicode/tiếng Việt), space, apostrophe, hyphen
      const nameRegex = /^[\p{L}\s'-]+$/u;

      if (formData.fullName.trim().length < 3) {
        newErrors.fullName = "Full Name must be at least 3 characters";
      } else if (formData.fullName.length > 100) {
        newErrors.fullName = "Full Name cannot exceed 100 characters";
      } else if (!nameRegex.test(formData.fullName)) {
        newErrors.fullName =
          "Name contains invalid characters (no numbers or symbols)";
      }
    }
    //Xử lý email đặc biệt (ví dụ)
    if (formData.email) {
      // Regex này hỗ trợ Unicode (quốc tế) và yêu cầu TLD (đuôi) phải có ít nhất 2 ký tự
      const emailRegex = /^[\p{L}0-9._%+-]+@[\p{L}0-9.-]+\.[\p{L}]{2,}$/u;

      if (!emailRegex.test(formData.email)) {
        newErrors.email =
          "Please enter a valid email format (e.g., user@domain.com)";
      }
    }

    //Xử lý phone (ví dụ)
    if (formData.phone) {
      // Regex 1: Tìm bất kỳ ký tự nào KHÔNG PHẢI là số, +, (, ), -, hoặc khoảng trắng
      const phoneRegexInvalidChars = /[^0-9+()\-\s]/;

      if (phoneRegexInvalidChars.test(formData.phone)) {
        // Lỗi 1: SĐT có chứa ký tự không hợp lệ (như chữ cái, @, #, ...)
        newErrors.phone = "Phone number contains invalid characters";
      } else {
        // Lỗi 2: Nếu ký tự hợp lệ, kiểm tra số lượng chữ số
        // Lột bỏ tất cả ký tự không phải là số (D = non-digit) và đếm
        const digitCount = formData.phone.replace(/\D/g, "").length;

        if (digitCount < 9 || digitCount > 15) {
          // Hầu hết SĐT quốc tế có từ 9 (VD: VN) đến 15 (VD: Đức) chữ số
          newErrors.phone = "Phone number must have between 9 and 15 digits";
        }
      }
    }


    //Nếu có lỗi, cập nhật state lỗi và dừng lại
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false); // Dừng loading nếu có lỗi
      return; // Không cho submit
    }

    //Nếu không có lỗi, gọi API để update
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phone,
          accountType: formData.accountType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Xử lý lỗi từ server
        setIsSubmitting(false);
        setSuccessMessage(null);

        if (response.status === 409) {
          setErrors({ email: data.message || 'Email already exists' });
        } else {
          setSuccessMessage(data.message || 'Update failed. Please try again.');
        }
        return;
      }

      // Thành công
      setIsSubmitting(false);
      setSuccessMessage(data.message || "Update complete!");

      // Refresh page data to show updated information
      router.refresh();

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setIsSubmitting(false);
      setSuccessMessage('Network error. Please check your connection and try again.');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/profile/delete-account', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setIsDeleting(false);
        setSuccessMessage(data.message || 'Failed to delete account. Please try again.');
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        return;
      }

      // Success - sign out and redirect
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Account deletion error:', error);
      setIsDeleting(false);
      setSuccessMessage('Network error. Please check your connection and try again.');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          <div className="relative">
            <Input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Please enter Full Name"
              data-invalid={!!errors.fullName}
              className="w-full data-[invalid=true]:border-destructive pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <User className="w-4 h-4" />
            </span>
          </div>
          {errors.fullName && (
            <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
          )}
        </div>


        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Phone
          </label>
          <div className="relative">
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Please enter Phone"
              data-invalid={!!errors.phone}
              className="w-full data-[invalid=true]:border-destructive pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Phone className="w-4 h-4" />
            </span>
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Account Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Account Type
          </label>
          <div className="relative">
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              disabled={!isAdmin}
              data-invalid={!!errors.accountType}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed data-[invalid=true]:border-destructive pl-10"
            >
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="pro">Pro</option>
            </select>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Shield className="w-4 h-4" />
            </span>
          </div>
          {errors.accountType && (
            <p className="text-sm text-destructive mt-1">
              {errors.accountType}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email*
          </label>
          <div className="relative">
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Please enter Email"
              data-invalid={!!errors.email}
              className="w-full data-[invalid=true]:border-destructive pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="w-4 h-4" />
            </span>
          </div>
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email}</p>
          )}
        </div>


      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t border-border">
        <div className="flex flex-col">
          <Button
            type="submit"
            className="gap-2 bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCw className="w-4 h-4" />
            )}
            {isSubmitting ? "Updating..." : "Update"}
          </Button>

          {/* --- ĐÃ DI CHUYỂN: Thông báo thành công nằm ngay dưới nút Update --- */}
          {successMessage && (
            <div className="flex items-center gap-2 text-sm text-green-600 mt-3">
              <Check className="w-4 h-4" />
              <p>{successMessage}</p>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2 text-destructive hover:text-destructive bg-transparent"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isSubmitting || isDeleting}
        >
          <Trash2 className="w-4 h-4" />
          Delete Account Permanently
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Confirm Account Deletion
            </h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
