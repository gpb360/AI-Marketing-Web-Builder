/**
 * Advanced Rate Limiting System
 * Multi-strategy rate limiting with intelligent blocking
 */

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: number;
  totalAttempts: number;
  isBlocked: boolean;
  retryAfter?: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDuration: number;
  strategy: 'fixed_window' | 'sliding_window';
}

// Rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    blockDuration: 30 * 60 * 1000, // 30 minutes
    strategy: 'sliding_window' as const,
  },
  REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    blockDuration: 2 * 60 * 60 * 1000, // 2 hours
    strategy: 'fixed_window' as const,
  },
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    blockDuration: 24 * 60 * 60 * 1000, // 24 hours
    strategy: 'fixed_window' as const,
  },
  API_GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 100,
    blockDuration: 15 * 60 * 1000, // 15 minutes
    strategy: 'fixed_window' as const,
  },
} as const;

interface AttemptRecord {
  timestamp: number;
  success: boolean;
}

export class RateLimiter {
  private attempts: Map<string, AttemptRecord[]> = new Map();
  private blocks: Map<string, { expiresAt: number }> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.startCleanup();
  }

  async checkLimit(identifier: string, options: { success?: boolean } = {}): Promise<RateLimitResult> {
    const now = Date.now();
    
    // Check if blocked
    const blockInfo = this.blocks.get(identifier);
    if (blockInfo && blockInfo.expiresAt > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: blockInfo.expiresAt,
        totalAttempts: this.getAttemptCount(identifier),
        isBlocked: true,
        retryAfter: Math.ceil((blockInfo.expiresAt - now) / 1000),
      };
    }

    // Remove expired block
    if (blockInfo && blockInfo.expiresAt <= now) {
      this.blocks.delete(identifier);
    }

    const currentAttempts = this.getRelevantAttempts(identifier, now);
    const limitResult = this.calculateLimit(currentAttempts, now);
    
    // Record attempt if specified
    if (options.success !== undefined) {
      this.recordAttempt(identifier, { timestamp: now, success: options.success });
      limitResult.totalAttempts++;
      
      // Block if limit exceeded and attempt failed
      if (!limitResult.allowed || (limitResult.remainingAttempts === 0 && !options.success)) {
        this.blockIdentifier(identifier, now);
        limitResult.isBlocked = true;
        limitResult.retryAfter = Math.ceil(this.config.blockDuration / 1000);
      }
    }

    return limitResult;
  }

  private recordAttempt(identifier: string, attempt: AttemptRecord): void {
    if (!this.attempts.has(identifier)) {
      this.attempts.set(identifier, []);
    }
    
    const attempts = this.attempts.get(identifier)!;
    attempts.push(attempt);
  }

  private getRelevantAttempts(identifier: string, currentTime: number): AttemptRecord[] {
    const attempts = this.attempts.get(identifier) || [];
    const cutoff = currentTime - this.config.windowMs;
    return attempts.filter(attempt => attempt.timestamp >= cutoff);
  }

  private calculateLimit(attempts: AttemptRecord[], currentTime: number): RateLimitResult {
    const totalAttempts = attempts.length;
    
    if (this.config.strategy === 'fixed_window') {
      return this.fixedWindowStrategy(attempts, currentTime);
    } else {
      return this.slidingWindowStrategy(attempts, currentTime);
    }
  }

  private fixedWindowStrategy(attempts: AttemptRecord[], currentTime: number): RateLimitResult {
    const windowStart = Math.floor(currentTime / this.config.windowMs) * this.config.windowMs;
    const windowAttempts = attempts.filter(a => a.timestamp >= windowStart);
    
    const allowed = windowAttempts.length < this.config.maxAttempts;
    const remaining = Math.max(0, this.config.maxAttempts - windowAttempts.length);
    const resetTime = windowStart + this.config.windowMs;
    
    return {
      allowed,
      remainingAttempts: remaining,
      resetTime,
      totalAttempts: attempts.length,
      isBlocked: false,
    };
  }

  private slidingWindowStrategy(attempts: AttemptRecord[], currentTime: number): RateLimitResult {
    const windowStart = currentTime - this.config.windowMs;
    const windowAttempts = attempts.filter(a => a.timestamp >= windowStart);
    
    const allowed = windowAttempts.length < this.config.maxAttempts;
    const remaining = Math.max(0, this.config.maxAttempts - windowAttempts.length);
    const oldestAttempt = windowAttempts[0];
    const resetTime = oldestAttempt ? oldestAttempt.timestamp + this.config.windowMs : currentTime + this.config.windowMs;
    
    return {
      allowed,
      remainingAttempts: remaining,
      resetTime,
      totalAttempts: attempts.length,
      isBlocked: false,
    };
  }

  private blockIdentifier(identifier: string, currentTime: number): void {
    this.blocks.set(identifier, {
      expiresAt: currentTime + this.config.blockDuration,
    });
  }

  private getAttemptCount(identifier: string): number {
    return this.attempts.get(identifier)?.length || 0;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
    this.blocks.delete(identifier);
  }

  private startCleanup(): void {
    const cleanupInterval = Math.min(this.config.windowMs, 5 * 60 * 1000);
    
    setInterval(() => {
      const now = Date.now();
      const cutoff = now - this.config.windowMs - this.config.blockDuration;
      
      // Clean old attempts
      for (const [identifier, attempts] of this.attempts.entries()) {
        const relevantAttempts = attempts.filter(a => a.timestamp > cutoff);
        if (relevantAttempts.length === 0) {
          this.attempts.delete(identifier);
        } else {
          this.attempts.set(identifier, relevantAttempts);
        }
      }
      
      // Clean expired blocks
      for (const [identifier, blockInfo] of this.blocks.entries()) {
        if (blockInfo.expiresAt <= now) {
          this.blocks.delete(identifier);
        }
      }
    }, cleanupInterval);
  }
}

export class RateLimiterFactory {
  private static instances: Map<string, RateLimiter> = new Map();

  static getInstance(type: keyof typeof RATE_LIMIT_CONFIGS): RateLimiter {
    if (!this.instances.has(type)) {
      const config = RATE_LIMIT_CONFIGS[type];
      this.instances.set(type, new RateLimiter(config));
    }
    return this.instances.get(type)!;
  }
}

// Export instances
export const loginRateLimiter = RateLimiterFactory.getInstance('LOGIN');
export const registerRateLimiter = RateLimiterFactory.getInstance('REGISTER');
export const passwordResetRateLimiter = RateLimiterFactory.getInstance('PASSWORD_RESET');
export const apiRateLimiter = RateLimiterFactory.getInstance('API_GENERAL');