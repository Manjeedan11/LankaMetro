import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, BusFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLoginMutation } from "@/lib/api";
import { setCredentials } from "@/lib/features/authSlice";

const roleToPath = {
  admin: "admin",
  logistics_officer: "logistics",
  depot_supervisor: "supervisor",
  maintenance_officer: "maintenance",
  driver: "driver",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMutation, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginMutation({ email, password }).unwrap();
      const { token, user } = response;
      dispatch(setCredentials({ user, token }));
      console.log("User role from API:", user.role);
      const routePrefix = roleToPath[user.role] || "admin";
      console.log("Mapped route prefix:", routePrefix);
      navigate(`/${routePrefix}/dashboard`);
    } catch (err) {
      console.error("Login failed:", err);
      alert("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* subtle red-toned decorative elements */}
      <div className="absolute top-10 left-10 opacity-5">
        <BusFront size={120} className="text-[#B71C1C]" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-5">
        <BusFront
          size={140}
          className="text-[#B71C1C] transform -scale-x-100"
        />
      </div>
      <div className="absolute top-1/3 right-1/4 opacity-10 w-96 h-96 bg-[#B71C1C] rounded-full blur-3xl" />

      <div className="w-full max-w-md px-4 relative z-10 pb-20">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#B71C1C] p-3 rounded-lg shadow-md">
              <BusFront size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LankaMetro</h1>
          <p className="text-gray-600 text-sm mt-2">
            Smart Route Management & Scheduling System
          </p>
        </div>

        <Card className="border-2 border-white rounded-3xl shadow-xl bg-[#B71C1C]">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-semibold text-center text-white">
              Login to your account
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-white text-gray-900 placeholder:text-gray-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-white text-gray-900 placeholder:text-gray-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked)}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#B71C1C]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-white">
                  Remember me
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white hover:bg-[#B71C1C] text-[#B71C1C] hover:text-white border-none font-medium py-2 rounded-lg transition-colors"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
