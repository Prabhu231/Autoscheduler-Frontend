'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { motion } from "framer-motion";
import ValidationItem from "@/components/authentication/Validation";

export default function AccountSettings() {
    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [passwordScore, setPasswordScore] = useState(0);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Support form state
    const [supportTitle, setSupportTitle] = useState("");
    const [supportMessage, setSupportMessage] = useState("");
    const [supportCategory, setSupportCategory] = useState("general");
    const [supportSuccess, setSupportSuccess] = useState(false);
    const [supportError, setSupportError] = useState("");

    // Password validation
    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    // Calculate password strength score
    useEffect(() => {
        let score = 0;
        if (hasMinLength) score++;
        if (hasUpperCase) score++;
        if (hasLowerCase) score++;
        if (hasNumber) score++;
        if (hasSpecialChar) score++;
        setPasswordScore(score);
    }, [newPassword, hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar]);

    // Handle password change submission
    const handlePasswordChange = async () => {
        setPasswordError("");
        setPasswordSuccess(false);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords don't match");
            return;
        }

        if (!isPasswordValid) {
            setPasswordError("Password must meet all requirements");
            return;
        }

        try {

            const res = await api.post('/reset-password/', {
                currentPassword,
                newPassword,
                app: 1
            })

            console.log(res)
            
            setPasswordSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordScore(0);
        } catch (err) {
            if(isAxiosError(err)) {
                setPasswordError(err.response?.data?.error)
            } else {
            setPasswordError("Failed to update password. Please try again.");
            }
        }
    };

    // Handle support submission
    const handleSupportSubmit = () => {
        setSupportError("");
        setSupportSuccess(false);

        
        if (!supportTitle.trim() || !supportMessage.trim()) {
            setSupportError("Please provide both title and message");
            return;
        }

        try {
            api.post('/support/', {
                supportTitle,
                supportMessage,
                supportCategory
            })
        } catch {
            setSupportError("Failed to submit support request. Please try again.");
        } finally {
            setSupportSuccess(true);
            setSupportTitle("");
            setSupportMessage("");
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="bg-purple-600 text-white py-4 px-6 rounded-t-lg shadow-md flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-semibold">Settings</h1>
                    </div>
                </div>

                <Tabs defaultValue="password" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 bg-white">
                        <TabsTrigger value="password" className="text-sm bg-white data-[state=active]:bg-purple-600 data-[state=active]:text-white">Change Password</TabsTrigger>
                        <TabsTrigger value="support" className="text-sm bg-white data-[state=active]:bg-purple-600 data-[state=active]:text-white">Support</TabsTrigger>
                    </TabsList>

                    <TabsContent value="password" className="mt-6">
                        <Card className="border-white-200 bg-white">
                            <CardHeader className="bg-white-50">
                                <CardTitle className="text-purple-900">Change Password</CardTitle>
                               <CardDescription>Update your account password here.</CardDescription>
                            </CardHeader>
                            {passwordError && (
                                <Alert variant="destructive" className="mx-6 w-5.5xl border-red-300 bg-red-50">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{passwordError}</AlertDescription>
                                </Alert>
                            )}
                            {passwordSuccess && (
                                        <Alert className="mx-6 w-5.5xl border-green-300 bg-green-50">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <AlertTitle className="text-green-800">Success</AlertTitle>
                                            <AlertDescription className="text-green-700">
                                                Your password has been updated successfully.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                            <CardContent className="pt-6">
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="current-password" className="text-purple-900">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="current-password"
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 pr-10"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid gap-3">
                                        <Label htmlFor="new-password" className="text-purple-900">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="new-password"
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                onFocus={() => setPasswordFocused(true)}
                                                onBlur={() => setPasswordFocused(false)}
                                                className={`border-purple-200 focus:border-purple-400 focus:ring-purple-400 pr-10 ${
                                                    !newPassword
                                                        ? "border-purple-200"
                                                        : isPasswordValid
                                                            ? "border-green-500 focus:ring-green-500"
                                                            : "border-red-500 focus:ring-red-500"
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>

                                        {(passwordFocused || newPassword.length > 0) && (
                                            <motion.div
                                                className="mt-3 space-y-1 rounded-lg d p-3 bg-white"
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

                                        {newPassword && (
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

                                    <div className="grid gap-3">
                                        <Label htmlFor="confirm-password" className="text-purple-900">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirm-password"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`border-purple-200 focus:border-purple-400 focus:ring-purple-400 pr-10 ${
                                                    !confirmPassword
                                                        ? "border-purple-200"
                                                        : confirmPassword === newPassword && newPassword !== ""
                                                            ? "border-green-500 focus:ring-green-500"
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
                                        {confirmPassword && confirmPassword !== newPassword && (
                                            <p className="text-red-500 text-xs mt-1">Passwords does not match</p>
                                        )}
                                    </div>

                                    
                                </div>

                                <div className="mt-6">
                                    <Button
                                        onClick={handlePasswordChange}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                        disabled={!currentPassword || !isPasswordValid || confirmPassword !== newPassword}
                                    >
                                        Update Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="support" className="mt-6">
                        <Card className="border-white-200 bg-white">
                            <CardHeader className="bg-white-50">
                                <CardTitle className="text-purple-900">Support Request</CardTitle>
                                <CardDescription>Submit your issue or question to our support team.</CardDescription>
                            </CardHeader>
                            {supportSuccess && (
                                        <Alert className="mx-6 w-5.5xl border-green-300 bg-green-50">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <AlertTitle className="text-green-800">Success</AlertTitle>
                                            <AlertDescription className="text-green-700">
                                                Your support request has been submitted successfully. Our team will respond shortly.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                            {supportError && (
                                        <Alert variant="destructive" className="mx-6 w-5.5xl border-red-300 bg-red-50">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Error</AlertTitle>
                                            <AlertDescription>{supportError}</AlertDescription>
                                        </Alert>
                                    )}
                            <CardContent className="pt-6">
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="support-category" className="text-purple-900">Category</Label>
                                        <select
                                            id="support-category"
                                            value={supportCategory}
                                            onChange={(e) => setSupportCategory(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-purple-200 bg-white-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                                        >
                                            <option value="general">General Question</option>
                                            <option value="technical">Technical Issue</option>
                                            <option value="feature">Feature Request</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-3">
                                        <Label htmlFor="support-title" className="text-purple-900">Title</Label>
                                        <Input
                                            id="support-title"
                                            placeholder="Brief description of your issue"
                                            value={supportTitle}
                                            onChange={(e) => setSupportTitle(e.target.value)}
                                            className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                                        />
                                    </div>

                                    <div className="grid gap-3">
                                        <Label htmlFor="support-message" className="text-purple-900">Message</Label>
                                        <Textarea
                                            id="support-message"
                                            placeholder="Describe your issue in detail"
                                            rows={5}
                                            value={supportMessage}
                                            onChange={(e) => setSupportMessage(e.target.value)}
                                            className="resize-none border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                                        />
                                    </div>

                                    

                                    
                                </div>

                                <div className="mt-6">
                                    <Button
                                        onClick={handleSupportSubmit}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        Submit Request
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}