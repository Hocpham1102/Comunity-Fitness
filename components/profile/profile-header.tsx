import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Profile</h2>
          <p className="text-muted-foreground">
            {" "}
            Manage your personal information
          </p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Create
        </Button>
      </div>
    </div>
  );
}
