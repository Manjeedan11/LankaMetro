import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetSystemSettingsQuery,
  useUpdateSystemSettingMutation,
} from "@/lib/api";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function SystemSettings() {
  const {
    data: settings = [],
    isLoading,
    isError,
    refetch,
  } = useGetSystemSettingsQuery();
  const [updateSetting] = useUpdateSystemSettingMutation();

  const [localSettings, setLocalSettings] = useState({});

  useEffect(() => {
    if (settings.length) {
      const obj = {};
      settings.forEach((s) => {
        obj[s.setting_key] = s.setting_value;
      });
      setLocalSettings(obj);
    }
  }, [settings]);

  const handleInputChange = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      for (const [key, value] of Object.entries(localSettings)) {
        await updateSetting({ key, value }).unwrap();
      }
      toast.success("Settings saved successfully.", {
        icon: "✅",
        style: { background: "#dcfce7", color: "#166534" },
      });
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings.", {
        icon: "❌",
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
    }
  };

  const buttonBase =
    "border border-gray-300 text-black hover:bg-red-700 hover:text-white transition-colors";

  if (isError)
    return <div className="p-6 text-red-600">Error loading settings.</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <Toaster position="bottom-right" />
      <div className="page-header">
        <h1 className="page-title">System Settings</h1>
        <p className="page-description">Configure system‑wide settings</p>
      </div>

      <Card className="border border-gray-200 shadow-sm max-w-2xl">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Loading...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Maximum Driving Hours Per Day
                </label>
                <Input
                  type="number"
                  value={localSettings.max_driving_hours || ""}
                  onChange={(e) =>
                    handleInputChange("max_driving_hours", e.target.value)
                  }
                  min="1"
                  max="24"
                  className="text-black"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Maximum hours a driver can work per day
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Fuel Price Threshold (LKR/liter)
                </label>
                <Input
                  type="number"
                  value={localSettings.fuel_price_threshold || ""}
                  onChange={(e) =>
                    handleInputChange("fuel_price_threshold", e.target.value)
                  }
                  min="0"
                  className="text-black"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Alert when fuel cost exceeds this value
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Return Trip Rest Minutes
                </label>
                <Input
                  type="number"
                  value={localSettings.return_trip_rest_minutes || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "return_trip_rest_minutes",
                      e.target.value
                    )
                  }
                  min="0"
                  className="text-black"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Minimum rest time before return trip departure
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 flex gap-2">
                <Button type="submit" className={`bg-primary ${buttonBase}`}>
                  Save Settings
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={buttonBase}
                  onClick={() => refetch()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm max-w-2xl">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">
                System Version
              </span>
              <span className="text-sm text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">
                Database Status
              </span>
              <span className="text-sm text-green-600 font-medium">
                Connected
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium text-gray-600">
                Total Users
              </span>
              <span className="text-sm text-gray-900">—</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
