'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Check, Lock, ArrowRight } from 'lucide-react';
import {isAxiosError} from 'axios';
import { api } from '@/lib/api';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import ValidationItem from '../authentication/Validation';

const ResetPassword = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
  const [passwordScore, setPasswordScore] = useState<number>(0);
  const router = useRouter();
  const [token, setToken] = useState<string | null>();
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenChecking, setTokenChecking] = useState<boolean>(true);

    useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tokenParam = searchParams.get('token');
      if (tokenParam) {
        setToken(tokenParam);
        validateToken(tokenParam)
      }
      else {
        setTokenValid(false);
        setTokenChecking(false);
      }
    }
  }, []);

  const validateToken = async (resetToken: string) => {
    try {
      const res = await api.post('/reset-password/', { token: resetToken });
      setTokenValid(!res.data.error);
    } catch {
      // console.log(err)
      setTokenValid(false);
    } finally {
      setTokenChecking(false);
    }
  };

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    let score = 0;
    if (hasMinLength) score++;
    if (hasUpperCase) score++;
    if (hasLowerCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    setPasswordScore(score);
  }, [password, hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar]);

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    if (e) e.preventDefault();

    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post('/reset-password/', {
        token: token,
        password: password
      });

      if (res.data.error) {
        setError(res.data.error);
        return;
      }

      setSuccess(true);
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data.error || 'Failed to reset password. Please try again.');
      } else {
        setError('Password reset failed. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenChecking) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20">
          <CardHeader className="pb-4 space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Verifying Reset Link</CardTitle>
            <CardDescription className="text-center">Please wait while we verify your reset link</CardDescription>
          </CardHeader>
          <CardContent className="py-10 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (tokenValid === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20">
          <CardHeader className="pb-4 space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Invalid or Expired Link</CardTitle>
            <CardDescription className="text-center">The password reset link is invalid or has expired</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertDescription>
                The password reset link you used is either invalid or has expired. Please request a new password reset link.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => router.push("/forgot-password")}
              type="button"
            >
              <span>Request New Reset Link</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20">
          <CardHeader className="pb-4 space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Password Reset Successful!</CardTitle>
            <CardDescription className="text-center">Your password has been updated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <AlertDescription>
                Your password has been successfully reset. You can now log in with your new password.
              </AlertDescription>
            </Alert>
            <div className="flex items-center justify-center p-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Check size={28} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => router.push("/auth/login")}
              type="button"
            >
              <span>Go to Login</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20">
        <CardHeader className="pb-6 space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">Create a new secure password for your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
              {password && (
                <div className="flex items-center">
                  <span className="text-xs mr-2 text-muted-foreground">Strength:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(score => (
                      <div
                        key={score}
                        className={`h-1.5 w-5 rounded-full ${
                          passwordScore >= score
                            ? passwordScore === 1 ? "bg-red-500"
                              : passwordScore <= 3 ? "bg-yellow-500"
                                : "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock size={18} />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="Create a secure password"
                className={`pl-10 pr-10 ${
                  !password
                    ? "border-border"
                    : isPasswordValid
                      ? "border-primary focus:ring-primary"
                      : "border-red-500 focus:ring-red-500"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {(passwordFocused || password.length > 0) && (
              <motion.div
                className="mt-3 space-y-1 rounded-lg bg-muted p-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <ValidationItem condition={hasMinLength} text="At least 8 characters" />
                <ValidationItem condition={hasUpperCase} text="At least one uppercase letter" />
                <ValidationItem condition={hasLowerCase} text="At least one lowercase letter" />
                <ValidationItem condition={hasNumber} text="At least one number" />
                <ValidationItem condition={hasSpecialChar} text="At least one special character" />
              </motion.div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock size={18} />
              </div>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={`pl-10 pr-10 ${
                  !confirmPassword
                    ? "border-border"
                    : passwordsMatch
                      ? "border-primary focus:ring-primary"
                      : "border-red-500 focus:ring-red-500"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
            disabled={isSubmitting || !isPasswordValid || !passwordsMatch}
            type="button"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Resetting Password...</span>
              </div>
            ) : (
              <span>Reset Password</span>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <div className="text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ResetPassword;