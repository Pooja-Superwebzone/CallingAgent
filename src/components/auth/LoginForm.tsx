
import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthService } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';
import { MyAuthService } from '@/services/authService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { requestPasswordResetOtp, resetPasswordWithOtp } from "@/api/forgotPassword";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp_reset">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotShowConfirmPassword, setForgotShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const forgotCanSubmitReset = useMemo(() => {
    return (
      forgotEmail.trim().length > 3 &&
      forgotOtp.trim().length >= 4 &&
      forgotPassword.length >= 6 &&
      forgotConfirmPassword.length >= 6 &&
      forgotPassword === forgotConfirmPassword
    );
  }, [forgotConfirmPassword, forgotEmail, forgotOtp, forgotPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //setError('');
    setIsLoading(true);

    try {
          //const { token, user }: { token: string; user: User } = await login(email, password);
          const userData = await MyAuthService.login(email, password);
          console.log('Logged in user:', userData);
          // Redirect to dashboard if using react-router
          toast({
              title: "Login successful",
              description: `Welcome back, ${userData.emp_name}!`,
          });
          onLoginSuccess();
      } catch (error) {
          toast({
            title: "Error",
            description: "An error occurred during login. Please try again.",
            variant: "destructive",
          });
      } finally {
          setIsLoading(false);
      }
  };

  const resetForgotModalState = () => {
    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setForgotPassword("");
    setForgotConfirmPassword("");
    setForgotShowPassword(false);
    setForgotShowConfirmPassword(false);
    setForgotLoading(false);
  };

  const handleRequestOtp = async () => {
    const emailToUse = forgotEmail.trim() || email.trim();
    if (!emailToUse) {
      toast({
        title: "Email required",
        description: "Please enter your email to receive an OTP.",
        variant: "destructive",
      });
      return;
    }

    setForgotLoading(true);
    try {
      await requestPasswordResetOtp(emailToUse);
      setForgotEmail(emailToUse);
      setForgotStep("otp_reset");
      toast({
        title: "OTP sent",
        description: "Check your email for the OTP.",
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send OTP. Please try again.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (forgotPassword !== forgotConfirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }
    if (!forgotEmail.trim() || !forgotOtp.trim()) {
      toast({
        title: "Missing info",
        description: "Email and OTP are required.",
        variant: "destructive",
      });
      return;
    }

    setForgotLoading(true);
    try {
      await resetPasswordWithOtp({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        password: forgotPassword,
        password_confirmation: forgotConfirmPassword,
      });
      toast({
        title: "Password updated",
        description: "You can now login with your new password.",
      });
      setIsForgotOpen(false);
      resetForgotModalState();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. Please try again.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setForgotLoading(false);
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     const user = await AuthService.login(email, password);
  //     if (user) {
  //       toast({
  //         title: "Login successful",
  //         description: `Welcome back, ${user.name}!`,
  //       });
  //       onLoginSuccess();
  //     } else {
  //       toast({
  //         title: "Login failed",
  //         description: "Invalid email or password. Please try again.",
  //         variant: "destructive",
  //       });
  //     }
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "An error occurred during login. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const demoCredentials = [
    { role: 'Manager', email: 'manager@transport.com' },
    { role: 'In-charge', email: 'incharge@transport.com' },
    { role: 'Owner', email: 'owner@transport.com' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">TMS</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your Transport Management account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm"
                onClick={() => {
                  setIsForgotOpen(true);
                  setForgotEmail((prev) => prev || email);
                }}
              >
                Forgot your password?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Demo Credentials</CardTitle>
            <CardDescription>Use these credentials to explore different roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoCredentials.map((cred) => (
              <div key={cred.role} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium text-sm">{cred.role}</div>
                  <div className="text-xs text-muted-foreground">{cred.email}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword('password123');
                  }}
                >
                  Use
                </Button>
              </div>
            ))}
            <div className="text-center text-xs text-muted-foreground mt-2">
              Password: password123
            </div>
          </CardContent>
        </Card> */}
      </div>

      <Dialog
        open={isForgotOpen}
        onOpenChange={(open) => {
          setIsForgotOpen(open);
          if (!open) resetForgotModalState();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forgot password</DialogTitle>
            <DialogDescription>
              {forgotStep === "email"
                ? "Enter your email to receive an OTP."
                : "Enter OTP and set your new password."}
            </DialogDescription>
          </DialogHeader>

          {forgotStep === "email" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-otp">OTP</Label>
                <div className="flex items-center gap-3">
                  <InputOTP
                    id="forgot-otp"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={setForgotOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={forgotLoading}
                    onClick={handleRequestOtp}
                  >
                    Resend
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="forgot-password">New password</Label>
                <div className="relative">
                  <Input
                    id="forgot-password"
                    type={forgotShowPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={forgotPassword}
                    onChange={(e) => setForgotPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setForgotShowPassword((v) => !v)}
                    aria-label={forgotShowPassword ? "Hide password" : "Show password"}
                  >
                    {forgotShowPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="forgot-confirm-password">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="forgot-confirm-password"
                    type={forgotShowConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setForgotShowConfirmPassword((v) => !v)}
                    aria-label={
                      forgotShowConfirmPassword ? "Hide confirm password" : "Show confirm password"
                    }
                  >
                    {forgotShowConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {forgotStep === "otp_reset" ? (
              <Button
                type="button"
                variant="outline"
                disabled={forgotLoading}
                onClick={() => setForgotStep("email")}
              >
                Back
              </Button>
            ) : null}

            {forgotStep === "email" ? (
              <Button type="button" onClick={handleRequestOtp} disabled={forgotLoading}>
                {forgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleResetPassword}
                disabled={forgotLoading || !forgotCanSubmitReset}
              >
                {forgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset password
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
