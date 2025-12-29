"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  RotateCw,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

type FormData = {
  fullName: string;
  dateOfBirth: string;
  phone: string;
  accountType: string;
  email: string;
  password: string;
};

type FormErrors = {
  [key in keyof FormData]?: string | null;
};

export default function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    dateOfBirth: "1990-01-15",
    phone: "+1 (555) 123-4567",
    accountType: "premium",
    email: "john@example.com",
    password: "••••••••",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // State để biết khi nào người dùng click vào ô input ngày sinh
  const [isDateInputFocused, setIsDateInputFocused] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Xóa hết lỗi cũ trước khi kiểm tra
    setSuccessMessage(null); // --- MỚI ---: Xóa thông báo cũ khi submit
    setIsSubmitting(true); // --- MỚI ---: Bắt đầu loading
    const newErrors: FormErrors = {};

    // 1. Định nghĩa các trường bắt buộc
    const requiredFields: (keyof FormData)[] = ["email", "password"];

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
    //Xử lý dateOfBirth (ví dụ)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);

      // Đặt giờ về 0 để chỉ so sánh ngày
      today.setHours(0, 0, 0, 0);

      if (birthDate > today) {
        newErrors.dateOfBirth = "Date of Birth cannot be in the future";
      } else {
        // (Tùy chọn) Kiểm tra 13 tuổi
        const minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
        if (birthDate > minAgeDate) {
          // newErrors.dateOfBirth đã được check ở trên,
          // nên chỉ set lỗi này nếu lỗi "future" không xảy ra
          newErrors.dateOfBirth = "You must be at least 13 years old";
        }
      }
    }
    //Xử lý password (ví dụ)
    if (formData.password && formData.password !== "••••••••") {
      const password = formData.password;
      const hasNumber = /\d/;
      const hasUpperCase = /[A-Z]/;
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

      if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!hasNumber.test(password)) {
        newErrors.password = "Password must contain at least one number";
      } else if (!hasUpperCase.test(password)) {
        newErrors.password =
          "Password must contain at least one uppercase letter";
      } else if (!hasSpecialChar.test(password)) {
        newErrors.password =
          "Password must contain at least one special character (e.g., !@#$%)";
      }
    }

    //Nếu có lỗi, cập nhật state lỗi và dừng lại
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false); // --- MỚI ---: Dừng loading nếu có lỗi
      return; // Không cho submit
    }

    //Nếu không có lỗi
    console.log("Form is valid. Submitting:", formData);
    setTimeout(() => {
      setIsSubmitting(false); // --- MỚI ---: Dừng loading sau khi "API" hoàn tất
      setSuccessMessage("Update complete!"); // --- MỚI ---: Hiển thị thông báo

      // --- MỚI ---: Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 1000); // Giả lập API delay
  };

  const dateInputType =
    formData.dateOfBirth || isDateInputFocused ? "date" : "text";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <div className="relative">
            <Input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Vui lòng nhập Full Name"
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

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Date of Birth
          </label>
          <div className="relative">
            <Input
              type={dateInputType}
              name="dateOfBirth"
              value={formData.dateOfBirth}
              placeholder="--/--/----" // Giữ placeholder đặc biệt này
              onChange={handleChange}
              onFocus={() => setIsDateInputFocused(true)}
              onBlur={() => setIsDateInputFocused(false)}
              data-invalid={!!errors.dateOfBirth}
              className="w-full data-[invalid=true]:border-destructive pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          {errors.dateOfBirth && (
            <p className="text-sm text-destructive mt-1">
              {errors.dateOfBirth}
            </p>
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
              placeholder="Vui lòng nhập Phone"
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
              placeholder="Vui lòng nhập Email"
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

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Password*
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Vui lòng nhập Password"
              data-invalid={!!errors.password}
              className="w-full data-[invalid=true]:border-destructive pl-10 pr-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="w-4 h-4" />
            </span>
            <button
              type="button" // Quan trọng: để không submit form
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password}</p>
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
          onClick={() => {
            // Đặt logic xử lý xóa của bạn ở đây
            // Ví dụ: handleDelete(formData.id);
          }}
          disabled={isSubmitting}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </form>
  );
}
