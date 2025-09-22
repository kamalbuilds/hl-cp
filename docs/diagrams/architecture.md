# HyperMirror System Architecture

## High-Level System Overview

```mermaid
graph TB
    subgraph "User Layer"
        U1[Trader]
        U2[Copier]
        U3[Cross-Chain User]
    end

    subgraph "Frontend Layer - Next.js 14"
        WEB[Web Application]
        RK[RainbowKit Wallet]
        WAG[Wagmi v2 Hooks]
        WS[WebSocket Client]
    end

    subgraph "Cross-Chain Bridge Layer"
        DBW[deBridge Widget]
        DBA[deBridge API]
        DBP[deBridge Protocol]
    end

    subgraph "HyperEVM Blockchain (Chain ID: 998/999)"
        subgraph "Smart Contract Layer"
            MAIN[HyperCoreCopyTrading.sol<br/>0x5FbDB2315678...]
            INTER[Interface Contracts]
        end

        subgraph "HyperCore Integration Layer"
            CW[CoreWriter<br/>0x3333...3333]
            subgraph "Precompiles"
                P800[Position<br/>0x0800]
                P801[Spot Balance<br/>0x0801]
                P802[Vault Equity<br/>0x0802]
                P807[Oracle Price<br/>0x0807]
                P80E[BBO<br/>0x080e]
                P80F[Margin Summary<br/>0x080F]
            end
        end
    end

    subgraph "HyperCore L1 Backend"
        HL1[HyperCore L1]
        ORD[Order Engine]
        POS[Position Engine]
        ORA[Oracle System]
        LIQ[Liquidity Engine]
    end

    subgraph "External Chains"
        ETH[Ethereum]
        ARB[Arbitrum]
        POLY[Polygon]
        BASE[Base]
        OPT[Optimism]
    end

    %% User interactions
    U1 --> WEB
    U2 --> WEB
    U3 --> DBW

    %% Frontend connections
    WEB --> RK
    WEB --> WAG
    WEB --> WS
    RK --> MAIN

    %% Cross-chain flow
    DBW --> DBA
    DBA --> DBP
    DBP --> MAIN
    ETH --> DBP
    ARB --> DBP
    POLY --> DBP
    BASE --> DBP
    OPT --> DBP

    %% Smart contract interactions
    MAIN --> CW
    MAIN --> P800
    MAIN --> P801
    MAIN --> P802
    MAIN --> P807
    MAIN --> P80E
    MAIN --> P80F

    %% HyperCore L1 connections
    CW --> HL1
    P800 --> POS
    P801 --> POS
    P802 --> POS
    P807 --> ORA
    P80E --> LIQ
    P80F --> POS
    HL1 --> ORD
    HL1 --> POS
    HL1 --> ORA
    HL1 --> LIQ

    %% Real-time data flow
    WS --> HL1

    %% Styling
    classDef userLayer fill:#e1f5fe
    classDef frontendLayer fill:#f3e5f5
    classDef bridgeLayer fill:#fff3e0
    classDef contractLayer fill:#e8f5e8
    classDef hypercoreLayer fill:#fce4ec
    classDef l1Layer fill:#fff8e1
    classDef externalLayer fill:#f1f8e9

    class U1,U2,U3 userLayer
    class WEB,RK,WAG,WS frontendLayer
    class DBW,DBA,DBP bridgeLayer
    class MAIN,INTER contractLayer
    class CW,P800,P801,P802,P807,P80E,P80F hypercoreLayer
    class HL1,ORD,POS,ORA,LIQ l1Layer
    class ETH,ARB,POLY,BASE,OPT externalLayer
```

## Component Details

### Frontend Application (Next.js 14)
- **Web Application**: Main user interface for traders and copiers
- **RainbowKit**: Wallet connection and management
- **Wagmi v2**: Ethereum interaction hooks and utilities
- **WebSocket Client**: Real-time data streaming from HyperCore

### Smart Contract Layer
- **HyperCoreCopyTrading.sol**: Main copy trading contract deployed at `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Interface Contracts**: IL1Read.sol and ICoreWriter.sol for HyperCore integration

### HyperCore Integration
- **CoreWriter (0x3333...3333)**: Gateway for sending actions to HyperCore L1
- **Precompiles**: Direct access to HyperCore state and functionality

### Cross-Chain Infrastructure
- **deBridge Protocol**: Decentralized cross-chain bridging
- **deBridge Widget**: Embedded UI for seamless bridging experience
- **Multi-Chain Support**: Ethereum, Arbitrum, Polygon, Base, Optimism

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant C as Contract
    participant HC as HyperCore
    participant L1 as L1 Backend

    Note over U,L1: Real-time Price Feed
    L1->>HC: Market Data
    HC->>F: WebSocket Stream
    F->>U: Live Prices

    Note over U,L1: Order Placement
    U->>F: Place Order
    F->>C: Contract Call
    C->>HC: CoreWriter Action
    HC->>L1: Execute Order
    L1-->>HC: Order Status
    HC-->>C: Event Emission
    C-->>F: Transaction Receipt
    F-->>U: Confirmation

    Note over U,L1: Position Monitoring
    loop Every 2 seconds
        F->>HC: Read Precompiles
        HC->>F: Position Data
        F->>U: Update UI
    end
```

## Network Configuration

### HyperEVM Networks
- **Testnet**: Chain ID 998, RPC: `https://rpc.hyperliquid-testnet.xyz/evm`
- **Mainnet**: Chain ID 999, RPC: `https://rpc.hyperliquid.xyz/evm`

### Supported External Chains
- Ethereum (Chain ID: 1)
- Arbitrum One (Chain ID: 42161)
- Polygon (Chain ID: 137)
- Base (Chain ID: 8453)
- Optimism (Chain ID: 10)

## Security Architecture

```mermaid
graph TD
    subgraph "Security Layers"
        AC[Access Control]
        RG[ReentrancyGuard]
        PS[Pausable]
        OZ[OpenZeppelin]
    end

    subgraph "Risk Management"
        FL[Fee Limits]
        AL[Amount Limits]
        LL[Leverage Limits]
        RL[Rate Limiting]
    end

    subgraph "Validation"
        IV[Input Validation]
        SV[State Validation]
        AV[Action Validation]
    end

    MAIN --> AC
    MAIN --> RG
    MAIN --> PS
    MAIN --> OZ
    MAIN --> FL
    MAIN --> AL
    MAIN --> LL
    MAIN --> RL
    MAIN --> IV
    MAIN --> SV
    MAIN --> AV
```

## Performance Considerations

### Real-time Updates
- **Position Monitoring**: 2-second intervals
- **Price Feeds**: 1-second intervals
- **Order Book**: 500ms intervals
- **WebSocket**: Sub-second latency

### Scalability Features
- **Gas Optimization**: Batch operations where possible
- **State Management**: Efficient storage patterns
- **Event Indexing**: Optimized for quick queries
- **Caching Strategy**: Frontend data caching for improved UX