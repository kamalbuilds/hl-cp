# Cross-Chain Onboarding Flow

## Complete Cross-Chain User Journey

```mermaid
graph TD
    subgraph "Source Chains"
        ETH[Ethereum Mainnet<br/>Chain ID: 1]
        ARB[Arbitrum One<br/>Chain ID: 42161]
        POLY[Polygon<br/>Chain ID: 137]
        BASE[Base<br/>Chain ID: 8453]
        OPT[Optimism<br/>Chain ID: 10]
        BSC[BSC<br/>Chain ID: 56]
        AVAX[Avalanche<br/>Chain ID: 43114]
    end

    subgraph "User Onboarding Journey"
        U1[User has Assets<br/>on Source Chain]
        U2[Discovers HyperMirror<br/>Copy Trading Platform]
        U3[Clicks 'Bridge to<br/>HyperEVM' Button]
        U4[deBridge Widget<br/>Opens]
        U5[Select Source Chain<br/>& Asset Amount]
        U6[Review Bridge Quote<br/>Fees & Time Estimate]
        U7[Approve Token<br/>Spending (if needed)]
        U8[Initiate Bridge<br/>Transaction]
        U9[Wait for Bridge<br/>Completion]
        U10[Connect Wallet to<br/>HyperEVM Network]
        U11[Start Copy Trading<br/>on HyperMirror]
    end

    subgraph "deBridge Integration"
        DLN[deBridge DLN Protocol]
        DLNAPI[deBridge API<br/>api.dln.trade/v1.0]
        WIDGET[deBridge Widget<br/>app.dln.trade]
        QUOTE[Bridge Quote<br/>Engine]
        VAL[Cross-Chain<br/>Validator Network]
        EXEC[Order Execution<br/>Engine]
    end

    subgraph "HyperEVM Destination"
        HNET[HyperEVM Network<br/>Chain ID: 998/999]
        HWALLET[User Wallet<br/>on HyperEVM]
        HBALANCE[ETH Balance<br/>on HyperEVM]
        HPLATFORM[HyperMirror<br/>Platform Access]
    end

    %% Source chain connections
    ETH --> U1
    ARB --> U1
    POLY --> U1
    BASE --> U1
    OPT --> U1
    BSC --> U1
    AVAX --> U1

    %% User journey flow
    U1 --> U2 --> U3 --> U4 --> U5 --> U6 --> U7 --> U8 --> U9 --> U10 --> U11

    %% deBridge integration
    U4 --> WIDGET
    U5 --> QUOTE
    U6 --> DLNAPI
    U8 --> DLN
    DLN --> VAL
    VAL --> EXEC
    EXEC --> HNET

    %% HyperEVM destination
    U9 --> HNET
    U10 --> HWALLET
    HWALLET --> HBALANCE
    U11 --> HPLATFORM

    %% Styling
    classDef sourceChain fill:#e3f2fd
    classDef userJourney fill:#f3e5f5
    classDef debridgeIntegration fill:#fff3e0
    classDef hyperevmDestination fill:#e8f5e8

    class ETH,ARB,POLY,BASE,OPT,BSC,AVAX sourceChain
    class U1,U2,U3,U4,U5,U6,U7,U8,U9,U10,U11 userJourney
    class DLN,DLNAPI,WIDGET,QUOTE,VAL,EXEC debridgeIntegration
    class HNET,HWALLET,HBALANCE,HPLATFORM hyperevmDestination
```

## Detailed Bridge Transaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Wallet
    participant DBW as deBridge Widget
    participant DBA as deBridge API
    participant SC as Source Chain
    participant DBP as deBridge Protocol
    participant HE as HyperEVM
    participant HM as HyperMirror

    Note over U,HM: Cross-Chain Bridge Process

    U->>DBW: Open Bridge Widget
    DBW->>DBA: Request supported chains & tokens
    DBA-->>DBW: Return chain/token list

    U->>DBW: Select source chain & amount
    DBW->>DBA: Request bridge quote
    DBA->>DBA: Calculate fees & route
    DBA-->>DBW: Return quote details

    Note over DBW: Display: Amount, Fees, Time Estimate
    U->>DBW: Confirm bridge transaction

    alt If ERC-20 Token
        DBW->>W: Request token approval
        W->>SC: Approve token spending
        SC-->>W: Approval confirmed
    end

    DBW->>W: Request bridge transaction
    W->>SC: Submit bridge transaction
    SC->>DBP: Lock tokens in bridge contract

    Note over DBP: Cross-Chain Validation
    DBP->>DBP: Validate transaction
    DBP->>DBP: Generate cross-chain proof

    DBP->>HE: Submit unlock transaction
    HE->>HE: Verify proof & unlock ETH
    HE-->>DBP: Confirm unlock

    DBP-->>U: Bridge completion notification

    Note over U,HM: Platform Access
    U->>HM: Connect wallet to HyperEVM
    HM->>HE: Check ETH balance
    HE-->>HM: Return balance
    HM-->>U: Display available balance

    U->>HM: Start copy trading
```

## Asset Bridge Mapping

```mermaid
graph LR
    subgraph "Source Assets"
        ETHM[ETH on Ethereum]
        ETHARB[ETH on Arbitrum]
        ETHPOLY[ETH on Polygon]
        ETHBASE[ETH on Base]
        ETHOPT[ETH on Optimism]
        USDCETH[USDC on Ethereum]
        USDCARB[USDC on Arbitrum]
        USDTETH[USDT on Ethereum]
        WBTCETH[WBTC on Ethereum]
    end

    subgraph "deBridge Protocol"
        DBP[Cross-Chain<br/>Bridge Engine]
    end

    subgraph "Destination Asset"
        ETHHYPER[ETH on HyperEVM<br/>Native Currency]
    end

    %% Bridge mappings
    ETHM --> DBP
    ETHARB --> DBP
    ETHPOLY --> DBP
    ETHBASE --> DBP
    ETHOPT --> DBP
    USDCETH --> DBP
    USDCARB --> DBP
    USDTETH --> DBP
    WBTCETH --> DBP

    DBP --> ETHHYPER

    %% Styling
    classDef sourceAsset fill:#e3f2fd
    classDef bridge fill:#fff3e0
    classDef destAsset fill:#e8f5e8

    class ETHM,ETHARB,ETHPOLY,ETHBASE,ETHOPT,USDCETH,USDCARB,USDTETH,WBTCETH sourceAsset
    class DBP bridge
    class ETHHYPER destAsset
```

## Wallet Connection Flow

```mermaid
graph TD
    subgraph "Wallet Connection States"
        WS1[User Visits Platform]
        WS2[Detect Current Network]
        WS3{On HyperEVM?}
        WS4[Display 'Connect Wallet']
        WS5[Display 'Switch Network']
        WS6[RainbowKit Modal]
        WS7[Select Wallet Provider]
        WS8[Wallet Connection]
        WS9[Network Switch Request]
        WS10[Add HyperEVM Network]
        WS11[Wallet Connected<br/>to HyperEVM]
        WS12[Platform Access Granted]
    end

    subgraph "Network Configuration"
        NC1[HyperEVM Testnet<br/>Chain ID: 998]
        NC2[RPC: rpc.hyperliquid-testnet.xyz]
        NC3[Explorer: explorer.hyperliquid-testnet.xyz]
        NC4[Native Currency: ETH]
        NC5[Block Time: ~1 second]
    end

    %% Flow connections
    WS1 --> WS2 --> WS3
    WS3 -->|Yes| WS4 --> WS6
    WS3 -->|No| WS5 --> WS6
    WS6 --> WS7 --> WS8
    WS8 --> WS9 --> WS10 --> WS11 --> WS12

    %% Network config
    WS10 --> NC1
    NC1 --> NC2 --> NC3 --> NC4 --> NC5

    %% Styling
    classDef walletFlow fill:#f3e5f5
    classDef networkConfig fill:#e8f5e8

    class WS1,WS2,WS3,WS4,WS5,WS6,WS7,WS8,WS9,WS10,WS11,WS12 walletFlow
    class NC1,NC2,NC3,NC4,NC5 networkConfig
```

## Cross-Chain Fee Structure

```mermaid
graph TD
    subgraph "Fee Components"
        F1[Source Chain<br/>Gas Fee]
        F2[deBridge Protocol<br/>Bridge Fee]
        F3[Destination Chain<br/>Gas Fee]
        F4[slippage<br/>Protection]
    end

    subgraph "Fee Calculation"
        FC1[Base Bridge Fee<br/>~0.1-0.3%]
        FC2[Network Gas Costs<br/>Variable by Chain]
        FC3[Bridge Liquidity<br/>Supply/Demand]
        FC4[Route Optimization<br/>Single vs Multi-hop]
    end

    subgraph "Total Cost Example"
        TC1[ETH → HyperEVM<br/>~$5-15 USD]
        TC2[USDC → HyperEVM<br/>~$10-25 USD]
        TC3[Multi-hop Routes<br/>Higher fees]
        TC4[Express vs Economy<br/>Speed vs Cost]
    end

    %% Connections
    F1 --> FC2
    F2 --> FC1
    F3 --> FC2
    F4 --> FC3

    FC1 --> TC1
    FC2 --> TC1
    FC3 --> TC2
    FC4 --> TC3

    %% Styling
    classDef feeComponent fill:#ffebee
    classDef calculation fill:#e8eaf6
    classDef example fill:#e0f2f1

    class F1,F2,F3,F4 feeComponent
    class FC1,FC2,FC3,FC4 calculation
    class TC1,TC2,TC3,TC4 example
```

## Bridge Status Monitoring

```mermaid
stateDiagram-v2
    [*] --> Initiated: User starts bridge

    Initiated --> Pending: Transaction submitted
    Pending --> SourceConfirmed: Source tx confirmed
    SourceConfirmed --> Validating: Cross-chain validation
    Validating --> DestPending: Destination tx submitted
    DestPending --> Completed: Destination tx confirmed

    Pending --> Failed: Source tx failed
    Validating --> Failed: Validation failed
    DestPending --> Failed: Destination tx failed

    Failed --> Refund: Auto-refund process
    Refund --> [*]: Funds returned

    Completed --> [*]: Bridge successful

    note right of Initiated
        Display:
        - Transaction hash
        - Estimated time
        - Progress indicator
    end note

    note right of Validating
        Process:
        - Cross-chain proof
        - Validator consensus
        - Security checks
    end note

    note right of Completed
        Actions:
        - Update UI
        - Refresh balance
        - Enable platform
    end note
```

## Integration Points

### Frontend Integration
```typescript
// deBridge Widget Integration
const debridgeWidget = {
  chainId: 998, // HyperEVM Testnet
  targetChainId: 998,
  defaultInputToken: "0x0000000000000000000000000000000000000000", // ETH
  defaultOutputToken: "0x0000000000000000000000000000000000000000", // ETH
  theme: "dark",
  onOrderCreated: (order) => {
    // Track bridge transaction
    trackBridgeTransaction(order);
  },
  onOrderCompleted: (order) => {
    // Refresh user balance
    refreshBalance();
    // Show success notification
    showBridgeSuccess();
  }
};
```

### API Endpoints
- **Bridge Quote**: `/api/bridge/quote` - Get bridge cost estimate
- **Bridge Status**: `/api/bridge/status/:txHash` - Check bridge progress
- **Supported Chains**: `/api/bridge/chains` - List available source chains
- **Bridge History**: `/api/bridge/history/:address` - User bridge transactions

### Risk Considerations
1. **Bridge Delays**: Cross-chain transactions can take 2-30 minutes
2. **Failed Transactions**: Auto-refund mechanisms in place
3. **Slippage Protection**: Price impact limits during bridging
4. **MEV Protection**: Front-running prevention measures
5. **Emergency Stops**: Circuit breakers for unusual activity

### User Experience Optimizations
1. **Real-time Updates**: WebSocket notifications for bridge status
2. **Mobile Responsive**: Optimized widget for mobile devices
3. **One-Click Bridge**: Minimal steps for common routes
4. **Gas Estimation**: Accurate fee predictions before bridging
5. **Recovery Support**: Help desk for stuck transactions