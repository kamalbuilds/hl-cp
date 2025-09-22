'use client';

import { DeBridgeWidget } from '@/components/trading/deBridgeWidget';

export default function TestWidgetPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          HyperMirror Bridge Widget Test
        </h1>

        <DeBridgeWidget
          destinationChainId={999}
          onSuccess={(txHash) => {
            console.log('Bridge successful! Transaction hash:', txHash);
            alert(`Bridge successful! TX: ${txHash}`);
          }}
          onError={(error) => {
            console.error('Bridge error:', error);
            alert(`Bridge error: ${error}`);
          }}
        />

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Test Instructions
          </h2>
          <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
            <li>The widget should load automatically</li>
            <li>Select source chain (e.g., Arbitrum)</li>
            <li>Enter amount to bridge</li>
            <li>Widget will show HyperEVM as destination</li>
            <li>Check browser console for debug logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}