/**
 * SendGrid Email Service for ALINEA
 * Handles weekly reports, alerts, and transactional emails
 */

import { EmailData, SGMailMessage } from '@sendgrid/mail';

const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface WeeklyReportData {
  recipientEmail: string;
  recipientName: string;
  walletAddress: string;
  weekStart: string;
  weekEnd: string;
  totalTrades: number;
  tradesCompleted: number;
  tradesBlocked: number;
  avgEmotionalScore: number;
  successRate: number;
  bestDecision: number;
  worstDecision: number;
  topSignal: string;
  achievements: string[];
}

interface AlertData {
  recipientEmail: string;
  recipientName: string;
  alertType: 'high_risk_trade' | 'achievement_unlocked' | 'market_crash';
  message: string;
  actionUrl: string;
}

/**
 * Send weekly report email
 */
export async function sendWeeklyReport(data: WeeklyReportData): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[SendGrid] API key not configured');
    return;
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; padding: 20px; border-radius: 12px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #9d4edd; padding-bottom: 20px;">
        <h1 style="margin: 0; background: linear-gradient(135deg, #9d4edd 0%, #c77dff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px;">ALINEA</h1>
        <p style="margin: 10px 0 0; color: #999;">Your Weekly Trading Report</p>
      </div>

      <!-- Summary -->
      <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #9d4edd; margin-top: 0;">Week of ${data.weekStart} to ${data.weekEnd}</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
          <div style="background: linear-gradient(135deg, rgba(157, 78, 221, 0.1), rgba(199, 125, 255, 0.05)); padding: 15px; border-radius: 6px; border-left: 3px solid #9d4edd;">
            <p style="margin: 0; font-size: 12px; color: #999;">Total Trades</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #c77dff;">${data.totalTrades}</p>
          </div>
          <div style="background: linear-gradient(135deg, rgba(90, 24, 154, 0.1), rgba(157, 78, 221, 0.05)); padding: 15px; border-radius: 6px; border-left: 3px solid #5a189a;">
            <p style="margin: 0; font-size: 12px; color: #999;">Success Rate</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #9d4edd;">${data.successRate}%</p>
          </div>
          <div style="background: linear-gradient(135deg, rgba(90, 24, 154, 0.1), rgba(157, 78, 221, 0.05)); padding: 15px; border-radius: 6px; border-left: 3px solid #5a189a;">
            <p style="margin: 0; font-size: 12px; color: #999;">Avg Emotional Score</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #9d4edd;">${data.avgEmotionalScore}</p>
          </div>
          <div style="background: linear-gradient(135deg, rgba(157, 78, 221, 0.1), rgba(199, 125, 255, 0.05)); padding: 15px; border-radius: 6px; border-left: 3px solid #9d4edd;">
            <p style="margin: 0; font-size: 12px; color: #999;">Trades Blocked</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #c77dff;">${data.tradesBlocked}</p>
          </div>
        </div>
      </div>

      <!-- Insights -->
      <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #9d4edd; margin-top: 0;">Key Insights</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #ccc;">
          <li>Best Decision Score: <strong style="color: #c77dff;">${data.bestDecision}</strong></li>
          <li>Worst Decision Score: <strong style="color: #c77dff;">${data.worstDecision}</strong></li>
          <li>Top Trading Signal: <strong style="color: #c77dff;">${data.topSignal}</strong></li>
          <li>Completed Trades: <strong style="color: #c77dff;">${data.tradesCompleted}</strong></li>
        </ul>
      </div>

      ${
        data.achievements.length > 0
          ? `
      <!-- Achievements -->
      <div style="background: linear-gradient(135deg, rgba(157, 78, 221, 0.15), rgba(199, 125, 255, 0.05)); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #9d4edd;">
        <h3 style="color: #c77dff; margin-top: 0; display: flex; align-items: center; gap: 8px;">
          🏆 New Achievements
        </h3>
        <p style="margin: 0; color: #ccc;">${data.achievements.join(', ')}</p>
      </div>
      `
          : ''
      }

      <!-- CTA -->
      <div style="text-align: center; margin: 30px 0 20px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://alinea.app'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #9d4edd, #c77dff); color: #0a0a0a; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; transition: transform 0.3s;">
          View Full Dashboard
        </a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #666;">
        <p style="margin: 5px 0;">
          This is an automated report from ALINEA - Your Emotional Trading Guard
        </p>
        <p style="margin: 5px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://alinea.app'}/settings/emails" style="color: #9d4edd; text-decoration: none;">
            Manage Email Preferences
          </a>
        </p>
      </div>
    </div>
  `;

  const msg = {
    to: data.recipientEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@alinea.app',
    subject: `Your ALINEA Weekly Report (${data.weekStart} to ${data.weekEnd})`,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log('[SendGrid] Weekly report sent to', data.recipientEmail);
  } catch (error) {
    console.error('[SendGrid] Error sending weekly report:', error);
    throw error;
  }
}

/**
 * Send alert email
 */
export async function sendAlert(data: AlertData): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[SendGrid] API key not configured');
    return;
  }

  const subjects: Record<string, string> = {
    high_risk_trade: '⚠️ High Risk Trade Detected - ALINEA Alert',
    achievement_unlocked: '🏆 Achievement Unlocked - ALINEA',
    market_crash: '📉 Market Crash Alert - ALINEA',
  };

  const msg = {
    to: data.recipientEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@alinea.app',
    subject: subjects[data.alertType],
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; padding: 20px; border-radius: 12px;">
        <h1 style="color: #9d4edd; margin-top: 0;">Alert from ALINEA</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #ccc;">${data.message}</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${data.actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #9d4edd, #c77dff); color: #0a0a0a; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Take Action
          </a>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 30px;">
          Powered by ALINEA - Your Emotional Trading Guard
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('[SendGrid] Alert sent to', data.recipientEmail);
  } catch (error) {
    console.error('[SendGrid] Error sending alert:', error);
    throw error;
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[SendGrid] API key not configured');
    return;
  }

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@alinea.app',
    subject: 'Verify Your Email - ALINEA',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; padding: 20px; border-radius: 12px;">
        <h1 style="color: #9d4edd;">Verify Your Email</h1>
        <p style="color: #ccc;">Click the button below to verify your email address.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #9d4edd, #c77dff); color: #0a0a0a; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p style="font-size: 12px; color: #666;">This link expires in 24 hours.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('[SendGrid] Verification email sent to', email);
  } catch (error) {
    console.error('[SendGrid] Error sending verification email:', error);
    throw error;
  }
}

export default {
  sendWeeklyReport,
  sendAlert,
  sendVerificationEmail,
};
