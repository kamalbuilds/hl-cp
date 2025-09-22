'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useRegisterTrader } from '@/hooks/useContract';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Twitter, Send, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RegisterTraderPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { register, isLoading, isSuccess, error } = useRegisterTrader();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    performanceFee: '20',
    twitter: '',
    telegram: '',
    discord: '',
    strategy: '',
    experience: '',
    riskManagement: '',
    targetReturn: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.bio || formData.bio.length < 20) {
      newErrors.bio = 'Bio must be at least 20 characters';
    }

    const fee = parseFloat(formData.performanceFee);
    if (isNaN(fee) || fee < 0 || fee > 50) {
      newErrors.performanceFee = 'Performance fee must be between 0 and 50%';
    }

    if (!formData.strategy) {
      newErrors.strategy = 'Please describe your trading strategy';
    }

    if (!formData.experience) {
      newErrors.experience = 'Please describe your trading experience';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      // Combine strategy info into bio for contract
      const fullBio = `${formData.bio}\n\nStrategy: ${formData.strategy}\nExperience: ${formData.experience}\nRisk Management: ${formData.riskManagement}\nTarget Return: ${formData.targetReturn}`;

      register(
        formData.name,
        fullBio,
        Math.floor(parseFloat(formData.performanceFee) * 100), // Convert to basis points
        formData.twitter,
        formData.telegram,
        formData.discord
      );

      toast.success('Registration submitted!');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Failed to register as trader');
    }
  };

  if (isSuccess) {
    setTimeout(() => {
      router.push(`/traders/${address}`);
    }, 2000);

    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting to your trader profile...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Become a Lead Trader
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your trades, build a following, and earn performance fees
          </p>
        </div>

        {/* Benefits */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Why Become a Lead Trader?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Earn Performance Fees
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Earn up to 50% of profits generated for your copiers
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Build Your Reputation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showcase your trading skills and build a following
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Scale Your Strategy
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Leverage collective capital to amplify your impact
              </p>
            </div>
          </div>
        </Card>

        {/* Registration Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800
                      text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500
                      ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="e.g., CryptoWhale"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio *
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800
                      text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500
                      ${errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    rows={3}
                    placeholder="Tell potential copiers about yourself..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Performance Fee (%) *
                  </label>
                  <input
                    type="number"
                    value={formData.performanceFee}
                    onChange={(e) => setFormData({ ...formData, performanceFee: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800
                      text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500
                      ${errors.performanceFee ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    min="0"
                    max="50"
                    step="1"
                  />
                  {errors.performanceFee && (
                    <p className="mt-1 text-sm text-red-500">{errors.performanceFee}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    You'll earn this percentage of profits generated for your copiers
                  </p>
                </div>
              </div>
            </div>

            {/* Trading Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Trading Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trading Strategy *
                  </label>
                  <textarea
                    value={formData.strategy}
                    onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800
                      text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500
                      ${errors.strategy ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    rows={3}
                    placeholder="Describe your trading strategy and approach..."
                  />
                  {errors.strategy && (
                    <p className="mt-1 text-sm text-red-500">{errors.strategy}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trading Experience *
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800
                      text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500
                      ${errors.experience ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="e.g., 5 years in crypto, 10 years in traditional markets"
                  />
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-500">{errors.experience}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Risk Management
                    </label>
                    <input
                      type="text"
                      value={formData.riskManagement}
                      onChange={(e) => setFormData({ ...formData, riskManagement: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Max 2% risk per trade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Monthly Return
                    </label>
                    <input
                      type="text"
                      value={formData.targetReturn}
                      onChange={(e) => setFormData({ ...formData, targetReturn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 10-20%"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Social Links
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Twitter className="inline w-4 h-4 mr-1" />
                    Twitter Username
                  </label>
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="@username (without @)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Send className="inline w-4 h-4 mr-1" />
                    Telegram Username
                  </label>
                  <input
                    type="text"
                    value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MessageCircle className="inline w-4 h-4 mr-1" />
                    Discord Username
                  </label>
                  <input
                    type="text"
                    value={formData.discord}
                    onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="username#1234"
                  />
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    Important Notice
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    By registering as a trader, you agree to:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                    <li>Trade responsibly and in good faith for your copiers</li>
                    <li>Maintain transparent communication about your strategy</li>
                    <li>Not engage in wash trading or market manipulation</li>
                    <li>Accept that past performance doesn't guarantee future results</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/traders')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                disabled={!isConnected}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                {!isConnected ? 'Connect Wallet' : 'Register as Trader'}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="ml-3 text-sm text-red-700 dark:text-red-300">
                    {error.message || 'Failed to register. Please try again.'}
                  </p>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}