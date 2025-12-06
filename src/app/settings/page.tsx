"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { User, Lock, Upload, Loader2, Check, X } from "lucide-react";
import { supabaseClient } from "@/lib/supabase-client";
import Image from "next/image";

export default function SettingsPage() {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [profileImage, setProfileImage] = useState<string | null>(user?.user_metadata?.avatar_url || null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageStatus, setImageStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordStatus(null);

        if (newPassword !== confirmPassword) {
            setPasswordStatus({ type: "error", message: "Las contraseñas no coinciden" });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordStatus({ type: "error", message: "La contraseña debe tener al menos 6 caracteres" });
            return;
        }

        setIsChangingPassword(true);

        try {
            const { error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) {
                setPasswordStatus({ type: "error", message: error.message });
            } else {
                setPasswordStatus({ type: "success", message: "Contraseña actualizada exitosamente" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            setPasswordStatus({ type: "error", message: "Error al cambiar la contraseña" });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setImageStatus({ type: "error", message: "Por favor selecciona una imagen válida" });
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setImageStatus({ type: "error", message: "La imagen debe ser menor a 2MB" });
            return;
        }

        setIsUploadingImage(true);
        setImageStatus(null);

        try {
            // Create unique file name
            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabaseClient.storage
                .from("profile-images")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabaseClient.storage
                .from("profile-images")
                .getPublicUrl(filePath);

            // Update user metadata
            const { error: updateError } = await supabaseClient.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            setProfileImage(publicUrl);
            setImageStatus({ type: "success", message: "Foto de perfil actualizada" });
        } catch (error: any) {
            console.error("Error uploading image:", error);
            setImageStatus({ type: "error", message: error.message || "Error al subir la imagen" });
        } finally {
            setIsUploadingImage(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto max-w-2xl p-6 space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-muted-foreground">
                        Administra tu cuenta y preferencias
                    </p>
                </div>

                {/* Profile Picture Section */}
                <div className="border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Foto de Perfil</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            {profileImage ? (
                                <Image
                                    src={profileImage}
                                    alt="Profile"
                                    width={80}
                                    height={80}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-10 w-10 text-primary" />
                                </div>
                            )}
                            {isUploadingImage && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-2">
                            <label
                                htmlFor="profile-image"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                            >
                                <Upload className="h-4 w-4" />
                                Subir Foto
                            </label>
                            <input
                                id="profile-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={isUploadingImage}
                            />
                            <p className="text-xs text-muted-foreground">
                                JPG, PNG o GIF. Máximo 2MB.
                            </p>
                        </div>
                    </div>

                    {imageStatus && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${imageStatus.type === "success"
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}>
                            {imageStatus.type === "success" ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <X className="h-4 w-4" />
                            )}
                            {imageStatus.message}
                        </div>
                    )}
                </div>

                {/* Account Info Section */}
                <div className="border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Información de la Cuenta</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Correo Electrónico
                        </label>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Password Change Section */}
                <div className="border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Cambiar Contraseña</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="new-password" className="text-sm font-medium">
                                Nueva Contraseña
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                placeholder="Ingresa tu nueva contraseña"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirm-password" className="text-sm font-medium">
                                Confirmar Contraseña
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                placeholder="Confirma tu nueva contraseña"
                                required
                            />
                        </div>

                        {passwordStatus && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${passwordStatus.type === "success"
                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                                }`}>
                                {passwordStatus.type === "success" ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                                {passwordStatus.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isChangingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isChangingPassword ? "Actualizando..." : "Actualizar Contraseña"}
                        </button>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
