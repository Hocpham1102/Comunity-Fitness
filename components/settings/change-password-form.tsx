"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Check, RotateCw } from "lucide-react";
import { useState } from "react";

type PasswordFormData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

type PasswordFormErrors = {
    [key in keyof PasswordFormData]?: string | null;
};

export default function ChangePasswordForm() {
    const [formData, setFormData] = useState<PasswordFormData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<PasswordFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setSuccessMessage(null);

        if (errors[name as keyof PasswordFormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage(null);
        setIsSubmitting(true);

        const newErrors: PasswordFormErrors = {};

        // Validate required fields
        if (!formData.currentPassword.trim()) {
            newErrors.currentPassword = "Current password is required";
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword = "New password is required";
        } else {
            // Validate new password strength
            const password = formData.newPassword;
            const hasNumber = /\d/;
            const hasUpperCase = /[A-Z]/;
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

            if (password.length < 8) {
                newErrors.newPassword = "Password must be at least 8 characters";
            } else if (!hasNumber.test(password)) {
                newErrors.newPassword = "Password must contain at least one number";
            } else if (!hasUpperCase.test(password)) {
                newErrors.newPassword = "Password must contain at least one uppercase letter";
            } else if (!hasSpecialChar.test(password)) {
                newErrors.newPassword = "Password must contain at least one special character";
            }
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your new password";
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        // Call API to change password
        try {
            const response = await fetch('/api/profile/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setIsSubmitting(false);

                if (response.status === 401) {
                    setErrors({ currentPassword: data.message || 'Current password is incorrect' });
                } else {
                    setSuccessMessage(data.message || 'Failed to change password. Please try again.');
                }
                return;
            }

            // Success
            setIsSubmitting(false);
            setSuccessMessage(data.message || "Password changed successfully!");

            // Clear form
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (error) {
            console.error('Password change error:', error);
            setIsSubmitting(false);
            setSuccessMessage('Network error. Please check your connection and try again.');

            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-4">
                {/* Current Password */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Current Password*
                    </label>
                    <div className="relative">
                        <Input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder="Enter your current password"
                            data-invalid={!!errors.currentPassword}
                            className="w-full data-[invalid=true]:border-destructive pl-10 pr-10"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Lock className="w-4 h-4" />
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showCurrentPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.currentPassword && (
                        <p className="text-sm text-destructive mt-1">{errors.currentPassword}</p>
                    )}
                </div>

                {/* New Password */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        New Password*
                    </label>
                    <div className="relative">
                        <Input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Enter your new password"
                            data-invalid={!!errors.newPassword}
                            className="w-full data-[invalid=true]:border-destructive pl-10 pr-10"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Lock className="w-4 h-4" />
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showNewPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="text-sm text-destructive mt-1">{errors.newPassword}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Confirm New Password*
                    </label>
                    <div className="relative">
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your new password"
                            data-invalid={!!errors.confirmPassword}
                            className="w-full data-[invalid=true]:border-destructive pl-10 pr-10"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Lock className="w-4 h-4" />
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                    )}
                </div>
            </div>

            {/* Action Button */}
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
                            <Lock className="w-4 h-4" />
                        )}
                        {isSubmitting ? "Changing..." : "Change Password"}
                    </Button>

                    {successMessage && (
                        <div className={`flex items-center gap-2 text-sm mt-3 ${successMessage.includes('successfully') || successMessage.includes('complete')
                            ? 'text-green-600'
                            : 'text-destructive'
                            }`}>
                            {successMessage.includes('successfully') || successMessage.includes('complete') ? (
                                <Check className="w-4 h-4" />
                            ) : null}
                            <p>{successMessage}</p>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
