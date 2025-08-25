'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import theme from '@/lib/theme';

const { luxuryTheme } = theme;

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className={`text-lg ${luxuryTheme.colors.text.secondary}`}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className={`${luxuryTheme.components.authForm.card} mb-8`}>
          <CardHeader>
            <CardTitle className={luxuryTheme.colors.text.primary}>
              AI Marketing Web Builder Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-6 ${luxuryTheme.colors.text.secondary}`}>
            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                1. Information We Collect
              </h2>
              <p className="leading-relaxed mb-3">
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
              </p>
              <div className="ml-4">
                <h3 className={`text-xl font-medium ${luxuryTheme.colors.text.primary} mb-2`}>
                  Personal Information
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Profile information and preferences</li>
                  <li>Payment and billing information</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                2. How We Use Your Information
              </h2>
              <p className="leading-relaxed mb-3">
                We use the information we collect to provide, maintain, and improve our services, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Creating and managing your account</li>
                <li>Providing customer support and responding to your requests</li>
                <li>Processing payments and transactions</li>
                <li>Sending you technical notices, updates, and administrative messages</li>
                <li>Personalizing your experience with AI-generated content recommendations</li>
                <li>Analyzing usage patterns to improve our platform</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                3. AI and Machine Learning
              </h2>
              <p className="leading-relaxed mb-3">
                Our platform uses artificial intelligence and machine learning technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Content generation and website customization</li>
                <li>Template recommendations based on your preferences</li>
                <li>Workflow automation suggestions</li>
                <li>Performance optimization insights</li>
              </ul>
              <p className="leading-relaxed mt-3">
                We may use anonymized and aggregated data to train and improve our AI models, but we never use your personal information for this purpose without explicit consent.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                4. Information Sharing and Disclosure
              </h2>
              <p className="leading-relaxed mb-3">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>With service providers who assist us in operating our platform</li>
                <li>To comply with legal obligations or protect our rights</li>
                <li>In connection with a business transaction (merger, acquisition, etc.)</li>
                <li>With your explicit consent for specific purposes</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                5. Data Security
              </h2>
              <p className="leading-relaxed mb-3">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure hosting and infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                6. Cookies and Tracking Technologies
              </h2>
              <p className="leading-relaxed mb-3">
                We use cookies and similar tracking technologies to enhance your experience on our platform:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Essential cookies for authentication and security</li>
                <li>Performance cookies to analyze platform usage</li>
                <li>Preference cookies to remember your settings</li>
                <li>Marketing cookies to provide relevant content recommendations</li>
              </ul>
              <p className="leading-relaxed mt-3">
                You can control cookie preferences through your browser settings, though this may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                7. Your Rights and Choices
              </h2>
              <p className="leading-relaxed mb-3">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and review your personal information</li>
                <li>Update or correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of marketing communications</li>
                <li>Restrict or object to certain processing activities</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                8. Data Retention
              </h2>
              <p className="leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will delete or anonymize your personal information within 30 days, except where retention is required by law.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                9. International Data Transfers
              </h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                10. Children's Privacy
              </h2>
              <p className="leading-relaxed">
                Our services are not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                11. Changes to This Policy
              </h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${luxuryTheme.colors.text.primary} mb-3`}>
                12. Contact Us
              </h2>
              <p className="leading-relaxed mb-3">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="ml-4">
                <p className="leading-relaxed">
                  Email: privacy@aimarketingwebbuilder.com<br />
                  Address: [Your Company Address]<br />
                  Phone: [Your Contact Number]
                </p>
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Link href="/auth/register">
            <Button className={`${luxuryTheme.colors.button.primary} ${luxuryTheme.colors.button.primaryHover} px-6 py-3 rounded-lg transition-all duration-200`}>
              Back to Registration
            </Button>
          </Link>
          <Link href="/terms">
            <Button variant="outline" className={`${luxuryTheme.colors.button.outline} ${luxuryTheme.colors.button.outlineHover} px-6 py-3 rounded-lg transition-all duration-200`}>
              View Terms & Conditions
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}