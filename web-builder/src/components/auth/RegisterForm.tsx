'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { RegisterData } from '@/lib/api/types';
import theme from '@/lib/theme';

const { luxuryTheme, themeUtils } = theme;

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('All fields are required.');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    
    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userData: RegisterData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      };
      
      await register(userData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={luxuryTheme.components.authForm.container}>
      <div className={luxuryTheme.components.authForm.wrapper}>
        <div className={luxuryTheme.components.authForm.header}>
          <h2 className={luxuryTheme.components.authForm.title}>
            Create your account
          </h2>
          <p className={`mt-2 text-sm ${luxuryTheme.colors.text.secondary}`}>
            Or{' '}
            <Link
              href="/auth/login"
              className={luxuryTheme.components.authForm.link}
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card className={`${luxuryTheme.components.authForm.card} ${luxuryTheme.components.authForm.cardHover}`}>
          <CardHeader className="text-center">
            <CardTitle className={luxuryTheme.colors.text.primary}>Join AI Marketing Pro</CardTitle>
            <CardDescription className={luxuryTheme.colors.text.secondary}>
              Create a new account to get started with intelligent marketing
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className={luxuryTheme.colors.status.error.full}>
                  <div className={`text-sm ${luxuryTheme.colors.status.error.text}`}>{error}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className={luxuryTheme.colors.text.primary}>First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    disabled={isSubmitting}
                    className={luxuryTheme.components.input.full}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className={luxuryTheme.colors.text.primary}>Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    disabled={isSubmitting}
                    className={luxuryTheme.components.input.full}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className={luxuryTheme.colors.text.primary}>Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Create a password (min. 8 characters)"
                  disabled={isSubmitting}
                  className={luxuryTheme.components.input.full}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className={luxuryTheme.colors.text.primary}>Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                  className={luxuryTheme.components.input.full}
                />
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleChange('acceptTerms', checked as boolean)}
                  disabled={isSubmitting}
                  className="mt-1"
                />
                <Label htmlFor="acceptTerms" className={`text-sm leading-relaxed ${luxuryTheme.colors.text.secondary}`}>
                  I agree to the{' '}
                  <Link href="/terms" className={luxuryTheme.components.authForm.link}>
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className={luxuryTheme.components.authForm.link}>
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className={`w-full ${themeUtils.getButtonClasses('primary')}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}