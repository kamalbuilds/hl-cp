# Smart Contract Architecture

## Contract Hierarchy and Relationships

```mermaid
graph TB
    subgraph "OpenZeppelin Base Contracts"
        OWN[Ownable<br/>Access Control]
        RG[ReentrancyGuard<br/>Reentrancy Protection]
        PAUSE[Pausable<br/>Emergency Stop]
    end

    subgraph "Interface Contracts"
        IL1[IL1Read.sol<br/>L1 Data Structures]
        ICW[ICoreWriter.sol<br/>Action Interface]
    end

    subgraph "Main Contract"
        MAIN[HyperCoreCopyTrading.sol<br/>Core Copy Trading Logic]
    end

    subgraph "External Dependencies"
        PRECOMP[HyperCore Precompiles<br/>0x0800 - 0x080F]
        COREWRITE[CoreWriter<br/>0x3333...3333]
    end

    %% Inheritance relationships
    OWN --> MAIN
    RG --> MAIN
    PAUSE --> MAIN

    %% Interface usage
    IL1 --> MAIN
    ICW --> MAIN

    %% External interactions
    MAIN --> PRECOMP
    MAIN --> COREWRITE

    %% Styling
    classDef baseContract fill:#e3f2fd
    classDef interface fill:#f3e5f5
    classDef mainContract fill:#e8f5e8
    classDef external fill:#fff3e0

    class OWN,RG,PAUSE baseContract
    class IL1,ICW interface
    class MAIN mainContract
    class PRECOMP,COREWRITE external
```

## Contract State Variables Architecture

```mermaid
graph TD
    subgraph "Core Data Structures"
        DS1[Trader Struct<br/>- isActive: bool<br/>- name: string<br/>- bio: string<br/>- performanceFee: uint256<br/>- minCopyAmount: uint256<br/>- maxCopyAmount: uint256<br/>- totalCopiers: uint256<br/>- totalVolume: uint256<br/>- totalPnL: int256<br/>- copiers: mapping<br/>- copierList: address[]<br/>- lastTradeTimestamp: uint256]

        DS2[CopyPosition Struct<br/>- isActive: bool<br/>- allocatedAmount: uint256<br/>- leverage: uint256<br/>- copyPerps: bool<br/>- copySpot: bool<br/>- unrealizedPnL: int256<br/>- copiedSince: uint256]

        DS3[Order Struct<br/>- asset: uint32<br/>- isBuy: bool<br/>- limitPx: uint64<br/>- size: uint64<br/>- reduceOnly: bool<br/>- tif: uint8<br/>- cloid: uint128<br/>- trader: address<br/>- timestamp: uint256]
    end

    subgraph "State Mappings"
        SM1[traders<br/>mapping(address => Trader)]
        SM2[orders<br/>mapping(uint128 => Order)]
        SM3[lastKnownPositions<br/>mapping(address => mapping(uint32 => Position))]
    end

    subgraph "Global State"
        GS1[allTraders: address[]]
        GS2[nextCloid: uint128]
        GS3[platformFee: uint256]
        GS4[feeRecipient: address]
    end

    %% Relationships
    DS1 --> SM1
    DS2 --> SM1
    DS3 --> SM2
    SM1 --> GS1
    SM2 --> GS2

    %% Styling
    classDef dataStruct fill:#e3f2fd
    classDef stateMapping fill:#f3e5f5
    classDef globalState fill:#e8f5e8

    class DS1,DS2,DS3 dataStruct
    class SM1,SM2,SM3 stateMapping
    class GS1,GS2,GS3,GS4 globalState
```

## Function Architecture by Category

```mermaid
graph TD
    subgraph "Trader Management Functions"
        TM1[registerAsTrader<br/>- Validate parameters<br/>- Create trader profile<br/>- Emit events]
        TM2[updateTraderInfo<br/>- Modify trader settings<br/>- Validate changes]
        TM3[getTraderInfo<br/>- Return trader data<br/>- Public view function]
    end

    subgraph "Copy Trading Functions"
        CT1[startCopying<br/>- Validate trader<br/>- Check amounts<br/>- Create position<br/>- Transfer funds]
        CT2[stopCopying<br/>- Settle PnL<br/>- Return funds<br/>- Update state]
        CT3[getCopyPosition<br/>- View copy details<br/>- Public access]
    end

    subgraph "HyperCore Trading Functions"
        HT1[placeLimitOrder<br/>- Validate order<br/>- Encode action<br/>- Send to CoreWriter<br/>- Copy for followers]
        HT2[cancelOrder<br/>- Validate ownership<br/>- Encode cancel action<br/>- Update state]
        HT3[transferToVault<br/>- Validate trader<br/>- Encode vault action]
    end

    subgraph "Position Reading Functions"
        PR1[getTraderPosition<br/>- Call position precompile<br/>- Return structured data]
        PR2[getOraclePrice<br/>- Call oracle precompile<br/>- Format price data]
        PR3[getBestBidOffer<br/>- Call BBO precompile<br/>- Return market data]
        PR4[getAccountMargin<br/>- Call margin precompile<br/>- Calculate ratios]
    end

    subgraph "Internal Functions"
        IF1[_copyTradeForCopiers<br/>- Calculate proportions<br/>- Generate copy orders<br/>- Handle failures]
        IF2[_settlePnL<br/>- Calculate fees<br/>- Distribute profits<br/>- Update balances]
    end

    subgraph "Admin Functions"
        AF1[setPlatformFee<br/>- Owner only<br/>- Validate limits]
        AF2[setFeeRecipient<br/>- Owner only<br/>- Update recipient]
        AF3[pause/unpause<br/>- Emergency controls]
    end

    %% Function flow relationships
    TM1 --> CT1
    CT1 --> HT1
    HT1 --> IF1
    IF1 --> IF2
    CT2 --> IF2

    %% Styling
    classDef traderMgmt fill:#e3f2fd
    classDef copyTrading fill:#f3e5f5
    classDef hyperCore fill:#e8f5e8
    classDef positionRead fill:#fff3e0
    classDef internal fill:#fce4ec
    classDef admin fill:#ffebee

    class TM1,TM2,TM3 traderMgmt
    class CT1,CT2,CT3 copyTrading
    class HT1,HT2,HT3 hyperCore
    class PR1,PR2,PR3,PR4 positionRead
    class IF1,IF2 internal
    class AF1,AF2,AF3 admin
```

## Event Architecture and Flow

```mermaid
graph LR
    subgraph "Trader Events"
        TE1[TraderRegistered<br/>- trader address<br/>- name<br/>- performance fee]
        TE2[TraderUpdated<br/>- trader address<br/>- new settings]
    end

    subgraph "Copy Events"
        CE1[CopyingStarted<br/>- copier address<br/>- trader address<br/>- amount<br/>- leverage]
        CE2[CopyingStopped<br/>- copier address<br/>- trader address]
    end

    subgraph "Trading Events"
        TR1[OrderPlaced<br/>- trader address<br/>- cloid<br/>- asset<br/>- buy/sell<br/>- size<br/>- price]
        TR2[OrderCancelled<br/>- trader address<br/>- cloid]
        TR3[PositionCopied<br/>- copier address<br/>- trader address<br/>- asset<br/>- buy/sell<br/>- size]
    end

    subgraph "Financial Events"
        FE1[PnLRealized<br/>- trader address<br/>- copier address<br/>- pnl amount<br/>- performance fee]
    end

    subgraph "Event Consumers"
        EC1[Frontend UI<br/>Real-time updates]
        EC2[Analytics Service<br/>Performance tracking]
        EC3[Notification System<br/>User alerts]
        EC4[Indexing Service<br/>Historical data]
    end

    %% Event flow
    TE1 --> EC1
    TE1 --> EC2
    CE1 --> EC1
    CE1 --> EC3
    TR1 --> EC1
    TR1 --> EC4
    TR3 --> EC1
    TR3 --> EC3
    FE1 --> EC1
    FE1 --> EC2

    %% Styling
    classDef traderEvent fill:#e3f2fd
    classDef copyEvent fill:#f3e5f5
    classDef tradingEvent fill:#e8f5e8
    classDef financialEvent fill:#fff3e0
    classDef consumer fill:#fce4ec

    class TE1,TE2 traderEvent
    class CE1,CE2 copyEvent
    class TR1,TR2,TR3 tradingEvent
    class FE1 financialEvent
    class EC1,EC2,EC3,EC4 consumer
```

## Access Control and Security Model

```mermaid
graph TD
    subgraph "Role-Based Access Control"
        RAC1[Contract Owner<br/>- Platform administration<br/>- Fee management<br/>- Emergency controls]
        RAC2[Registered Traders<br/>- Place/cancel orders<br/>- Vault operations<br/>- Update profiles]
        RAC3[Active Copiers<br/>- Start/stop copying<br/>- View positions<br/>- Withdraw funds]
        RAC4[Public Users<br/>- View trader data<br/>- Read positions<br/>- Check prices]
    end

    subgraph "Function Modifiers"
        FM1[onlyOwner<br/>- Admin functions only]
        FM2[nonReentrant<br/>- Prevent reentrancy attacks]
        FM3[whenNotPaused<br/>- Respect pause state]
        FM4[Custom Validations<br/>- Trader/copier checks]
    end

    subgraph "Validation Layers"
        VL1[Input Validation<br/>- Parameter bounds<br/>- Address checks<br/>- Amount limits]
        VL2[State Validation<br/>- Contract state checks<br/>- User state validation]
        VL3[Business Logic<br/>- Trading rules<br/>- Fee calculations<br/>- Risk management]
    end

    subgraph "Security Features"
        SF1[ReentrancyGuard<br/>- Prevent recursive calls]
        SF2[Pausable<br/>- Emergency stop mechanism]
        SF3[SafeMath Operations<br/>- Overflow protection]
        SF4[External Call Safety<br/>- Proper error handling]
    end

    %% Access flow
    RAC1 --> FM1
    RAC2 --> FM4
    RAC3 --> FM4
    RAC4 --> VL1

    %% Protection layers
    FM1 --> VL1
    FM2 --> VL2
    FM3 --> VL3
    FM4 --> VL3

    VL1 --> SF1
    VL2 --> SF2
    VL3 --> SF3
    SF1 --> SF4

    %% Styling
    classDef accessControl fill:#e3f2fd
    classDef modifier fill:#f3e5f5
    classDef validation fill:#e8f5e8
    classDef security fill:#ffebee

    class RAC1,RAC2,RAC3,RAC4 accessControl
    class FM1,FM2,FM3,FM4 modifier
    class VL1,VL2,VL3 validation
    class SF1,SF2,SF3,SF4 security
```

## Gas Optimization Patterns

```mermaid
graph TD
    subgraph "Storage Optimization"
        SO1[Struct Packing<br/>- Order struct optimized<br/>- Position struct packed<br/>- Minimize storage slots]
        SO2[Mapping Efficiency<br/>- Nested mappings<br/>- Array vs mapping trade-offs]
        SO3[State Variable Layout<br/>- Frequently accessed first<br/>- Pack related variables]
    end

    subgraph "Computational Optimization"
        CO1[Batch Operations<br/>- Copy multiple orders<br/>- Batch state updates]
        CO2[Early Returns<br/>- Fail fast validation<br/>- Skip unnecessary computation]
        CO3[Memory vs Storage<br/>- Use memory for temp data<br/>- Cache storage reads]
    end

    subgraph "External Call Optimization"
        EC1[Precompile Efficiency<br/>- Single calls per update<br/>- Batch read operations]
        EC2[CoreWriter Batching<br/>- Minimize L1 calls<br/>- Efficient encoding]
        EC3[Event Optimization<br/>- Indexed parameters<br/>- Minimal data in events]
    end

    subgraph "Loop Optimization"
        LO1[Copier Iteration<br/>- Break on conditions<br/>- Limit iterations<br/>- Gas-aware loops]
        LO2[Array Management<br/>- Avoid large arrays<br/>- Efficient deletion]
    end

    %% Optimization relationships
    SO1 --> CO1
    SO2 --> CO2
    SO3 --> CO3
    CO1 --> EC1
    CO2 --> EC2
    CO3 --> EC3
    EC1 --> LO1
    EC2 --> LO2

    %% Styling
    classDef storage fill:#e3f2fd
    classDef computation fill:#f3e5f5
    classDef external fill:#e8f5e8
    classDef loops fill:#fff3e0

    class SO1,SO2,SO3 storage
    class CO1,CO2,CO3 computation
    class EC1,EC2,EC3 external
    class LO1,LO2 loops
```

## Error Handling Strategy

```mermaid
graph TD
    subgraph "Error Categories"
        EC1[Input Errors<br/>- Invalid parameters<br/>- Out of bounds values<br/>- Malformed data]
        EC2[State Errors<br/>- Unauthorized access<br/>- Invalid state transitions<br/>- Insufficient funds]
        EC3[External Errors<br/>- Precompile failures<br/>- CoreWriter errors<br/>- Network issues]
        EC4[Business Logic Errors<br/>- Trading rule violations<br/>- Risk limit breaches<br/>- Fee calculation errors]
    end

    subgraph "Error Handling Mechanisms"
        EH1[require() Statements<br/>- Immediate validation<br/>- Clear error messages<br/>- Gas efficient]
        EH2[try/catch Blocks<br/>- External call safety<br/>- Graceful degradation]
        EH3[Custom Errors<br/>- Gas efficient errors<br/>- Structured error data]
        EH4[Event Logging<br/>- Error event emission<br/>- Debug information]
    end

    subgraph "Recovery Strategies"
        RS1[State Rollback<br/>- Atomic operations<br/>- Consistent state]
        RS2[Partial Execution<br/>- Continue on failures<br/>- Batch operation safety]
        RS3[Circuit Breakers<br/>- Pause functionality<br/>- Emergency stops]
        RS4[User Notification<br/>- Clear error messages<br/>- Action guidance]
    end

    %% Error flow
    EC1 --> EH1
    EC2 --> EH1
    EC3 --> EH2
    EC4 --> EH3

    EH1 --> RS1
    EH2 --> RS2
    EH3 --> RS3
    EH4 --> RS4

    %% Styling
    classDef errorCategory fill:#ffebee
    classDef errorHandling fill:#fff3e0
    classDef recovery fill:#e8f5e8

    class EC1,EC2,EC3,EC4 errorCategory
    class EH1,EH2,EH3,EH4 errorHandling
    class RS1,RS2,RS3,RS4 recovery
```

## Upgrade Strategy and Modularity

```mermaid
graph TD
    subgraph "Current Architecture"
        CA1[Monolithic Contract<br/>HyperCoreCopyTrading.sol]
        CA2[Fixed Deployment<br/>Immutable once deployed]
        CA3[State Migration<br/>Manual process if needed]
    end

    subgraph "Future Modularity Options"
        FM1[Proxy Pattern<br/>- Upgradeable logic<br/>- Persistent state<br/>- Admin controls]
        FM2[Module System<br/>- Separate trading logic<br/>- Independent fee modules<br/>- Plugin architecture]
        FM3[Factory Pattern<br/>- Deploy new versions<br/>- Migrate users<br/>- Parallel operation]
    end

    subgraph "State Preservation"
        SP1[Data Migration<br/>- Export trader data<br/>- Transfer positions<br/>- Preserve history]
        SP2[Gradual Migration<br/>- Phase out old contract<br/>- Incentivize migration<br/>- Maintain compatibility]
        SP3[Backup Systems<br/>- Event logs<br/>- External indexing<br/>- Recovery mechanisms]
    end

    %% Evolution path
    CA1 --> FM1
    CA2 --> FM2
    CA3 --> FM3

    FM1 --> SP1
    FM2 --> SP2
    FM3 --> SP3

    %% Styling
    classDef current fill:#e3f2fd
    classDef future fill:#f3e5f5
    classDef preservation fill:#e8f5e8

    class CA1,CA2,CA3 current
    class FM1,FM2,FM3 future
    class SP1,SP2,SP3 preservation
```

## Integration Testing Architecture

```mermaid
graph LR
    subgraph "Unit Tests"
        UT1[Trader Registration<br/>- Valid parameters<br/>- Invalid inputs<br/>- Edge cases]
        UT2[Copy Trading Logic<br/>- Start/stop copying<br/>- Amount validation<br/>- State transitions]
        UT3[Order Placement<br/>- Valid orders<br/>- Copy generation<br/>- Error handling]
    end

    subgraph "Integration Tests"
        IT1[HyperCore Integration<br/>- Precompile interactions<br/>- CoreWriter calls<br/>- L1 backend simulation]
        IT2[End-to-End Flows<br/>- Complete trading flows<br/>- Multi-user scenarios<br/>- Real-time updates]
        IT3[Error Scenarios<br/>- Network failures<br/>- Invalid states<br/>- Recovery testing]
    end

    subgraph "Performance Tests"
        PT1[Gas Usage<br/>- Function gas costs<br/>- Optimization validation<br/>- Regression testing]
        PT2[Scalability<br/>- Multiple copiers<br/>- High-frequency trading<br/>- Memory usage]
        PT3[Load Testing<br/>- Concurrent operations<br/>- Stress scenarios<br/>- Failure points]
    end

    %% Test progression
    UT1 --> IT1
    UT2 --> IT2
    UT3 --> IT3
    IT1 --> PT1
    IT2 --> PT2
    IT3 --> PT3

    %% Styling
    classDef unit fill:#e3f2fd
    classDef integration fill:#f3e5f5
    classDef performance fill:#e8f5e8

    class UT1,UT2,UT3 unit
    class IT1,IT2,IT3 integration
    class PT1,PT2,PT3 performance
```

This comprehensive contract architecture provides a robust, secure, and efficient foundation for the HyperMirror copy trading platform while maintaining clear separation of concerns and scalability for future enhancements.