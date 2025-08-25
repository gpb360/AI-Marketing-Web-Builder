'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import theme from '@/lib/theme';

const { luxuryTheme } = theme;

export default function TermsPage() {
  return (
    <div className={`min-h-screen ${luxuryTheme.colors.background.primary}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link 
            href="/auth/register" 
            className={`inline-flex items-center ${luxuryTheme.components.authForm.link} mb-4`}
          >
            ← Back to Registration
          </Link>
          <h1 className={`text-4xl font-bold ${luxuryTheme.colors.text.primary} mb-4`}>
            Terms and Conditions
          </h1>
          <p className={`text-lg ${luxuryTheme.colors.text.secondary}`}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className={`${luxuryTheme.components.authForm.card} mb-8`}>
          <CardHeader>
            <CardTitle className={luxuryTheme.colors.text.primary}>
              AI Marketing Web Builder Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-6 ${luxuryTheme.colors.text.secondary}`}>
            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By accessing and using the AI Marketing Web Builder platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                2. Use License
              </h2>
              <p className="leading-relaxed mb-3">
                Permission is granted to temporarily download one copy of the materials on AI Marketing Web Builder for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                <li>attempt to decompile or reverse engineer any software contained on the platform</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                3. Account Registration and Security
              </h2>
              <p className="leading-relaxed mb-3">
                To access certain features of our service, you must register for an account. When you register for an account, you must provide information that is accurate, complete, and current at all times.
              </p>
              <p className="leading-relaxed">
                You are responsible for safeguarding the password that you use to access the service and for all activities that occur under your account. You agree not to disclose your password to any third party.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                4. AI-Generated Content
              </h2>
              <p className="leading-relaxed mb-3">
                Our platform uses artificial intelligence to generate and customize website content. While we strive for accuracy and relevance, AI-generated content may not always be perfect or suitable for your specific needs.
              </p>
              <p className="leading-relaxed">
                You are responsible for reviewing, editing, and approving all AI-generated content before publication. We are not liable for any consequences arising from the use of AI-generated content.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                5. User Data and Privacy
              </h2>
              <p className="leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices regarding the collection, use, and disclosure of your personal information.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                6. Service Availability
              </h2>
              <p className="leading-relaxed">
                We strive to maintain high service availability, but we do not guarantee that the service will be available at all times. The service may be temporarily unavailable for maintenance, updates, or due to technical difficulties.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                7. Limitation of Liability
              </h2>
              <p className="leading-relaxed">
                In no event shall AI Marketing Web Builder or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this platform.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                8. Governing Law
              </h2>
              <p className="leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which AI Marketing Web Builder operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                9. Changes to Terms
              </h2>
              <p className="leading-relaxed">
                We reserve the right to update or modify these Terms and Conditions at any time without prior notice. Your continued use of the service after any such changes constitutes your acceptance of the new Terms and Conditions.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                10. Contact Information
              </h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at legal@aimarketingwebbuilder.com
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Link href="/auth/register">
            <Button className={`${luxuryTheme.colors.button.primary} ${luxuryTheme.colors.button.primaryHover} px-6 py-3 rounded-lg transition-all duration-200`}>
              Back to Registration
            </Button>
          </Link>
          <Link href="/privacy">
            <Button variant="outline" className={`${luxuryTheme.colors.button.outline} ${luxuryTheme.colors.button.outlineHover} px-6 py-3 rounded-lg transition-all duration-200`}>
              View Privacy Policy
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}