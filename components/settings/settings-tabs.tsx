"use client";

import { useState } from "react";
import { User, Lock } from "lucide-react";
import AccountInfoForm from "./account-info-form";
import ChangePasswordForm from "./change-password-form";

type TabType = "account" | "password";

type SettingsTabsProps = {
    userRole?: string;
    initialData?: {
        name?: string | null;
        email?: string;
        phoneNumber?: string | null;
        role?: string;
    };
};

export default function SettingsTabs({ userRole, initialData }: SettingsTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>("account");

    const tabs = [
        {
            id: "account" as TabType,
            label: "Account Information",
            icon: User,
        },
        {
            id: "password" as TabType,
            label: "Change Password",
            icon: Lock,
        },
    ];

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="border-b border-border mb-6">
                <div className="flex gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-6 py-3 font-medium transition-colors
                  border-b-2 -mb-[2px]
                  ${isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                    }
                `}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === "account" && (
                    <AccountInfoForm userRole={userRole} initialData={initialData} />
                )}
                {activeTab === "password" && (
                    <ChangePasswordForm />
                )}
            </div>
        </div>
    );
}
