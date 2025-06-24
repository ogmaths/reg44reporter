import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Upload, Trash2, Key } from "lucide-react";

interface ProfileSettingsProps {
  fullName?: string;
  email?: string;
  organisation?: string;
  defaultVisitType?: "announced" | "unannounced";
  autoCarryForward?: boolean;
  monthlyReminders?: boolean;
  avatarUrl?: string;
}

export default function ProfileSettings({
  fullName = "John Smith",
  email = "john.smith@example.com",
  organisation = "Independent Persons Association",
  defaultVisitType = "announced",
  autoCarryForward = true,
  monthlyReminders = true,
  avatarUrl = "",
}: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    fullName,
    organisation,
    defaultVisitType,
    autoCarryForward,
    monthlyReminders,
  });
  const [avatar, setAvatar] = useState(avatarUrl);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetAvatar = () => {
    setAvatar("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveChanges = () => {
    console.log("Saving changes:", formData, { avatar });
    // Here you would typically save to your backend
  };

  const handleDeleteAccount = () => {
    console.log("Deleting account");
    // Here you would typically call your delete account API
    setIsDeleteDialogOpen(false);
  };

  const handlePasswordReset = () => {
    console.log("Sending password reset email to:", email);
    // Here you would typically trigger a password reset email
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        {/* Account Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="organisation">Organisation (Optional)</Label>
              <Input
                id="organisation"
                value={formData.organisation}
                onChange={(e) =>
                  handleInputChange("organisation", e.target.value)
                }
                placeholder="Enter your organisation"
              />
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={handlePasswordReset}
                className="flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Reset Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default Visit Type */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Default Visit Type
              </Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="announced"
                    checked={formData.defaultVisitType === "announced"}
                    onCheckedChange={() =>
                      handleInputChange("defaultVisitType", "announced")
                    }
                  />
                  <Label htmlFor="announced">Announced</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unannounced"
                    checked={formData.defaultVisitType === "unannounced"}
                    onCheckedChange={() =>
                      handleInputChange("defaultVisitType", "unannounced")
                    }
                  />
                  <Label htmlFor="unannounced">Unannounced</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Toggle Preferences */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Auto-carry forward incomplete actions
                  </Label>
                  <p className="text-sm text-gray-600">
                    Automatically include unresolved actions in new reports
                  </p>
                </div>
                <Switch
                  checked={formData.autoCarryForward}
                  onCheckedChange={(checked) =>
                    handleInputChange("autoCarryForward", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Receive monthly visit reminders
                  </Label>
                  <p className="text-sm text-gray-600">
                    Get email notifications for upcoming visits
                  </p>
                </div>
                <Switch
                  checked={formData.monthlyReminders}
                  onCheckedChange={(checked) =>
                    handleInputChange("monthlyReminders", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Avatar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatar} alt="Profile" />
                <AvatarFallback className="text-lg">
                  {getInitials(formData.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResetAvatar}
                    disabled={!avatar}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Recommended: Square image, at least 200x200px
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-6">
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your account? This action
                  cannot be undone. All your data, including reports and visit
                  records, will be permanently removed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSaveChanges} className="px-8">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
