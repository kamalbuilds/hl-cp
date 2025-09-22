'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

declare global {
  interface Window {
    deBridge: any;
  }
}

export function DeBridgeWidget() {
  const { address, connector } = useAccount();
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    let isComponentMounted = true;
    const scriptId = 'debridge-widget-script';

    const init = async () => {
      if (!isComponentMounted || widgetRef.current || !window.deBridge) {
        return;
      }

      const widgetElement = document.getElementById('debridgeWidget');
      if (!widgetElement) return;

      console.log('Initializing deBridge widget for address:', address);

      widgetRef.current = await window.deBridge.widget({
          "v": "1",
        "element": "debridgeWidget",
        "title": "HyperMirror Bridge",
        "description": "Bridge assets to HyperEVM",
          "width": "100%",
        "height": "500px", // Adjusted for better embedding
        "r": 16090, // Referral code
          "supportedChains": JSON.stringify({
            "inputChains": {
            "1": "all", "10": "all", "56": "all", "137": "all", 
            "8453": "all", "42161": "all", "43114": "all", "7565164": "all"
          },
          "outputChains": {"999": "all"} // HyperEVM mainnet
        }),
        "inputChain": 8453, // Default to Base
        "outputChain": 999,
          "inputCurrency": "",
        "outputCurrency": "",
        "address": address,
          "showSwapTransfer": true,
        "amount": "",
          "outputAmount": "",
          "isAmountFromNotModifiable": false,
          "isAmountToNotModifiable": false,
          "lang": "en",
          "mode": "deswap",
          "isEnableCalldata": false,
        "theme": "dark",
        "isHideLogo": true,
        "logo": "",
          "primaryColor": "288",
          "secondaryColor": "17",
          "textColor": "100",
          "backgroundColor": "7",
          "borderRadius": 8,
      });

      if (connector && widgetRef.current) {
        try {
            const provider = await connector.getProvider();
            widgetRef.current.setExternalEVMWallet({
              provider,
              name: connector.name,
            });
        } catch (e) {
            console.error("Could not get provider from connector", e);
        }
      }
    };

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://app.debridge.finance/assets/scripts/widget.js';
      script.id = scriptId;
      script.async = true;
      script.onload = init;
      document.body.appendChild(script);
    } else if (window.deBridge) {
      init();
    } else {
      existingScript.addEventListener('load', init);
    }

    return () => {
      isComponentMounted = false;
      const script = document.getElementById(scriptId);
      if (script) {
        script.removeEventListener('load', init);
      }
      
      const widgetElement = document.getElementById('debridgeWidget');
      if (widgetElement) {
        widgetElement.innerHTML = '';
      }
      widgetRef.current = null;
    };
  }, [address, connector]);

  return <div id="debridgeWidget" className="min-h-[500px]"></div>;
};