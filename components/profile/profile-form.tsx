"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Activity,
  Calendar,
  Check,
  Ruler,
  RotateCw,
  Target,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

// Fitness Profile Form Data Types
type FitnessFormData = {
  dateOfBirth: string;
  gender: string;
  height: string; // cm
  currentWeight: string; // kg
  targetWeight: string; // kg
  activityLevel: string;
  fitnessGoal: string;
};

type FormErrors = {
  [key in keyof FitnessFormData]?: string | null;
};

type ProfileFormProps = {
  initialData?: {
    dateOfBirth?: Date | null;
    gender?: string | null;
    height?: number | null;
    currentWeight?: number | null;
    targetWeight?: number | null;
    activityLevel?: string | null;
    fitnessGoal?: string | null;
    bmi?: number | null;
    bmr?: number | null;
    tdee?: number | null;
  };
};

export default function ProfileForm({ initialData }: ProfileFormProps) {
  // Helper function to format date for input
  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const router = useRouter();

  const [formData, setFormData] = useState<FitnessFormData>({
    dateOfBirth: formatDateForInput(initialData?.dateOfBirth),
    gender: initialData?.gender || "",
    height: initialData?.height?.toString() || "",
    currentWeight: initialData?.currentWeight?.toString() || "",
    targetWeight: initialData?.targetWeight?.toString() || "",
    activityLevel: initialData?.activityLevel || "",
    fitnessGoal: initialData?.fitnessGoal || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDateInputFocused, setIsDateInputFocused] = useState(false);

  // Calculated values
  const [calculatedValues, setCalculatedValues] = useState({
    bmi: initialData?.bmi || null,
    bmr: initialData?.bmr || null,
    tdee: initialData?.tdee || null,
  });

  // Calculate BMI, BMR, and TDEE
  useEffect(() => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.currentWeight);
    const birthDate = formData.dateOfBirth ? new Date(formData.dateOfBirth) : null;

    if (height > 0 && weight > 0) {
      // Calculate BMI (Body Mass Index)
      // BMI = weight (kg) / (height (m))^2
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);

      // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
      let bmr = 0;
      if (birthDate && formData.gender) {
        const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

        if (formData.gender === 'MALE') {
          // Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) + 5
          bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else if (formData.gender === 'FEMALE') {
          // Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) - 161
          bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
      }

      // Calculate TDEE (Total Daily Energy Expenditure)
      // TDEE = BMR × Activity Factor
      let tdee = 0;
      if (bmr > 0 && formData.activityLevel) {
        const activityMultipliers: { [key: string]: number } = {
          SEDENTARY: 1.2,           // Little or no exercise
          LIGHTLY_ACTIVE: 1.375,    // Light exercise 1-3 days/week
          MODERATELY_ACTIVE: 1.55,  // Moderate exercise 3-5 days/week
          VERY_ACTIVE: 1.725,       // Hard exercise 6-7 days/week
          EXTRA_ACTIVE: 1.9,        // Very hard exercise & physical job
        };
        tdee = bmr * (activityMultipliers[formData.activityLevel] || 1.2);
      }

      setCalculatedValues({
        bmi: Math.round(bmi * 10) / 10,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
      });
    } else {
      setCalculatedValues({ bmi: null, bmr: null, tdee: null });
    }
  }, [formData.height, formData.currentWeight, formData.dateOfBirth, formData.gender, formData.activityLevel]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSuccessMessage(null);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);
    setIsSubmitting(true);
    const newErrors: FormErrors = {};

    // Validate Date of Birth
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      today.setHours(0, 0, 0, 0);

      if (birthDate > today) {
        newErrors.dateOfBirth = "Date of Birth cannot be in the future";
      } else {
        const minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
        if (birthDate > minAgeDate) {
          newErrors.dateOfBirth = "You must be at least 13 years old";
        }
      }
    }

    // Validate Height
    if (formData.height) {
      const height = parseFloat(formData.height);
      if (isNaN(height) || height < 50 || height > 300) {
        newErrors.height = "Height must be between 50-300 cm";
      }
    }

    // Validate Current Weight
    if (formData.currentWeight) {
      const weight = parseFloat(formData.currentWeight);
      if (isNaN(weight) || weight < 20 || weight > 500) {
        newErrors.currentWeight = "Weight must be between 20-500 kg";
      }
    }

    // Validate Target Weight
    if (formData.targetWeight) {
      const weight = parseFloat(formData.targetWeight);
      if (isNaN(weight) || weight < 20 || weight > 500) {
        newErrors.targetWeight = "Target weight must be between 20-500 kg";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          height: formData.height ? parseFloat(formData.height) : null,
          currentWeight: formData.currentWeight ? parseFloat(formData.currentWeight) : null,
          targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : null,
          activityLevel: formData.activityLevel || null,
          fitnessGoal: formData.fitnessGoal || null,
          bmi: calculatedValues.bmi,
          bmr: calculatedValues.bmr,
          tdee: calculatedValues.tdee,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsSubmitting(false);
        setSuccessMessage(data.message || 'Update failed. Please try again.');
        return;
      }

      setIsSubmitting(false);
      setSuccessMessage(data.message || "Profile updated successfully!");

      // Refresh the page to load updated data from server
      router.refresh();

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

  const dateInputType = formData.dateOfBirth || isDateInputFocused ? "date" : "text";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Information Note */}
      <div className="bg-muted/50 p-4 rounded-lg border border-border">
        <h3 className="font-semibold text-sm mb-2">Fitness Profile Information</h3>
        <p className="text-xs text-muted-foreground">
          This information helps calculate BMI, BMR, TDEE and provides a suitable workout plan for you.
        </p>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date of Birth - Ngày sinh */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Date of Birth
          </label>
          <div className="relative">
            <Input
              type={dateInputType}
              name="dateOfBirth"
              value={formData.dateOfBirth}
              placeholder="--/--/----"
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
          <p className="text-xs text-muted-foreground mt-1">Used to calculate age and BMR</p>
          {errors.dateOfBirth && (
            <p className="text-sm text-destructive mt-1">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Gender - Giới tính */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Gender
          </label>
          <div className="relative">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              data-invalid={!!errors.gender}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground data-[invalid=true]:border-destructive pl-10"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <User className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Affects BMR calculation formula</p>
        </div>

        {/* Height - Chiều cao */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Height (cm)
          </label>
          <div className="relative">
            <Input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="170"
              step="0.1"
              data-invalid={!!errors.height}
              className="w-full data-[invalid=true]:border-destructive pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Ruler className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Unit: cm (e.g., 170)</p>
          {errors.height && (
            <p className="text-sm text-destructive mt-1">{errors.height}</p>
          )}
        </div>

        {/* Current Weight - Cân nặng hiện tại */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Current Weight (kg)
          </label>
          <div className="relative">
            <Input
              type="number"
              name="currentWeight"
              value={formData.currentWeight}
              onChange={handleChange}
              placeholder="70"
              step="0.1"
              data-invalid={!!errors.currentWeight}
              className="w-full data-[invalid=true]:border-destructive pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Unit: kg (e.g., 70)</p>
          {errors.currentWeight && (
            <p className="text-sm text-destructive mt-1">{errors.currentWeight}</p>
          )}
        </div>

        {/* Target Weight - Cân nặng mục tiêu */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Target Weight (kg)
          </label>
          <div className="relative">
            <Input
              type="number"
              name="targetWeight"
              value={formData.targetWeight}
              onChange={handleChange}
              placeholder="65"
              step="0.1"
              data-invalid={!!errors.targetWeight}
              className="w-full data-[invalid=true]:border-destructive pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Your target weight goal</p>
          {errors.targetWeight && (
            <p className="text-sm text-destructive mt-1">{errors.targetWeight}</p>
          )}
        </div>

        {/* Activity Level - Mức độ hoạt động */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Activity Level
          </label>
          <div className="relative">
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground pl-10"
            >
              <option value="">Select activity level</option>
              <option value="SEDENTARY">Sedentary (Little or no exercise)</option>
              <option value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/week)</option>
              <option value="MODERATELY_ACTIVE">Moderately Active (3-5 days/week)</option>
              <option value="VERY_ACTIVE">Very Active (6-7 days/week)</option>
              <option value="EXTRA_ACTIVE">Extra Active (Very hard exercise + physical job)</option>
            </select>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Used to calculate TDEE (daily calorie expenditure)</p>
        </div>

        {/* Fitness Goal - Mục tiêu thể chất */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Fitness Goal
          </label>
          <div className="relative">
            <select
              name="fitnessGoal"
              value={formData.fitnessGoal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground pl-10"
            >
              <option value="">Select fitness goal</option>
              <option value="LOSE_WEIGHT">Lose Weight</option>
              <option value="GAIN_MUSCLE">Gain Muscle</option>
              <option value="MAINTAIN_WEIGHT">Maintain Weight</option>
              <option value="IMPROVE_ENDURANCE">Improve Endurance</option>
              <option value="GENERAL_FITNESS">General Fitness</option>
            </select>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Your fitness goal</p>
        </div>
      </div>

      {/* Calculated Values - Read Only */}
      <div className="border-t border-border pt-6">
        <h3 className="font-semibold text-sm mb-4">Calculated Health Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* BMI */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              BMI (Body Mass Index)
            </label>
            <p className="text-2xl font-bold text-foreground">
              {calculatedValues.bmi ? calculatedValues.bmi.toFixed(1) : '--'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Body Mass Index (weight/height²)
            </p>
          </div>

          {/* BMR */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              BMR (Basal Metabolic Rate)
            </label>
            <p className="text-2xl font-bold text-foreground">
              {calculatedValues.bmr ? `${calculatedValues.bmr} kcal` : '--'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Basic calories your body needs daily
            </p>
          </div>

          {/* TDEE */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              TDEE (Total Daily Energy Expenditure)
            </label>
            <p className="text-2xl font-bold text-foreground">
              {calculatedValues.tdee ? `${calculatedValues.tdee} kcal` : '--'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total daily calorie expenditure
            </p>
          </div>
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
            {isSubmitting ? "Updating..." : "Update Profile"}
          </Button>

          {successMessage && (
            <div className="flex items-center gap-2 text-sm text-green-600 mt-3">
              <Check className="w-4 h-4" />
              <p>{successMessage}</p>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
