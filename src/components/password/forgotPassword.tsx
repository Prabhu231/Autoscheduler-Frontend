'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, Check, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { isAxiosError } from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const router = useRouter();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    if (e) e.preventDefault();

    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post('/forgot-password/', {
        email: email
      });

      if (res.data.error) {
        setError(res.data.error);
        return;
      }

      setSuccess(true);
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data.error || 'Failed to process your request. Please try again later.');
      } else {
        setError('Password reset request failed. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20">
          <CardHeader className="pb-4 space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Reset Link Sent</CardTitle>
            <CardDescription className="text-center">Check your email for instructions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <AlertDescription>
                We have sent a password reset link to <span className="font-semibold">{email}</span>. Please check your inbox and follow the instructions.
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
              <span>Back to Login</span>
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
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">Enter your email to receive a reset link</CardDescription>
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
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail size={18} />
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`pl-10 ${!email ? "border-border" : isEmailValid ? "border-primary focus:ring-primary" : "border-red-500 focus:ring-red-500"}`}
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
            disabled={isSubmitting || !isEmailValid}
            type="button"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending Reset Link...</span>
              </div>
            ) : (
              <span>Send Reset Link</span>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <div className="text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline font-medium flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ForgotPassword;