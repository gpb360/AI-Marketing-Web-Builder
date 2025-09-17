'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { LoginCredentials } from '@/lib/api/types';
import theme from '@/lib/theme';

const { luxuryTheme, themeUtils } = theme;

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const credentials: LoginCredentials = { email, password };
      await login(credentials);
      // Redirect will happen via useEffect after isAuthenticated changes
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={luxuryTheme.components.authForm.container}>
      <div className={luxuryTheme.components.authForm.wrapper}>
        <div className={luxuryTheme.components.authForm.header}>
          <h2 className={luxuryTheme.components.authForm.title}>
            Sign in to your account
          </h2>
          <p className={`mt-2 text-sm ${luxuryTheme.colors.text.secondary}`}>
            Or{' '}
            <Link
              href="/auth/register"
              className={luxuryTheme.components.authForm.link}
            >
              create a new account
            </Link>
          </p>
        </div>

        <Card className={`${luxuryTheme.components.authForm.card} ${luxuryTheme.components.authForm.cardHover}`}>
          <CardHeader className="text-center">
            <CardTitle className={luxuryTheme.colors.text.primary}>Welcome Back</CardTitle>
            <CardDescription className={luxuryTheme.colors.text.secondary}>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className={luxuryTheme.colors.status.error.full}>
                  <div className={`text-sm ${luxuryTheme.colors.status.error.text}`}>{error}</div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className={luxuryTheme.colors.text.primary}>Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  className={luxuryTheme.components.input.full}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={luxuryTheme.colors.text.primary}>Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  className={luxuryTheme.components.input.full}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className={luxuryTheme.components.authForm.link}
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className={`w-full ${themeUtils.getButtonClasses('primary')}`}
                disabled={isSubmitting || !email || !password}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}