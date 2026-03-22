import React, { useState } from 'react';

interface CheckoutPageProps {
  assessmentId: string;
  userId: string;
  email: string;
  assessmentSummary?: {
    overallScore: number;
    gapCount: number;
    companyName: string;
  };
}

export default function CheckoutPage({
  assessmentId,
  userId,
  email,
  assessmentSummary,
}: CheckoutPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, assessmentId, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Complete Your Assessment Purchase</h1>

      {assessmentSummary && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Assessment Summary</h2>
          <p><strong>Company:</strong> {assessmentSummary.companyName}</p>
          <p><strong>Compliance Score:</strong> {assessmentSummary.overallScore}%</p>
          <p><strong>Gaps Identified:</strong> {assessmentSummary.gapCount}</p>
        </div>
      )}

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Wtp Navigator Assessment</h2>
        <ul className="space-y-2 mb-4 text-gray-700">
          <li>Full pension transition assessment</li>
          <li>Compliance gap analysis</li>
          <li>Migration plan</li>
          <li>Document generation</li>
          <li>90-day email support</li>
        </ul>
        <div className="text-3xl font-bold text-blue-600 mb-2">€999</div>
        <p className="text-sm text-gray-500">One-time payment · License valid for 1 year</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Redirecting to payment...' : 'Proceed to Payment'}
      </button>

      <div className="mt-6 text-sm text-gray-500 space-y-2">
        <p>
          <a href={`/assessment/${assessmentId}/results`} className="text-blue-600 underline">
            View assessment results
          </a>
        </p>
        <p>
          Need multiple assessments?{' '}
          <a href="/contact?subject=bulk-pricing" className="text-blue-600 underline">
            Contact us for bulk pricing
          </a>
        </p>
      </div>
    </div>
  );
}
