'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Check, Mail, Lock, ArrowRight } from 'lucide-react';
import {isAxiosError} from 'axios';
import { api } from '@/lib/api';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import ValidationItem from './Validation';


const Authentication = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
  const [passwordScore, setPasswordScore] = useState<number>(0);
  const [login, setLogin] = useState<boolean>(true);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState<boolean>(false);

  const router = useRouter()

  const { type } = useParams()

  useEffect(() => {
    const isLogin = (type === 'login')
    setLogin(isLogin)

    if (isLogin && !autoLoginAttempted) {
      setAutoLoginAttempted(true);
      
      const autoLogin = async () => {
        try {
          const res = await api.post('/authentication/', {
            auto_login: 1
          });
          
          
          if (res.data.flag === 1 && res.data.access_token) {
            // console.log('Auto login successful, setting token');
            localStorage.setItem('access_token_app', res.data.access_token);
            router.push('/schedule');
          }
        } catch {

        }
      };
      
      autoLogin();
    }
  }, [type, autoLoginAttempted, router]);

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = login || (hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (!login) {
      let score = 0;
      if (hasMinLength) score++;
      if (hasUpperCase) score++;
      if (hasLowerCase) score++;
      if (hasNumber) score++;
      if (hasSpecialChar) score++;
      setPasswordScore(score);
    }
  }, [password, hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, login]);

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    if (e) e.preventDefault();

    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      
      const res = await api.post('/authentication/', {
        login: login ? 1 : 0,
        email: email,
        password: password
      });

      // console.log('Login/register response:', res.data);

      if (res.data.error) {
        setError(res.data.error);
        return;
      }

      if (login) {
        localStorage.setItem('access_token_app', res.data.access_token);
        localStorage.setItem('email_app', email)
        router.push('/schedule');
        return;
      }

      setSuccess(true);
    } catch (err) {
      if (isAxiosError(err)) {
        // console.error('API error response:', err.response?.data);
        setError(err.response?.data.error || 'An error occurred during authentication');
      } else {
        // console.error('Unexpected error:', err);
        setError('Authentication failed. Please try again later.');
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
            <CardTitle className="text-2xl font-bold text-center">Registration Successful!</CardTitle>
            <CardDescription className="text-center">Your account has been created.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <AlertDescription>
                An email confirmation has been sent to <span className="font-semibold">{email}</span> Please login to start using the application.
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
          <CardTitle className="text-2xl font-bold text-center">{!login ? "Create an account" : "Login to your account"}</CardTitle>
          <CardDescription className="text-center">Enter your details to get started</CardDescription>
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

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              {login && (
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
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
                placeholder={login ? "Enter your password" : "Create a secure password"}
                className={`pl-10 pr-10 ${!password
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

            {!login && (passwordFocused || password.length > 0) && (
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

            {!login && password && (
              <div className="flex items-center mt-2">
                <span className="text-xs mr-2 text-muted-foreground">Strength:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(score => (
                    <div
                      key={score}
                      className={`h-1.5 w-5 rounded-full ${passwordScore >= score
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

          <Button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
            disabled={isSubmitting || !isEmailValid || (!login && !isPasswordValid)}
            type="button"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{login ? 'Logging in...' : 'Registering...'}</span>
              </div>
            ) : (
              <span>{login ? "Login" : "Register"}</span>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <div className="text-sm text-muted-foreground">
            {login ? "Don't have an account? " : "Already have an account? "}
            <Link href={login ? 'register' : 'login'} className="text-primary hover:underline font-medium">
              {login ? "Register" : "Log in"}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default Authentication;