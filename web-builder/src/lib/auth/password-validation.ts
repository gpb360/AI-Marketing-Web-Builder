/**
 * Enterprise-Grade Password Validation System
 * Comprehensive password security with real-time feedback
 */

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100
  feedback: string[];
  warnings: string[];
  suggestions: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength?: number;
  disallowCommonPasswords: boolean;
  disallowPersonalInfo: boolean;
  minUniqueChars?: number;
}

// Enterprise-grade password policy
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  disallowCommonPasswords: true,
  disallowPersonalInfo: true,
  minUniqueChars: 4,
};

// Common passwords blacklist (top 100)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', 'welcome', 'admin', 'password123',
  'letmein', 'monkey', '1234567890', 'qwerty', 'abc123', 'Password',
  '123123', 'welcome123', 'admin123', 'password1', '12345678', 'qwerty123',
  'iloveyou', 'princess', 'hello', 'freedom', 'whatever', 'passw0rd',
  'master', 'dragon', 'trustno1', '654321', 'jordan23', 'harley',
]);

const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export class PasswordValidator {
  private policy: PasswordPolicy;

  constructor(policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY) {
    this.policy = policy;
  }

  /**
   * Validate password against policy with detailed feedback
   */
  validate(password: string, userInfo?: { email?: string; firstName?: string; lastName?: string }): PasswordValidationResult {
    const result: PasswordValidationResult = {
      isValid: false,
      score: 0,
      feedback: [],
      warnings: [],
      suggestions: [],
    };

    // Basic length validation
    if (password.length < this.policy.minLength) {
      result.feedback.push(`Password must be at least ${this.policy.minLength} characters long`);
      return result;
    }

    let score = 0;
    const feedback: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Character requirements
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = new RegExp(`[${this.escapeRegex(SPECIAL_CHARS)}]`).test(password);

    if (this.policy.requireUppercase && !hasUppercase) {
      feedback.push('Password must contain at least one uppercase letter');
    } else if (hasUppercase) {
      score += 15;
    }

    if (this.policy.requireLowercase && !hasLowercase) {
      feedback.push('Password must contain at least one lowercase letter');
    } else if (hasLowercase) {
      score += 15;
    }

    if (this.policy.requireNumbers && !hasNumbers) {
      feedback.push('Password must contain at least one number');
    } else if (hasNumbers) {
      score += 15;
    }

    if (this.policy.requireSpecialChars && !hasSpecialChars) {
      feedback.push('Password must contain at least one special character (!@#$%^&*...)');
    } else if (hasSpecialChars) {
      score += 20;
    }

    if (feedback.length > 0) {
      result.feedback = feedback;
      result.score = Math.max(score - 20, 0);
      return result;
    }

    // Advanced security checks
    score += this.calculateComplexityScore(password);
    
    // Common passwords check
    if (this.policy.disallowCommonPasswords && COMMON_PASSWORDS.has(password.toLowerCase())) {
      feedback.push('This password is commonly used and easily guessable');
      score = Math.max(score - 30, 0);
    }

    // Personal information check
    if (this.policy.disallowPersonalInfo && userInfo) {
      const personalInfoCheck = this.checkPersonalInfo(password, userInfo);
      if (personalInfoCheck.hasPersonalInfo) {
        warnings.push('Password should not contain personal information');
        score = Math.max(score - 15, 0);
      }
    }

    // Pattern checks
    const patternCheck = this.checkPatterns(password);
    if (patternCheck.hasPatterns) {
      warnings.push(...patternCheck.warnings);
      suggestions.push(...patternCheck.suggestions);
      score = Math.max(score - patternCheck.penalty, 0);
    }

    // Generate improvement suggestions
    if (score < 70) {
      suggestions.push(...this.generateSuggestions(password, score));
    }

    result.score = Math.min(score, 100);
    result.isValid = result.score >= 60 && feedback.length === 0;
    result.feedback = feedback;
    result.warnings = warnings;
    result.suggestions = suggestions;

    return result;
  }

  private calculateComplexityScore(password: string): number {
    let score = 0;

    // Length bonus
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character diversity
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = new RegExp(`[${this.escapeRegex(SPECIAL_CHARS)}]`).test(password);

    const diversity = [hasUpper, hasLower, hasNumbers, hasSpecial].filter(Boolean).length;
    score += diversity * 5;

    return Math.min(score, 35);
  }

  private checkPersonalInfo(password: string, userInfo: any): { hasPersonalInfo: boolean } {
    const passwordLower = password.toLowerCase();
    
    if (userInfo.email) {
      const emailParts = userInfo.email.toLowerCase().split('@')[0];
      if (passwordLower.includes(emailParts) && emailParts.length > 3) {
        return { hasPersonalInfo: true };
      }
    }

    if (userInfo.firstName && passwordLower.includes(userInfo.firstName.toLowerCase())) {
      return { hasPersonalInfo: true };
    }

    if (userInfo.lastName && passwordLower.includes(userInfo.lastName.toLowerCase())) {
      return { hasPersonalInfo: true };
    }

    return { hasPersonalInfo: false };
  }

  private checkPatterns(password: string): { hasPatterns: boolean; warnings: string[]; suggestions: string[]; penalty: number } {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let penalty = 0;

    // Sequential characters
    if (this.hasSequentialChars(password)) {
      warnings.push('Contains sequential characters');
      suggestions.push('Avoid sequences like "123" or "abc"');
      penalty += 10;
    }

    // Repeated characters
    const repeatedCheck = this.checkRepeatedChars(password);
    if (repeatedCheck.hasRepeated) {
      warnings.push('Too many repeated characters');
      suggestions.push('Use more variety in your characters');
      penalty += repeatedCheck.penalty;
    }

    return {
      hasPatterns: warnings.length > 0,
      warnings,
      suggestions,
      penalty,
    };
  }

  private hasSequentialChars(password: string): boolean {
    const sequences = [
      '0123456789',
      'abcdefghijklmnopqrstuvwxyz',
      'qwertyuiopasdfghjklzxcvbnm',
    ];

    return sequences.some(seq => {
      for (let i = 0; i <= seq.length - 3; i++) {
        const subseq = seq.substring(i, i + 3);
        if (password.toLowerCase().includes(subseq)) {
          return true;
        }
      }
      return false;
    });
  }

  private checkRepeatedChars(password: string): { hasRepeated: boolean; penalty: number } {
    let maxRepeat = 0;
    let currentRepeat = 1;
    
    for (let i = 1; i < password.length; i++) {
      if (password[i] === password[i - 1]) {
        currentRepeat++;
      } else {
        maxRepeat = Math.max(maxRepeat, currentRepeat);
        currentRepeat = 1;
      }
    }
    maxRepeat = Math.max(maxRepeat, currentRepeat);

    if (maxRepeat >= 3) {
      return { hasRepeated: true, penalty: Math.min(maxRepeat * 3, 15) };
    }

    return { hasRepeated: false, penalty: 0 };
  }

  private generateSuggestions(password: string, currentScore: number): string[] {
    const suggestions: string[] = [];

    if (currentScore < 30) {
      suggestions.push('Use a longer password with mixed characters');
      suggestions.push('Consider using a passphrase with multiple words');
    } else if (currentScore < 50) {
      suggestions.push('Add more character variety');
      suggestions.push('Make your password longer for better security');
    } else {
      suggestions.push('Consider making it a bit longer');
    }

    return suggestions;
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static getStrengthDescription(score: number): { level: string; color: string; description: string } {
    if (score < 30) {
      return { level: 'Very Weak', color: 'red', description: 'Very easily guessable' };
    } else if (score < 50) {
      return { level: 'Weak', color: 'orange', description: 'Weak and vulnerable' };
    } else if (score < 70) {
      return { level: 'Fair', color: 'yellow', description: 'Basic security' };
    } else if (score < 85) {
      return { level: 'Good', color: 'lightgreen', description: 'Good security' };
    } else {
      return { level: 'Excellent', color: 'green', description: 'Excellent security' };
    }
  }
}

export const passwordValidator = new PasswordValidator();