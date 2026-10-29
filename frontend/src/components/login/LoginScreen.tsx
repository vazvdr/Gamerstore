'use client';
import { useState } from 'react';
import LoginForm from '@/components/login/LoginForm';
import RegisterForm from '@/components/login/RegisterForm';

export default function LoginScreen() {
    const [isRegistering, setIsRegistering] = useState(false);
    return (
        <main className="flex min-h-screen w-screen items-center justify-center bg-black px-4 py-10 text-white">
            <div className="flex w-full justify-center">
                {isRegistering ? (
                    <RegisterForm onSwitch={() => setIsRegistering(false)} />
                ) : (
                    <LoginForm onSwitch={() => setIsRegistering(true)} />
                )}
            </div>
        </main>
    );
}
